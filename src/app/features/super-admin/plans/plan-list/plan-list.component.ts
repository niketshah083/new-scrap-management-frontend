import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Tag } from 'primeng/tag';
import { Chip } from 'primeng/chip';
import { PlanService } from '../plan.service';
import { Plan } from '../plan.model';
import { PlanFormComponent } from '../plan-form/plan-form.component';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmService } from '../../../../core/services/confirm.service';

@Component({
  selector: 'app-plan-list',
  standalone: true,
  imports: [CommonModule, TableModule, Button, Dialog, Tag, Chip, PlanFormComponent],
  templateUrl: './plan-list.component.html',
  styleUrls: ['./plan-list.component.scss'],
})
export class PlanListComponent implements OnInit {
  plans: Plan[] = [];
  loading: boolean = false;
  formVisible: boolean = false;
  editingPlan: Plan | null = null;

  constructor(
    private planService: PlanService,
    private toastService: ToastService,
    private confirmService: ConfirmService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(): void {
    this.loading = true;
    this.planService.getAll().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.plans = response.data;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
        this.toastService.showError('Error', 'Failed to load plans');
      },
    });
  }

  openForm(plan?: Plan): void {
    this.editingPlan = plan || null;
    this.formVisible = true;
  }

  closeForm(): void {
    this.formVisible = false;
    this.editingPlan = null;
  }

  onSave(data: any): void {
    if (this.editingPlan) {
      this.planService.update(this.editingPlan.id, data).subscribe({
        next: (response) => {
          if (response.success) {
            this.toastService.showSuccess('Success', 'Plan updated successfully');
            this.closeForm();
            this.loadPlans();
          }
        },
        error: () => {
          this.toastService.showError('Error', 'Failed to update plan');
        },
      });
    } else {
      this.planService.create(data).subscribe({
        next: (response) => {
          if (response.success) {
            this.toastService.showSuccess('Success', 'Plan created successfully');
            this.closeForm();
            this.loadPlans();
          }
        },
        error: () => {
          this.toastService.showError('Error', 'Failed to create plan');
        },
      });
    }
  }

  confirmDelete(plan: Plan): void {
    this.confirmService.confirmDelete(`plan "${plan.name}"`).then((confirmed) => {
      if (confirmed) {
        this.deletePlan(plan);
      }
    });
  }

  private deletePlan(plan: Plan): void {
    this.planService.delete(plan.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.showSuccess('Success', 'Plan deleted successfully');
          this.loadPlans();
        }
      },
      error: () => {
        this.toastService.showError('Error', 'Failed to delete plan');
      },
    });
  }
}
