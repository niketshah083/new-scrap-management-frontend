import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Tag } from 'primeng/tag';
import { Select } from 'primeng/select';
import { Tooltip } from 'primeng/tooltip';
import { VendorService } from '../vendor.service';
import { Vendor } from '../vendor.model';
import { VendorFormComponent } from '../vendor-form/vendor-form.component';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmService } from '../../../../core/services/confirm.service';

@Component({
  selector: 'app-vendor-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    Button,
    Dialog,
    Tag,
    Select,
    Tooltip,
    VendorFormComponent,
  ],
  templateUrl: './vendor-list.component.html',
  styleUrls: ['./vendor-list.component.scss'],
})
export class VendorListComponent implements OnInit {
  vendors: Vendor[] = [];
  filteredVendors: Vendor[] = [];
  loading = false;
  formVisible = false;
  editingVendor: Vendor | null = null;
  searchTerm = '';
  selectedStatus: boolean | null = null;

  statusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
  ];

  constructor(
    private vendorService: VendorService,
    private toastService: ToastService,
    private confirmService: ConfirmService
  ) {}

  ngOnInit(): void {
    this.loadVendors();
  }

  get totalCount(): number {
    return this.vendors.length;
  }

  get activeCount(): number {
    return this.vendors.filter((v) => v.isActive).length;
  }

  get inactiveCount(): number {
    return this.vendors.filter((v) => !v.isActive).length;
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilter(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.vendors];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        (v) =>
          v.companyName?.toLowerCase().includes(term) ||
          v.contactPerson?.toLowerCase().includes(term) ||
          v.email?.toLowerCase().includes(term)
      );
    }

    if (this.selectedStatus !== null) {
      result = result.filter((v) => v.isActive === this.selectedStatus);
    }

    this.filteredVendors = result;
  }

  loadVendors(): void {
    this.loading = true;
    this.vendorService.getAll().subscribe({
      next: (res) => {
        if (res.success) {
          this.vendors = res.data || [];
          this.filteredVendors = [...this.vendors];
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastService.showError('Error', 'Failed to load vendors');
      },
    });
  }

  openForm(vendor?: Vendor): void {
    this.editingVendor = vendor || null;
    this.formVisible = true;
  }

  closeForm(): void {
    this.formVisible = false;
    this.editingVendor = null;
  }

  onSave(data: any): void {
    const obs = this.editingVendor
      ? this.vendorService.update(this.editingVendor.id, data)
      : this.vendorService.create(data);

    obs.subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.showSuccess(
            'Success',
            this.editingVendor ? 'Vendor updated' : 'Vendor created'
          );
          this.closeForm();
          this.loadVendors();
        }
      },
      error: () => this.toastService.showError('Error', 'Operation failed'),
    });
  }

  confirmDelete(vendor: Vendor): void {
    this.confirmService.confirmDelete(`vendor "${vendor.companyName}"`).then((confirmed) => {
      if (confirmed) {
        this.vendorService.delete(vendor.id).subscribe({
          next: (res) => {
            if (res.success) {
              this.toastService.showSuccess('Success', 'Vendor deleted');
              this.loadVendors();
            }
          },
          error: () => this.toastService.showError('Error', 'Failed to delete vendor'),
        });
      }
    });
  }
}
