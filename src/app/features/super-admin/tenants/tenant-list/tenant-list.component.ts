import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { TenantService } from '../tenant.service';
import { Tenant, AssignSubscriptionRequest } from '../tenant.model';
import { TenantFormComponent } from '../tenant-form/tenant-form.component';
import { SubscriptionFormComponent } from '../subscription-form/subscription-form.component';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmService } from '../../../../core/services/confirm.service';

@Component({
  selector: 'app-tenant-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    Button,
    Dialog,
    Tag,
    Tooltip,
    SelectModule,
    TenantFormComponent,
    SubscriptionFormComponent,
  ],
  templateUrl: './tenant-list.component.html',
  styleUrls: ['./tenant-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TenantListComponent implements OnInit {
  tenants: Tenant[] = [];
  loading = false;
  formVisible = false;
  subscriptionDialogVisible = false;
  editingTenant: Tenant | null = null;
  selectedTenant: Tenant | null = null;
  searchTerm = '';
  selectedStatus: string | null = null;

  statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ];

  constructor(
    private tenantService: TenantService,
    private toastService: ToastService,
    private confirmService: ConfirmService
  ) {}

  ngOnInit(): void {
    this.loadTenants();
  }

  loadTenants(): void {
    this.loading = true;
    this.tenantService.getAll().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.tenants = response.data;
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.toastService.showError('Error', err.error?.message || 'Failed to load tenants');
      },
    });
  }

  openForm(tenant?: Tenant): void {
    this.editingTenant = tenant || null;
    this.formVisible = true;
  }

  closeForm(): void {
    this.formVisible = false;
    this.editingTenant = null;
  }

  onSave(data: Partial<Tenant>): void {
    if (this.editingTenant) {
      this.tenantService.update(this.editingTenant.id, data).subscribe({
        next: (response) => {
          if (response.success) {
            this.toastService.showSuccess('Success', 'Tenant updated successfully');
            this.closeForm();
            this.loadTenants();
          }
        },
        error: (err) => {
          this.toastService.showError('Error', err.error?.message || 'Failed to update tenant');
        },
      });
    } else {
      this.tenantService.create(data as any).subscribe({
        next: (response) => {
          if (response.success) {
            this.toastService.showSuccess('Success', 'Tenant created successfully');
            this.closeForm();
            this.loadTenants();
          }
        },
        error: (err) => {
          this.toastService.showError('Error', err.error?.message || 'Failed to create tenant');
        },
      });
    }
  }

  confirmDelete(tenant: Tenant): void {
    this.confirmService.confirmDelete(`tenant "${tenant.companyName}"`).then((confirmed) => {
      if (confirmed) {
        this.deleteTenant(tenant);
      }
    });
  }

  private deleteTenant(tenant: Tenant): void {
    this.tenantService.delete(tenant.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.showSuccess('Success', 'Tenant deleted successfully');
          this.loadTenants();
        }
      },
      error: (err) => {
        this.toastService.showError('Error', err.error?.message || 'Failed to delete tenant');
      },
    });
  }

  openSubscriptionDialog(tenant: Tenant): void {
    this.selectedTenant = tenant;
    this.subscriptionDialogVisible = true;
  }

  closeSubscriptionDialog(): void {
    this.subscriptionDialogVisible = false;
    this.selectedTenant = null;
  }

  onSubscriptionSave(data: AssignSubscriptionRequest): void {
    if (!this.selectedTenant) return;

    this.tenantService.assignSubscription(this.selectedTenant.id, data).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.showSuccess('Success', 'Subscription assigned successfully');
          this.closeSubscriptionDialog();
          this.loadTenants();
        }
      },
      error: (err) => {
        this.toastService.showError('Error', err.error?.message || 'Failed to assign subscription');
      },
    });
  }

  onSearch(): void {
    // Filter is applied via getter
  }

  onFilter(): void {
    // Filter is applied via getter
  }

  get filteredTenants(): Tenant[] {
    let filtered = this.tenants;

    if (this.selectedStatus) {
      const isActive = this.selectedStatus === 'active';
      filtered = filtered.filter((tenant) => tenant.isActive === isActive);
    }

    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (tenant) =>
          tenant.companyName?.toLowerCase().includes(search) ||
          tenant.email?.toLowerCase().includes(search) ||
          tenant.phone?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }

  get totalCount(): number {
    return this.tenants.length;
  }

  get activeCount(): number {
    return this.tenants.filter((tenant) => tenant.isActive).length;
  }

  get inactiveCount(): number {
    return this.tenants.filter((tenant) => !tenant.isActive).length;
  }

  get withSubscriptionCount(): number {
    return this.tenants.filter(
      (tenant) => tenant.subscription && tenant.subscription.status === 'active'
    ).length;
  }
}
