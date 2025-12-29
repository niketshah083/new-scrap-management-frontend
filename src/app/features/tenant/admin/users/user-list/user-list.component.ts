import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Tag } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { UserService } from '../user.service';
import { TenantUser } from '../user.model';
import { UserFormComponent } from '../user-form/user-form.component';
import { ToastService } from '../../../../../core/services/toast.service';
import { ConfirmService } from '../../../../../core/services/confirm.service';

@Component({
  selector: 'app-user-list',
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
    UserFormComponent,
  ],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class UserListComponent implements OnInit {
  users: TenantUser[] = [];
  loading = false;
  formVisible = false;
  editingUser: TenantUser | null = null;
  searchTerm = '';
  selectedStatus: string | null = null;

  statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ];

  constructor(
    private userService: UserService,
    private toastService: ToastService,
    private confirmService: ConfirmService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) this.users = res.data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.toastService.showError('Error', err.error?.message || 'Failed to load users');
      },
    });
  }

  openForm(user?: TenantUser): void {
    this.editingUser = user || null;
    this.formVisible = true;
  }

  closeForm(): void {
    this.formVisible = false;
    this.editingUser = null;
  }

  onSave(data: any): void {
    const obs = this.editingUser
      ? this.userService.update(this.editingUser.id, data)
      : this.userService.create(data);

    obs.subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.showSuccess(
            'Success',
            this.editingUser ? 'User updated' : 'User created'
          );
          this.closeForm();
          this.loadUsers();
        }
      },
      error: (err) =>
        this.toastService.showError('Error', err.error?.message || 'Operation failed'),
    });
  }

  confirmDelete(user: TenantUser): void {
    this.confirmService.confirmDelete(`user "${user.email}"`).then((confirmed) => {
      if (confirmed) {
        this.userService.delete(user.id).subscribe({
          next: (res) => {
            if (res.success) {
              this.toastService.showSuccess('Success', 'User deleted');
              this.loadUsers();
            }
          },
          error: (err) =>
            this.toastService.showError('Error', err.error?.message || 'Failed to delete user'),
        });
      }
    });
  }

  onSearch(): void {
    // Filter is applied via getter
  }

  onFilter(): void {
    // Filter is applied via getter
  }

  get filteredUsers(): TenantUser[] {
    let filtered = this.users;

    if (this.selectedStatus) {
      const isActive = this.selectedStatus === 'active';
      filtered = filtered.filter((user) => user.isActive === isActive);
    }

    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(search) ||
          user.email?.toLowerCase().includes(search) ||
          user.role?.name?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }

  get totalCount(): number {
    return this.users.length;
  }

  get activeCount(): number {
    return this.users.filter((user) => user.isActive).length;
  }

  get inactiveCount(): number {
    return this.users.filter((user) => !user.isActive).length;
  }
}
