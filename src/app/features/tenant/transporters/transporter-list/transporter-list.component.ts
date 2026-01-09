import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Tag } from 'primeng/tag';
import { Select } from 'primeng/select';
import { Tooltip } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { TransporterService } from '../transporter.service';
import {
  Transporter,
  CreateTransporterRequest,
  UpdateTransporterRequest,
} from '../transporter.model';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmService } from '../../../../core/services/confirm.service';

@Component({
  selector: 'app-transporter-list',
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
    InputTextModule,
  ],
  templateUrl: './transporter-list.component.html',
  styleUrls: ['./transporter-list.component.scss'],
})
export class TransporterListComponent implements OnInit {
  transporters: Transporter[] = [];
  filteredTransporters: Transporter[] = [];
  loading = false;
  formVisible = false;
  editingTransporter: Transporter | null = null;
  searchTerm = '';
  selectedStatus: boolean | null = null;

  // Form data
  formData: CreateTransporterRequest = {
    transporterName: '',
    gstin: '',
    mobileNo: '',
    gstState: '',
    isActive: true,
  };

  statusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
  ];

  constructor(
    private transporterService: TransporterService,
    private toastService: ToastService,
    private confirmService: ConfirmService
  ) {}

  ngOnInit(): void {
    this.loadTransporters();
  }

  get totalCount(): number {
    return this.transporters.length;
  }

  get activeCount(): number {
    return this.transporters.filter((t) => t.isActive).length;
  }

  get inactiveCount(): number {
    return this.transporters.filter((t) => !t.isActive).length;
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilter(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.transporters];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        (t) =>
          t.transporterName?.toLowerCase().includes(term) ||
          t.gstin?.toLowerCase().includes(term) ||
          t.mobileNo?.toLowerCase().includes(term)
      );
    }

    if (this.selectedStatus !== null) {
      result = result.filter((t) => t.isActive === this.selectedStatus);
    }

    this.filteredTransporters = result;
  }

  loadTransporters(): void {
    this.loading = true;
    this.transporterService.getAll().subscribe({
      next: (res) => {
        if (res.success) {
          this.transporters = res.data || [];
          this.filteredTransporters = [...this.transporters];
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastService.showError('Error', 'Failed to load transporters');
      },
    });
  }

  openForm(transporter?: Transporter): void {
    this.editingTransporter = transporter || null;
    if (transporter) {
      this.formData = {
        transporterName: transporter.transporterName,
        gstin: transporter.gstin || '',
        mobileNo: transporter.mobileNo || '',
        gstState: transporter.gstState || '',
        isActive: transporter.isActive,
      };
    } else {
      this.formData = {
        transporterName: '',
        gstin: '',
        mobileNo: '',
        gstState: '',
        isActive: true,
      };
    }
    this.formVisible = true;
  }

  closeForm(): void {
    this.formVisible = false;
    this.editingTransporter = null;
  }

  onSave(): void {
    if (!this.formData.transporterName) {
      this.toastService.showError('Error', 'Transporter name is required');
      return;
    }

    const obs = this.editingTransporter
      ? this.transporterService.update(this.editingTransporter.id, this.formData)
      : this.transporterService.create(this.formData);

    obs.subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.showSuccess(
            'Success',
            this.editingTransporter ? 'Transporter updated' : 'Transporter created'
          );
          this.closeForm();
          this.loadTransporters();
        }
      },
      error: (err) =>
        this.toastService.showError('Error', err.error?.message || 'Operation failed'),
    });
  }

  confirmDelete(transporter: Transporter): void {
    this.confirmService
      .confirmDelete(`transporter "${transporter.transporterName}"`)
      .then((confirmed) => {
        if (confirmed) {
          this.transporterService.delete(transporter.id).subscribe({
            next: (res) => {
              if (res.success) {
                this.toastService.showSuccess('Success', 'Transporter deleted');
                this.loadTransporters();
              }
            },
            error: () => this.toastService.showError('Error', 'Failed to delete transporter'),
          });
        }
      });
  }

  toggleStatus(transporter: Transporter): void {
    this.transporterService.toggleStatus(transporter.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.showSuccess(
            'Success',
            `Transporter ${res.data?.isActive ? 'activated' : 'deactivated'}`
          );
          this.loadTransporters();
        }
      },
      error: () => this.toastService.showError('Error', 'Failed to update status'),
    });
  }
}
