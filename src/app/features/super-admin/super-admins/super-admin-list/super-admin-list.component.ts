import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Tag } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { SuperAdminService } from '../super-admin.service';
import { SuperAdmin } from '../super-admin.model';
import { SuperAdminFormComponent } from '../super-admin-form/super-admin-form.component';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmService } from '../../../../core/services/confirm.service';

@Component({
  selector: 'app-super-admin-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    Button,
    Dialog,
    Tag,
    SelectModule,
    TooltipModule,
    SuperAdminFormComponent,
  ],
  templateUrl: './super-admin-list.component.html',
  styleUrls: ['./super-admin-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SuperAdminListComponent implements OnInit {
  admins: SuperAdmin[] = [];
  loading = false;
  formVisible = false;
  editingAdmin: SuperAdmin | null = null;
  searchTerm = '';
  selectedStatus: string | null = null;

  statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ];

  constructor(
    private superAdminService: SuperAdminService,
    private toastService: ToastService,
    private confirmService: ConfirmService
  ) {}

  ngOnInit(): void {
    this.loadAdmins();
  }

  loadAdmins(): void {
    this.loading = true;
    this.superAdminService.getAll().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.admins = response.data;
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.toastService.showError('Error', err.error?.message || 'Failed to load super admins');
      },
    });
  }

  openForm(admin?: SuperAdmin): void {
    this.editingAdmin = admin || null;
    this.formVisible = true;
  }

  closeForm(): void {
    this.formVisible = false;
    this.editingAdmin = null;
  }

  onSave(data: any): void {
    if (this.editingAdmin) {
      this.superAdminService.update(this.editingAdmin.id, data).subscribe({
        next: (response) => {
          if (response.success) {
            this.toastService.showSuccess('Success', 'Super admin updated successfully');
            this.closeForm();
            this.loadAdmins();
          }
        },
        error: (err) => {
          this.toastService.showError(
            'Error',
            err.error?.message || 'Failed to update super admin'
          );
        },
      });
    } else {
      this.superAdminService.create(data).subscribe({
        next: (response) => {
          if (response.success) {
            this.toastService.showSuccess('Success', 'Super admin created successfully');
            this.closeForm();
            this.loadAdmins();
          }
        },
        error: (err) => {
          this.toastService.showError(
            'Error',
            err.error?.message || 'Failed to create super admin'
          );
        },
      });
    }
  }

  confirmDelete(admin: SuperAdmin): void {
    this.confirmService.confirmDelete(`super admin "${admin.email}"`).then((confirmed) => {
      if (confirmed) {
        this.deleteAdmin(admin);
      }
    });
  }

  private deleteAdmin(admin: SuperAdmin): void {
    this.superAdminService.delete(admin.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.showSuccess('Success', 'Super admin deleted successfully');
          this.loadAdmins();
        }
      },
      error: (err) => {
        this.toastService.showError('Error', err.error?.message || 'Failed to delete super admin');
      },
    });
  }

  onSearch(): void {
    // Filter is applied via getter
  }

  onFilter(): void {
    // Filter is applied via getter
  }

  get filteredAdmins(): SuperAdmin[] {
    let filtered = this.admins;

    if (this.selectedStatus) {
      const isActive = this.selectedStatus === 'active';
      filtered = filtered.filter((admin) => admin.isActive === isActive);
    }

    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (admin) =>
          admin.name?.toLowerCase().includes(search) || admin.email?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }

  get totalCount(): number {
    return this.admins.length;
  }

  get activeCount(): number {
    return this.admins.filter((admin) => admin.isActive).length;
  }

  get inactiveCount(): number {
    return this.admins.filter((admin) => !admin.isActive).length;
  }
}
