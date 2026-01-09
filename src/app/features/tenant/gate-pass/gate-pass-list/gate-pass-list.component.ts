import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { Tooltip } from 'primeng/tooltip';
import { GatePassService } from '../gate-pass.service';
import { GatePass } from '../gate-pass.model';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-gate-pass-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Button,
    TableModule,
    Tag,
    InputTextModule,
    Select,
    ConfirmDialog,
    Tooltip,
  ],
  providers: [ConfirmationService],
  templateUrl: './gate-pass-list.component.html',
  styleUrls: ['./gate-pass-list.component.scss'],
})
export class GatePassListComponent implements OnInit {
  gatePasses: GatePass[] = [];
  loading = false;
  searchValue = '';
  selectedStatus: string | null = null;

  statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Used', value: 'used' },
    { label: 'Expired', value: 'expired' },
  ];

  constructor(
    private router: Router,
    private gatePassService: GatePassService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadGatePasses();
  }

  get totalCount(): number {
    return this.gatePasses.length;
  }

  get activeCount(): number {
    return this.gatePasses.filter((g) => g.status === 'active' && !this.isExpired(g)).length;
  }

  get usedCount(): number {
    return this.gatePasses.filter((g) => g.status === 'used').length;
  }

  get expiredCount(): number {
    // Only count expired passes that are not used
    return this.gatePasses.filter(
      (g) => g.status !== 'used' && (g.status === 'expired' || this.isExpired(g))
    ).length;
  }

  onFilter(): void {
    // Filter is applied via filteredGatePasses getter
  }

  get filteredGatePasses(): GatePass[] {
    let result = [...this.gatePasses];

    if (this.searchValue) {
      const search = this.searchValue.toLowerCase();
      result = result.filter(
        (gp) =>
          gp.passNumber.toLowerCase().includes(search) ||
          gp.grn?.grnNumber?.toLowerCase().includes(search)
      );
    }

    if (this.selectedStatus) {
      result = result.filter((gp) => gp.status === this.selectedStatus);
    }

    return result;
  }

  loadGatePasses(): void {
    this.loading = true;
    this.gatePassService.getAll().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) {
          this.gatePasses = res.data;
        }
      },
      error: (err) => {
        this.loading = false;
        const errorMessage = err.error?.message || 'Failed to load gate passes';
        this.toastService.showError('Error', errorMessage);
      },
    });
  }

  goToVerify(): void {
    this.router.navigate(['/gate-pass/verify']);
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'active':
        return 'success';
      case 'used':
        return 'info';
      case 'expired':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  formatDate(date: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleString();
  }

  isExpired(gatePass: GatePass): boolean {
    return new Date(gatePass.expiresAt) < new Date();
  }

  getDisplayStatus(gatePass: GatePass): string {
    // If status is active but expired, show as expired
    if (gatePass.status === 'active' && this.isExpired(gatePass)) {
      return 'expired';
    }
    return gatePass.status;
  }

  markAsUsed(gatePass: GatePass): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to mark gate pass ${gatePass.passNumber} as used?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.gatePassService.markAsUsed(gatePass.id).subscribe({
          next: (res) => {
            if (res.success) {
              this.toastService.showSuccess('Success', 'Gate pass marked as used');
              this.loadGatePasses();
            }
          },
          error: (err) => {
            const errorMessage = err.error?.message || 'Failed to mark gate pass as used';
            this.toastService.showError('Error', errorMessage);
          },
        });
      },
    });
  }

  deleteGatePass(gatePass: GatePass): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete gate pass ${gatePass.passNumber}?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.gatePassService.delete(gatePass.id).subscribe({
          next: (res) => {
            if (res.success) {
              this.toastService.showSuccess('Success', 'Gate pass deleted');
              this.loadGatePasses();
            }
          },
          error: (err) => {
            const errorMessage = err.error?.message || 'Failed to delete gate pass';
            this.toastService.showError('Error', errorMessage);
          },
        });
      },
    });
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchValue = target.value;
  }
}
