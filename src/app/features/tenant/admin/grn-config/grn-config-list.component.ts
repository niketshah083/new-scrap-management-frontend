import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Tag } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Checkbox } from 'primeng/checkbox';
import { TabsModule } from 'primeng/tabs';
import { GrnConfigService, GRNFieldConfig, FieldType } from './grn-config.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { SelectComponent } from '../../../../shared/components/select/select.component';

@Component({
  selector: 'app-grn-config-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    Button,
    Dialog,
    Tag,
    InputTextModule,
    InputNumber,
    Checkbox,
    TabsModule,
    SelectComponent,
  ],
  template: `
    <div class="grn-config">
      <div class="page-header">
        <div>
          <h1>GRN Field Configuration</h1>
          <p>Configure dynamic fields for each GRN step.</p>
        </div>
        <div class="header-actions">
          @if (fields.length === 0) {
          <p-button
            label="Initialize Defaults"
            icon="pi pi-refresh"
            severity="secondary"
            (click)="initializeDefaults()"
            [loading]="loading"
          ></p-button>
          }
          <p-button label="Add Field" icon="pi pi-plus" (click)="openForm()"></p-button>
        </div>
      </div>

      <div class="step-tabs">
        @for (step of steps; track step.number) {
        <button
          class="step-tab"
          [class.active]="selectedStep === step.number"
          (click)="selectStep(step.number)"
        >
          Step {{ step.number }}: {{ step.label }}
          <span class="field-count">{{ getFieldCount(step.number) }}</span>
        </button>
        }
      </div>

      <p-table [value]="filteredFields" [loading]="loading" styleClass="p-datatable-striped">
        <ng-template pTemplate="header">
          <tr>
            <th style="width: 60px">Order</th>
            <th>Field Name</th>
            <th>Label</th>
            <th>Type</th>
            <th>Required</th>
            <th>Status</th>
            <th style="width: 150px">Actions</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-field>
          <tr>
            <td>{{ field.displayOrder }}</td>
            <td>
              <code>{{ field.fieldName }}</code>
            </td>
            <td>{{ field.fieldLabel }}</td>
            <td>
              <p-tag
                [value]="field.fieldType"
                [severity]="getTypeSeverity(field.fieldType)"
              ></p-tag>
            </td>
            <td>
              <i
                [class]="
                  field.isRequired ? 'pi pi-check text-green-500' : 'pi pi-times text-gray-400'
                "
              ></i>
            </td>
            <td>
              <p-tag
                [value]="field.isActive ? 'Active' : 'Inactive'"
                [severity]="field.isActive ? 'success' : 'danger'"
              ></p-tag>
            </td>
            <td>
              <div class="action-buttons">
                <p-button
                  icon="pi pi-pencil"
                  [rounded]="true"
                  [text]="true"
                  severity="info"
                  (click)="openForm(field)"
                ></p-button>
                <p-button
                  [icon]="field.isActive ? 'pi pi-ban' : 'pi pi-check'"
                  [rounded]="true"
                  [text]="true"
                  [severity]="field.isActive ? 'warn' : 'success'"
                  (click)="toggleStatus(field)"
                ></p-button>
                <p-button
                  icon="pi pi-trash"
                  [rounded]="true"
                  [text]="true"
                  severity="danger"
                  (click)="confirmDelete(field)"
                ></p-button>
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="7" class="text-center">
              <div class="empty-state">
                <p>No fields configured for this step.</p>
                @if (fields.length === 0) {
                <p>Click "Initialize Defaults" to create default field configurations.</p>
                } @else {
                <p>Click "Add Field" to create one.</p>
                }
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog
      [(visible)]="formVisible"
      [header]="editing ? 'Edit Field' : 'Add Field'"
      [modal]="true"
      [style]="{ width: '500px' }"
    >
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-field">
          <app-select
            id="stepNumber"
            formControlName="stepNumber"
            [options]="steps"
            label="Step"
            optionLabel="label"
            optionValue="number"
            placeholder="Select step"
            [required]="true"
            [config]="{ disabled: !!editing }"
          ></app-select>
        </div>
        <div class="form-field">
          <label for="fieldName">Field Name *</label>
          <input
            pInputText
            id="fieldName"
            formControlName="fieldName"
            placeholder="e.g., truck_number"
            [readonly]="!!editing"
          />
          <small class="hint">Internal identifier (snake_case)</small>
        </div>
        <div class="form-field">
          <label for="fieldLabel">Field Label *</label>
          <input
            pInputText
            id="fieldLabel"
            formControlName="fieldLabel"
            placeholder="e.g., Truck Number"
          />
        </div>
        <div class="form-field">
          <app-select
            id="fieldType"
            formControlName="fieldType"
            [options]="fieldTypes"
            label="Field Type"
            optionLabel="label"
            optionValue="value"
            placeholder="Select type"
            [required]="true"
          ></app-select>
        </div>
        <div class="form-field">
          <label for="displayOrder">Display Order</label>
          <p-inputnumber
            id="displayOrder"
            formControlName="displayOrder"
            [min]="1"
            styleClass="w-full"
          ></p-inputnumber>
        </div>
        <div class="form-field checkbox-field">
          <p-checkbox
            formControlName="isRequired"
            [binary]="true"
            inputId="isRequired"
          ></p-checkbox>
          <label for="isRequired">Required Field</label>
        </div>
        @if (form.value.fieldType === 'dropdown') {
        <div class="form-field">
          <label for="optionsText">Options (one per line)</label>
          <textarea
            pInputText
            id="optionsText"
            formControlName="optionsText"
            rows="4"
            placeholder="Option 1&#10;Option 2&#10;Option 3"
          ></textarea>
        </div>
        } @if (form.value.fieldType === 'file' || form.value.fieldType === 'photo') {
        <div class="form-field checkbox-field">
          <p-checkbox
            formControlName="allowMultiple"
            [binary]="true"
            inputId="allowMultiple"
          ></p-checkbox>
          <label for="allowMultiple">Allow Multiple Files</label>
        </div>
        @if (form.value.allowMultiple) {
        <div class="form-field">
          <label for="maxFiles">Maximum Files</label>
          <p-inputnumber
            id="maxFiles"
            formControlName="maxFiles"
            [min]="2"
            [max]="20"
            styleClass="w-full"
          ></p-inputnumber>
          <small class="hint">Maximum number of files allowed (2-20)</small>
        </div>
        } }
        <div class="form-actions">
          <p-button
            label="Cancel"
            severity="secondary"
            [text]="true"
            (click)="closeForm()"
          ></p-button>
          <p-button
            type="submit"
            [label]="editing ? 'Update' : 'Create'"
            [disabled]="form.invalid"
          ></p-button>
        </div>
      </form>
    </p-dialog>
  `,
  styles: [
    `
      .grn-config {
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
          h1 {
            font-size: 1.5rem;
            font-weight: 600;
            color: #1e293b;
            margin: 0 0 0.25rem 0;
          }
          p {
            color: #64748b;
            margin: 0;
          }
          .header-actions {
            display: flex;
            gap: 0.5rem;
          }
        }
        .step-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          .step-tab {
            padding: 0.5rem 1rem;
            border: 1px solid #e2e8f0;
            border-radius: 0.5rem;
            background: white;
            cursor: pointer;
            font-size: 0.875rem;
            color: #64748b;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            &:hover {
              border-color: #3b82f6;
              color: #3b82f6;
            }
            &.active {
              background: #3b82f6;
              border-color: #3b82f6;
              color: white;
              .field-count {
                background: rgba(255, 255, 255, 0.2);
              }
            }
            .field-count {
              background: #e2e8f0;
              padding: 0.125rem 0.5rem;
              border-radius: 1rem;
              font-size: 0.75rem;
            }
          }
        }
        .action-buttons {
          display: flex;
          gap: 0.25rem;
        }
        .text-center {
          text-align: center;
          color: #64748b;
          padding: 2rem !important;
        }
        .empty-state {
          p {
            margin: 0.25rem 0;
          }
        }
        code {
          background: #f1f5f9;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }
        .text-green-500 {
          color: #22c55e;
        }
        .text-gray-400 {
          color: #9ca3af;
        }
      }
      .form-field {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 1rem;
        label {
          font-weight: 500;
          color: #334155;
        }
        input,
        textarea {
          width: 100%;
        }
        .hint {
          color: #64748b;
          font-size: 0.75rem;
        }
        &.checkbox-field {
          flex-direction: row;
          align-items: center;
          gap: 0.5rem;
          label {
            font-weight: 400;
          }
        }
      }
      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
        margin-top: 1.5rem;
        padding-top: 1rem;
        border-top: 1px solid #e2e8f0;
      }
    `,
  ],
})
export class GrnConfigListComponent implements OnInit {
  fields: GRNFieldConfig[] = [];
  loading = false;
  formVisible = false;
  editing: GRNFieldConfig | null = null;
  selectedStep = 1;
  form!: FormGroup;

