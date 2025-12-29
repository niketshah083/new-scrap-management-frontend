import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { TabsModule } from 'primeng/tabs';
import { SelectModule } from 'primeng/select';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService } from 'primeng/api';
import { QCService } from '../qc.service';
import { GrnService } from '../../grn/grn.service';
import { QCInspection } from '../qc.model';
import { GRN } from '../../grn/grn.model';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-qc-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Button,
    TableModule,
    Tag,
    InputTextModule,
    TabsModule,
    SelectModule,
    ConfirmDialog,
    TooltipModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './qc-list.component.html',
  styleUrls: ['./qc-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class QcListComponent implements OnInit {
  qcInspections: QCInspection[] = [];
  pendingGRNs: GRN[] = [];
  loading = false;
  activeTab = 0;
  searchValue = '';
  selectedStatus: string | null = null;

  statusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Pass', value: 'pass' },
    { label: 'Fail', value: 'fail' },
  ];

  constructor(
    private router: Router,
    private qcService: QCService,
    private grnService: GrnService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    forkJoin({
      qcInspections: this.qcService.getAll(),
      grns: this.grnService.getAll(),
    }).subscribe({
      next: (results) => {
        this.loading = false;

        if (results.qcInspections.success && results.qcInspections.data) {
          this.qcInspections = results.qcInspections.data;
        }

        if (results.grns.success && results.grns.data) {
          const qcGrnIds = new Set(this.qcInspections.map((qc) => qc.grnId));
          this.pendingGRNs = results.grns.data.filter(
            (grn) => grn.status === 'completed' && !qcGrnIds.has(grn.id)
          );
        }
      },
      error: (err) => {
        this.loading = false;
        const errorMessage = err.error?.message || 'Failed to load data';
        this.toastService.showError('Error', errorMessage);
      },
    });
  }

  createQCInspection(grn: GRN): void {
    this.confirmationService.confirm({
      message: `Create QC inspection for GRN ${grn.grnNumber}?`,
      header: 'Confirm',
      icon: 'pi pi-question-circle',
      accept: () => {
        this.qcService.create({ grnId: grn.id }).subscribe({
          next: (res) => {
            if (res.success && res.data) {
              this.toastService.showSuccess('Success', 'QC inspection created');
              this.loadData();
              this.router.navigate(['/qc', res.data.id]);
            }
          },
          error: (err) => {
            const errorMessage = err.error?.message || 'Failed to create QC inspection';
            this.toastService.showError('Error', errorMessage);
          },
        });
      },
    });
  }

  viewQCInspection(qc: QCInspection): void {
    this.router.navigate(['/qc', qc.id]);
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'pass':
        return 'success';
      case 'fail':
        return 'danger';
      case 'in_progress':
        return 'info';
      case 'pending':
        return 'warn';
      default:
        return 'secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'pass':
        return 'Pass';
      case 'fail':
        return 'Fail';
      case 'in_progress':
        return 'In Progress';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  }

  formatDate(date: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleString();
  }

  onTabChange(event: any): void {
    this.activeTab = event.index;
  }

  onStatusFilter(): void {
    // Filter is applied via getter
  }

  get filteredQCInspections(): QCInspection[] {
    let filtered = this.qcInspections;

    if (this.selectedStatus) {
      filtered = filtered.filter((qc) => qc.status === this.selectedStatus);
    }

    if (this.searchValue) {
      const search = this.searchValue.toLowerCase();
      filtered = filtered.filter(
        (qc) =>
          qc.grn?.grnNumber?.toLowerCase().includes(search) ||
          qc.material?.name?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }

  get filteredPendingGRNs(): GRN[] {
    if (!this.searchValue) return this.pendingGRNs;
    const search = this.searchValue.toLowerCase();
    return this.pendingGRNs.filter(
      (grn) =>
        grn.grnNumber.toLowerCase().includes(search) ||
        grn.vendor?.companyName?.toLowerCase().includes(search)
    );
  }

  // Stats getters
  get inProgressCount(): number {
    return this.qcInspections.filter((qc) => qc.status === 'in_progress').length;
  }

  get passedCount(): number {
    return this.qcInspections.filter((qc) => qc.status === 'pass').length;
  }

  get failedCount(): number {
    return this.qcInspections.filter((qc) => qc.status === 'fail').length;
  }
}
