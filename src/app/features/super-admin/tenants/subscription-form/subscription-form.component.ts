import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';
import { Button } from 'primeng/button';
import { Tenant, AssignSubscriptionRequest } from '../tenant.model';
import { PlanService } from '../../plans/plan.service';
import { Plan } from '../../plans/plan.model';
import { SelectComponent } from '../../../../shared/components/select/select.component';

@Component({
  selector: 'app-subscription-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePicker, Button, SelectComponent],
  templateUrl: './subscription-form.component.html',
  styleUrls: ['./subscription-form.component.scss'],
})
export class SubscriptionFormComponent implements OnInit {
  @Input() tenant: Tenant | null = null;
  @Output() save = new EventEmitter<AssignSubscriptionRequest>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  plans: Plan[] = [];
  minEndDate: Date = new Date();

  constructor(private fb: FormBuilder, private planService: PlanService) {}

  ngOnInit(): void {
    this.initForm();
    this.loadPlans();
    this.setupDateValidation();
  }

  private initForm(): void {
    const today = new Date();
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    this.form = this.fb.group({
      planId: ['', [Validators.required]],
      startDate: [today, [Validators.required]],
      endDate: [nextYear, [Validators.required]],
    });
  }

  private loadPlans(): void {
    this.planService.getAll().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.plans = response.data;
        }
      },
    });
  }

  private setupDateValidation(): void {
    this.form.get('startDate')?.valueChanges.subscribe((startDate) => {
      if (startDate) {
        this.minEndDate = new Date(startDate);
        this.minEndDate.setDate(this.minEndDate.getDate() + 1);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.save.emit(this.form.value);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
