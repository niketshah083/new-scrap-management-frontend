import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { GrnService } from '../grn.service';
import { GRN } from '../grn.model';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-grn-detail',
  standalone: true,
  imports: [CommonModule, Card, Button, Tag],
  templateUrl: './grn-detail.component.html',
  styleUrls: ['./grn-detail.component.scss'],
})
export class GrnDetailComponent implements OnInit {
  grn: GRN | null = null;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private grnService: GrnService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadGRN(parseInt(id, 10));
  }

  loadGRN(id: number): void {
    this.loading = true;
    this.grnService.getById(id).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) this.grn = res.data;
      },
      error: () => {
        this.loading = false;
        this.toastService.showError('Error', 'Failed to load GRN');
        this.router.navigate(['/grn']);
      },
    });
  }

  continueGRN(): void {
    if (this.grn) {
      this.router.navigate(['/grn', this.grn.id, 'step', this.grn.currentStep]);
    }
  }

  goBack(): void {
    this.router.navigate(['/grn']);
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
}
