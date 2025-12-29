import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Chip } from 'primeng/chip';
import { TooltipModule } from 'primeng/tooltip';
import { RoleService } from '../role.service';
import { TenantRole } from '../role.model';
import { RoleFormComponent } from '../role-form/role-form.component';
import { ToastService } from '../../../../../core/services/toast.service';
import { ConfirmService } from '../../../../../core/services/confirm.service';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    Button,
    Dialog,
    Chip,
    TooltipModule,
    RoleFormComponent,
  ],
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class RoleListComponent implements OnInit {
  roles: TenantRole[] = [];
  loading = false;
  formVisible = false;
  editingRole: TenantRole | null = null;
  searchTerm = '';

  constructor(
    private roleService: RoleService,
    private toastService: ToastService,
    private confirmService: ConfirmService
  ) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading = true;
    this.roleService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) this.roles = res.data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.toastService.showError('Error', err.error?.message || 'Failed to load roles');
      },
    });
  }

  openForm(role?: TenantRole): void {
    this.editingRole = role || null;
    this.formVisible = true;
  }

  closeForm(): void {
    this.formVisible = false;
    this.editingRole = null;
  }

  onSave(data: any): void {
    const obs = this.editingRole
      ? this.roleService.update(this.editingRole.id, data)
      : this.roleService.create(data);

    obs.subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.showSuccess(
            'Success',
            this.editingRole ? 'Role updated' : 'Role created'
          );
          this.closeForm();
          this.loadRoles();
        }
      },
      error: (err) =>
        this.toastService.showError('Error', err.error?.message || 'Operation failed'),
    });
  }

  confirmDelete(role: TenantRole): void {
    this.confirmService.confirmDelete(`role "${role.name}"`).then((confirmed) => {
      if (confirmed) {
        this.roleService.delete(role.id).subscribe({
          next: (res) => {
            if (res.success) {
              this.toastService.showSuccess('Success', 'Role deleted');
              this.loadRoles();
            }
          },
          error: (err) =>
            this.toastService.showError('Error', err.error?.message || 'Failed to delete role'),
        });
      }
    });
  }

  onSearch(): void {
    // Filter is applied via getter
  }

  get filteredRoles(): TenantRole[] {
    let filtered = this.roles;

    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (role) =>
          role.name?.toLowerCase().includes(search) ||
          role.description?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }

  get totalCount(): number {
    return this.roles.length;
  }

  get activeCount(): number {
    return this.roles.length;
  }

  get inactiveCount(): number {
    return 0;
  }
}
