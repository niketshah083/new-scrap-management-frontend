import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { InputNumber } from 'primeng/inputnumber';
import { Button } from 'primeng/button';
import { Plan, PlanModule, BillingCycle } from '../plan.model';
import { PlanService } from '../plan.service';
import { SelectComponent } from '../../../../shared/components/select/select.component';
import { MultiselectComponent } from '../../../../shared/components/multiselect/multiselect.component';

@Component({
  selector: 'app-plan-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    Textarea,
    InputNumber,
    Button,
    SelectComponent,
    MultiselectComponent,
  ],
  templateUrl: './plan-form.component.html',
  styleUrls: ['./plan-form.component.scss'],
})
export class PlanFormComponent implements OnInit, OnChanges {
  @Input() plan: Plan | null = null;
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  modules: PlanModule[] = [];
  billingCycleOptions = [
    { label: 'Monthly', value: BillingCycle.MONTHLY },
    { label: 'Yearly', value: BillingCycle.YEARLY },
  ];

  constructor(private fb: FormBuilder, private planService: PlanService) {}

  ngOnInit(): void {
    this.initForm();
    this.loadModules();
  }

  ngOnChanges(): void {
    if (this.form) {
      this.patchForm();
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      billingCycle: [BillingCycle.MONTHLY, [Validators.required]],
      moduleIds: [[]],
    });
    this.patchForm();
  }

  private loadModules(): void {
    this.planService.getAvailableModules().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.modules = response.data;
        }
      },
    });
  }

  private patchForm(): void {
    if (this.plan) {
      this.form.patchValue({
        name: this.plan.name,
        description: this.plan.description || '',
        price: this.plan.price,
        billingCycle: this.plan.billingCycle,
        moduleIds: this.plan.modules?.map((m) => m.id) || [],
      });
    } else {
      this.form.reset({
        price: 0,
        billingCycle: BillingCycle.MONTHLY,
        moduleIds: [],
      });
    }
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
