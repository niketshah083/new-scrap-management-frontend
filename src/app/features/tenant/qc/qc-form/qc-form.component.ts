import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Textarea } from 'primeng/textarea';
import { Tag } from 'primeng/tag';
import { Checkbox } from 'primeng/checkbox';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { QCService } from '../qc.service';
import { QCInspection, TestParameter } from '../qc.model';
import { ToastService } from '../../../../core/services/toast.service';
import { SelectComponent } from '../../../../shared/components/select/select.component';

@Component({
  selector: 'app-qc-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Button,
    Card,
    InputTextModule,
    InputNumber,
    Textarea,
    Tag,
    Checkbox,
    ConfirmDialog,
    SelectComponent,
  ],
  providers: [ConfirmationService],
  templateUrl: './qc-form.component.html',
  styleUrls: ['./qc-form.component.scss'],
})
export class QcFormComponent implements OnInit {
  qcInspection: QCInspection | null = null;
  qcId: number | null = null;
  loading = false;
  saving = false;
  form!: FormGroup;

  resultOptions = [
    { label: 'Pass', value: 'pass' },
    { label: 'Fail', value: 'fail' },
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private qcService: QCService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.initForm();
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.qcId = parseInt(idParam, 10);
      this.loadQCInspection();
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      moistureContent: [null],
      impurityPercentage: [null],
      qualityGrade: [null, [Validators.min(1), Validators.max(10)]],
      remarks: [''],
      testParameters: this.fb.array([]),
      result: [null],
      failureReason: [''],
    });
  }

  get testParameters(): FormArray {
    return this.form.get('testParameters') as FormArray;
  }

  addTestParameter(): void {
    const paramGroup = this.fb.group({
      name: ['', Validators.required],
      expectedValue: ['', Validators.required],
      actualValue: ['', Validators.required],
      unit: [''],
      passed: [false],
    });
    this.testParameters.push(paramGroup);
  }

  removeTestParameter(index: number): void {
    this.testParameters.removeAt(index);
  }

  private loadQCInspection(): void {
    if (!this.qcId) return;
    this.loading = true;
    this.qcService.getById(this.qcId).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) {
          this.qcInspection = res.data;
          this.patchForm();
        }
      },
      error: (err) => {
        this.loading = false;
        const errorMessage = err.error?.message || 'Failed to load QC inspection';
        this.toastService.showError('Error', errorMessage);
        this.router.navigate(['/qc']);
      },
    });
  }

  private patchForm(): void {
    if (!this.qcInspection) return;

    this.form.patchValue({
      moistureContent: this.qcInspection.moistureContent,
      impurityPercentage: this.qcInspection.impurityPercentage,
      qualityGrade: this.qcInspection.qualityGrade,
      remarks: this.qcInspection.remarks,
    });

    // Load test parameters
    if (this.qcInspection.testParameters && this.qcInspection.testParameters.length > 0) {
      this.testParameters.clear();
      for (const param of this.qcInspection.testParameters) {
        const paramGroup = this.fb.group({
          name: [param.name, Validators.required],
          expectedValue: [param.expectedValue, Validators.required],
          actualValue: [param.actualValue, Validators.required],
          unit: [param.unit || ''],
          passed: [param.passed],
        });
        this.testParameters.push(paramGroup);
      }
    }
  }

  saveProgress(): void {
    if (!this.qcId) return;
    this.saving = true;

    // Filter out empty test parameters
    const validTestParameters = (this.form.value.testParameters || []).filter(
      (param: any) => param.name && param.expectedValue && param.actualValue
    );

    const data: any = {};

    // Only include optional fields if they have values
    if (this.form.value.moistureContent !== null && this.form.value.moistureContent !== undefined) {
      data.moistureContent = this.form.value.moistureContent;
    }
    if (
      this.form.value.impurityPercentage !== null &&
      this.form.value.impurityPercentage !== undefined
    ) {
      data.impurityPercentage = this.form.value.impurityPercentage;
    }
    if (this.form.value.qualityGrade !== null && this.form.value.qualityGrade !== undefined) {
      data.qualityGrade = this.form.value.qualityGrade;
    }
    if (this.form.value.remarks) {
      data.remarks = this.form.value.remarks;
    }
    if (validTestParameters.length > 0) {
      data.testParameters = validTestParameters;
    }

    this.qcService.update(this.qcId, data).subscribe({
      next: (res) => {
        this.saving = false;
        if (res.success) {
          this.toastService.showSuccess('Success', 'Progress saved');
          this.qcInspection = res.data;
        }
      },
      error: (err) => {
        this.saving = false;
        const errorMessage = err.error?.message || 'Failed to save progress';
        this.toastService.showError('Error', errorMessage);
      },
    });
  }

  completeInspection(): void {
    if (!this.qcId) return;

    const result = this.form.value.result;
    if (!result) {
      this.toastService.showError('Error', 'Please select Pass or Fail result');
      return;
    }

    if (result === 'fail' && !this.form.value.failureReason) {
      this.toastService.showError('Error', 'Please provide a failure reason');
      return;
    }

    this.confirmationService.confirm({
      message: `Are you sure you want to mark this inspection as ${result.toUpperCase()}? This action cannot be undone.`,
      header: 'Complete Inspection',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: result === 'pass' ? 'p-button-success' : 'p-button-danger',
      accept: () => {
        this.saving = true;

        // Filter out empty test parameters
        const validTestParameters = (this.form.value.testParameters || []).filter(
          (param: any) => param.name && param.expectedValue && param.actualValue
        );

        const data: any = {
          result: result,
        };

        // Only include optional fields if they have values
        if (
          this.form.value.moistureContent !== null &&
          this.form.value.moistureContent !== undefined
        ) {
          data.moistureContent = this.form.value.moistureContent;
        }
        if (
          this.form.value.impurityPercentage !== null &&
          this.form.value.impurityPercentage !== undefined
        ) {
          data.impurityPercentage = this.form.value.impurityPercentage;
        }
        if (this.form.value.qualityGrade !== null && this.form.value.qualityGrade !== undefined) {
          data.qualityGrade = this.form.value.qualityGrade;
        }
        if (this.form.value.remarks) {
          data.remarks = this.form.value.remarks;
        }
        if (validTestParameters.length > 0) {
          data.testParameters = validTestParameters;
        }
        if (result === 'fail' && this.form.value.failureReason) {
          data.failureReason = this.form.value.failureReason;
        }

        this.qcService.complete(this.qcId!, data).subscribe({
          next: (res) => {
            this.saving = false;
            if (res.success) {
              this.toastService.showSuccess(
                'Success',
                `QC inspection ${result === 'pass' ? 'passed' : 'failed'}`
              );
              this.router.navigate(['/qc']);
            }
          },
          error: (err) => {
            this.saving = false;
            const errorMessage = err.error?.message || 'Failed to complete inspection';
            this.toastService.showError('Error', errorMessage);
          },
        });
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/qc']);
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

  isCompleted(): boolean {
    return this.qcInspection?.status === 'pass' || this.qcInspection?.status === 'fail';
  }
}
