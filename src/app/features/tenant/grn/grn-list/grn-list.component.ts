import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Select } from 'primeng/select';
import { Tooltip } from 'primeng/tooltip';
import { GrnService } from '../grn.service';
import { GRN } from '../grn.model';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-grn-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, Button, Tag, Select, Tooltip],
  templateUrl: './grn-list.component.html',
  styleUrls: ['./grn-list.component.scss'],
})
export class GrnListComponent implements OnInit {
  grns: GRN[] = [];
  filteredGrns: GRN[] = [];
  loading = false;
  searchTerm = '';
  selectedStatus: string | null = null;

  statusOptions = [
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Completed', value: 'completed' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Pending Review', value: 'pending_review' },
  ];

  constructor(
    private grnService: GrnService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadGRNs();
  }

  loadGRNs(): void {
    this.loading = true;
    this.grnService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.grns = res.data;
          this.filteredGrns = [...this.grns];
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastService.showError('Error', 'Failed to load GRNs');
      },
    });
  }

  get totalCount(): number {
    return this.grns.length;
  }

  get inProgressCount(): number {
    return this.grns.filter((g) => g.status === 'in_progress').length;
  }

  get completedCount(): number {
    return this.grns.filter((g) => g.status === 'completed').length;
  }

  get todayCount(): number {
    const today = new Date().toDateString();
    return this.grns.filter((g) => new Date(g.createdAt).toDateString() === today).length;
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilter(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.grns];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        (g) =>
          g.grnNumber?.toLowerCase().includes(term) ||
          g.vendor?.companyName?.toLowerCase().includes(term) ||
          g.purchaseOrder?.poNumber?.toLowerCase().includes(term)
      );
    }

    if (this.selectedStatus) {
      result = result.filter((g) => g.status === this.selectedStatus);
    }

    this.filteredGrns = result;
  }

  createNew(): void {
    this.router.navigate(['/grn/new']);
  }

  viewGRN(grn: GRN): void {
    this.router.navigate(['/grn', grn.id]);
  }

  continueGRN(grn: GRN): void {
    this.router.navigate(['/grn', grn.id, 'step', grn.currentStep]);
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'completed':
        return 'success';
      case 'approved':
        return 'info';
      case 'pending_review':
        return 'warn';
      case 'rejected':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getStepLabel(step: number): string {
    const steps = [
      'Gate Entry',
      'Initial Weighing',
      'Unloading',
      'Final Weighing',
      'Supervisor Review',
      'Gate Pass',
      'Inspection Report',
    ];
    return steps[step - 1] || `Step ${step}`;
  }

  // Get the next step to work on (for display purposes)
  getNextStepLabel(grn: GRN): string {
    return this.getStepLabel(grn.currentStep);
  }
}
