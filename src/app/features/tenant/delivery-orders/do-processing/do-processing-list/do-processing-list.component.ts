import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { DoProcessingService } from '../do-processing.service';
import {
  DoProcessing,
  DoProcessingStatus,
  DoProcessingStep,
  DoProcessingStats,
  DoItemLoadingStatus,
} from '../do-processing.model';
import { ToastService } from '../../../../../core/services/toast.service';

@Component({
  selector: 'app-do-processing-list',
  standalone: true,
  imports: [CommonModule, FormsModule, Button, Tag, InputTextModule, TableModule, SelectModule],
  templateUrl: './do-processing-list.component.html',
  styleUrls: ['./do-processing-list.component.scss'],
})
export class DoProcessingListComponent implements OnInit {
  processingRecords: DoProcessing[] = [];
  filteredRecords: DoProcessing[] = [];
  stats: DoProcessingStats = { total: 0, inProgress: 0, completed: 0, cancelled: 0 };
  loading = false;
  searchTerm = '';
  selectedStatus: DoProcessingStatus | null = null;

  statusOptions = [
    { label: 'All Statuses', value: null },
    { label: 'Pending', value: DoProcessingStatus.Pending },
    { label: 'In Progress', value: DoProcessingStatus.InProgress },
    { label: 'Completed', value: DoProcessingStatus.Completed },
    { label: 'Cancelled', value: DoProcessingStatus.Cancelled },
  ];

  constructor(
    private doProcessingService: DoProcessingService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProcessingRecords();
    this.loadStats();
  }

  loadProcessingRecords(): void {
    this.loading = true;
    this.doProcessingService.getAll(this.selectedStatus || undefined).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.processingRecords = res.data;
          this.applyFilters();
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastService.showError('Error', 'Failed to load processing records');
      },
    });
  }

  loadStats(): void {
    this.doProcessingService.getStats().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.stats = res.data;
        }
      },
      error: () => {
        // Silently fail for stats
      },
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.loadProcessingRecords();
  }

  private applyFilters(): void {
    let filtered = [...this.processingRecords];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (record) =>
          record.doNumber?.toLowerCase().includes(term) ||
          record.vendorName?.toLowerCase().includes(term) ||
          record.vehicleNo?.toLowerCase().includes(term) ||
          record.driverName?.toLowerCase().includes(term)
      );
    }

    this.filteredRecords = filtered;
  }

  viewDetails(record: DoProcessing): void {
    this.router.navigate(['/delivery-orders/processing', record.id]);
  }

  viewProcessing(record: DoProcessing): void {
    this.router.navigate(['/delivery-orders/processing', record.id]);
  }

  startNewProcessing(): void {
    // Navigate back to DO list where user can start processing from individual DOs
    this.router.navigate(['/delivery-orders']);
  }

  getStatusSeverity(
    status: DoProcessingStatus
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case DoProcessingStatus.Completed:
        return 'success';
      case DoProcessingStatus.InProgress:
        return 'info';
      case DoProcessingStatus.Cancelled:
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getStatusLabel(status: DoProcessingStatus): string {
    switch (status) {
      case DoProcessingStatus.Completed:
        return 'Completed';
      case DoProcessingStatus.InProgress:
        return 'In Progress';
      case DoProcessingStatus.Cancelled:
        return 'Cancelled';
      case DoProcessingStatus.Pending:
        return 'Pending';
      default:
        return status;
    }
  }

  getStepLabel(step: DoProcessingStep): string {
    switch (step) {
      case DoProcessingStep.GateEntry:
        return 'Gate Entry';
      case DoProcessingStep.InitialWeighing:
        return 'Initial Weighing';
      case DoProcessingStep.ItemLoading:
        return 'Item Loading';
      case DoProcessingStep.FinalWeighing:
        return 'Final Weighing';
      case DoProcessingStep.Completed:
        return 'Completed';
      default:
        return step;
    }
  }

  getStepSeverity(step: DoProcessingStep): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (step) {
      case DoProcessingStep.Completed:
        return 'success';
      case DoProcessingStep.FinalWeighing:
        return 'warn';
      case DoProcessingStep.ItemLoading:
        return 'info';
      default:
        return 'secondary';
    }
  }

  getProgressPercentage(record: DoProcessing): number {
    if (!record.items || record.items.length === 0) return 0;
    const loadedItems = record.items.filter(
      (item) => item.loadingStatus === DoItemLoadingStatus.Loaded
    ).length;
    const skippedItems = record.items.filter(
      (item) => item.loadingStatus === DoItemLoadingStatus.Skipped
    ).length;
    return Math.round(((loadedItems + skippedItems) / record.items.length) * 100);
  }

  getLoadedItemsCount(record: DoProcessing): number {
    if (!record.items) return 0;
    return record.items.filter((item) => item.loadingStatus === DoItemLoadingStatus.Loaded).length;
  }

  getTotalItemsCount(record: DoProcessing): number {
    return record.items?.length || 0;
  }
}