  steps = [
    { number: 1, label: 'Gate Entry' },
    { number: 2, label: 'Initial Weighing' },
    { number: 3, label: 'Unloading' },
    { number: 4, label: 'Final Weighing' },
    { number: 5, label: 'Supervisor Review' },
    { number: 6, label: 'Gate Pass' },
    { number: 7, label: 'Inspection Report' },
  ];

  fieldTypes = [
    { label: 'Text', value: 'text' },
    { label: 'Number', value: 'number' },
    { label: 'Date', value: 'date' },
    { label: 'File Upload', value: 'file' },
    { label: 'Photo', value: 'photo' },
    { label: 'Dropdown', value: 'dropdown' },
  ];

  constructor(
    private fb: FormBuilder,
    private configService: GrnConfigService,
    private toastService: ToastService,
    private confirmService: ConfirmService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      stepNumber: [1, Validators.required],
      fieldName: ['', [Validators.required, Validators.pattern(/^[a-z][a-z0-9_]*$/)]],
      fieldLabel: ['', Validators.required],
      fieldType: ['text', Validators.required],
      displayOrder: [1],
      isRequired: [false],
      optionsText: [''],
      allowMultiple: [false],
      maxFiles: [5],
    });
  }

  ngOnInit(): void {
    this.loadFields();
  }

  get filteredFields(): GRNFieldConfig[] {
    return this.fields
      .filter((f) => f.stepNumber === this.selectedStep)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  loadFields(): void {
    this.loading = true;
    this.configService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) this.fields = res.data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
        this.toastService.showError('Error', 'Failed to load field configurations');
      },
    });
  }

  selectStep(step: number): void {
    this.selectedStep = step;
  }

  getFieldCount(step: number): number {
    return this.fields.filter((f) => f.stepNumber === step).length;
  }

  getTypeSeverity(type: FieldType): 'info' | 'success' | 'warn' | 'danger' | 'secondary' {
    switch (type) {
      case 'text':
        return 'info';
      case 'number':
        return 'success';
      case 'date':
        return 'warn';
      case 'file':
      case 'photo':
        return 'secondary';
      case 'dropdown':
        return 'danger';
      default:
        return 'info';
    }
  }

  openForm(field?: GRNFieldConfig): void {
    this.editing = field || null;
    this.form.reset({
      stepNumber: this.selectedStep,
      fieldName: '',
      fieldLabel: '',
      fieldType: 'text',
      displayOrder: this.filteredFields.length + 1,
      isRequired: false,
      optionsText: '',
      allowMultiple: false,
      maxFiles: 5,
    });
    if (field) {
      this.form.patchValue({
        stepNumber: field.stepNumber,
        fieldName: field.fieldName,
        fieldLabel: field.fieldLabel,
        fieldType: field.fieldType,
        displayOrder: field.displayOrder,
        isRequired: field.isRequired,
        optionsText: field.options?.join('\n') || '',
        allowMultiple: field.allowMultiple || false,
        maxFiles: field.maxFiles || 5,
      });
    }
    this.formVisible = true;
  }

  closeForm(): void {
    this.formVisible = false;
    this.editing = null;
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const formValue = this.form.value;
    const options =
      formValue.fieldType === 'dropdown' && formValue.optionsText
        ? formValue.optionsText.split('\n').filter((o: string) => o.trim())
        : undefined;

    const isFileType = formValue.fieldType === 'file' || formValue.fieldType === 'photo';

    const data: any = {
      stepNumber: formValue.stepNumber,
      fieldName: formValue.fieldName,
      fieldLabel: formValue.fieldLabel,
      fieldType: formValue.fieldType,
      displayOrder: formValue.displayOrder,
      isRequired: formValue.isRequired,
      options,
    };

    // Add file-specific options
    if (isFileType) {
      data.allowMultiple = formValue.allowMultiple;
      data.maxFiles = formValue.allowMultiple ? formValue.maxFiles : 1;
    }

    const obs = this.editing
      ? this.configService.update(this.editing.id, data)
      : this.configService.create(data);

    obs.subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.showSuccess(
            'Success',
            this.editing ? 'Field updated' : 'Field created'
          );
          this.closeForm();
          this.loadFields();
        }
      },
      error: (err) => {
        const errorMessage = err.error?.message || 'Operation failed';
        this.toastService.showError('Error', errorMessage);
      },
    });
  }

  toggleStatus(field: GRNFieldConfig): void {
    this.configService.toggleStatus(field.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.showSuccess(
            'Success',
            `Field ${res.data?.isActive ? 'activated' : 'deactivated'}`
          );
          this.loadFields();
        }
      },
      error: () => this.toastService.showError('Error', 'Failed to toggle status'),
    });
  }

  confirmDelete(field: GRNFieldConfig): void {
    this.confirmService.confirmDelete(`field "${field.fieldLabel}"`).then((confirmed) => {
      if (confirmed) {
        this.configService.delete(field.id).subscribe({
          next: (res) => {
            if (res.success) {
              this.toastService.showSuccess('Success', 'Field deleted');
              this.loadFields();
            }
          },
          error: () => this.toastService.showError('Error', 'Failed to delete field'),
        });
      }
    });
  }

  initializeDefaults(): void {
    this.loading = true;
    this.configService.initializeDefaults().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.toastService.showSuccess('Success', 'Default field configurations created');
          this.loadFields();
        } else {
          this.toastService.showInfo('Info', res.message || 'Fields already exist');
        }
      },
      error: (err) => {
        this.loading = false;
        const errorMessage = err.error?.message || 'Failed to initialize defaults';
        this.toastService.showError('Error', errorMessage);
      },
    });
  }
}
