import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Skeleton } from 'primeng/skeleton';
import { DashboardService, DashboardSummary } from './dashboard.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, Button, TableModule, Tag, Skeleton],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DashboardComponent implements OnInit {
  summary: DashboardSummary | null = null;
  loading = false;

  stepLabels: { [key: number]: string } = {
    1: 'Gate Entry',
    2: 'Initial Weighing',
    3: 'Unloading',
    4: 'Final Weighing',
    5: 'Supervisor Review',
    6: 'Gate Pass',
    7: 'Inspection Report',
  };

  constructor(
    private router: Router,
    private dashboardService: DashboardService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.dashboardService.getSummary().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) {
          this.summary = res.data;
        }
      },
      error: (err) => {
        this.loading = false;
        const errorMessage = err.error?.message || 'Failed to load dashboard';
        this.toastService.showError('Error', errorMessage);
      },
    });
  }

  getGRNStatusCount(status: string): number {
    if (!this.summary?.todayGRNStats) return 0;
    const stat = this.summary.todayGRNStats.find((s) => s.status === status);
    return stat?.count || 0;
  }

  getTotalGRNsToday(): number {
    if (!this.summary?.todayGRNStats) return 0;
    return this.summary.todayGRNStats.reduce((sum, s) => sum + s.count, 0);
  }

  getInProgressCount(): number {
    if (!this.summary?.grnByStep) return 0;
    return this.summary.grnByStep.reduce((sum, s) => sum + s.count, 0);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'info';
      case 'rejected':
        return 'danger';
      case 'pending_approval':
        return 'warn';
      default:
        return 'secondary';
    }
  }

  formatDate(date: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleString();
  }

  formatShortDate(date: string): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  formatWeight(weight: number): string {
    if (weight >= 1000000) {
      return (weight / 1000000).toFixed(1) + 'M';
    } else if (weight >= 1000) {
      return (weight / 1000).toFixed(1) + 'K';
    }
    return weight.toFixed(0);
  }

  getQCPassRateColor(): string {
    if (!this.summary) return '#64748b';
    if (this.summary.qcPassRate >= 90) return '#22c55e';
    if (this.summary.qcPassRate >= 70) return '#f59e0b';
    return '#ef4444';
  }

  getStepLabel(step: number): string {
    return this.stepLabels[step] || `Step ${step}`;
  }

  getMaxTrendCount(): number {
    if (!this.summary?.weeklyTrend) return 1;
    return Math.max(...this.summary.weeklyTrend.map((t) => t.count), 1);
  }

  getTrendBarWidth(count: number): number {
    const max = this.getMaxTrendCount();
    return (count / max) * 100;
  }
}
