import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ConfigService, Operation } from '../config.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmService } from '../../../../core/services/confirm.service';

@Component({
  selector: 'app-operation-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TableModule, Button, Dialog, InputTextModule],
  template: `
    <div class="config-list">
      <div class="page-header">
        <h1>Operations</h1>
        <p-button label="Add Operation" icon="pi pi-plus" (click)="openForm()"></p-button>
      </div>

      <p-table [value]="operations" [loading]="loading" styleClass="p-datatable-striped">
        <ng-template pTemplate="header">
          <tr>
            <th>Name</th>
            <th>Code</th>
            <th style="width: 120px">Actions</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-op>
          <tr>
            <td>{{ op.name }}</td>
            <td>{{ op.code }}</td>
            <td>
              <div class="action-buttons">
                <p-button
                  icon="pi pi-pencil"
                  [rounded]="true"
                  [text]="true"
                  severity="info"
                  (click)="openForm(op)"
                ></p-button>
                <p-button
                  icon="pi pi-trash"
                  [rounded]="true"
                  [text]="true"
                  severity="danger"
                  (click)="confirmDelete(op)"
                ></p-button>
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="3" class="text-center">No operations found</td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog
      [(visible)]="formVisible"
      [header]="editing ? 'Edit Operation' : 'Add Operation'"
      [modal]="true"
      [style]="{ width: '400px' }"
    >
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-field">
          <label for="name">Name *</label>
          <input pInputText id="name" formControlName="name" placeholder="Enter operation name" />
        </div>
        <div class="form-field">
          <label for="code">Code *</label>
          <input
            pInputText
            id="code"
            formControlName="code"
            placeholder="Enter operation code"
            [readonly]="!!editing"
          />
        </div>
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
      .config-list {
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          h1 {
            font-size: 1.5rem;
            font-weight: 600;
            color: #1e293b;
            margin: 0;
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
        input {
          width: 100%;
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
export class OperationListComponent implements OnInit {
  operations: Operation[] = [];
  loading = false;
  formVisible = false;
  editing: Operation | null = null;
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private configService: ConfigService,
    private toastService: ToastService,
    private confirmService: ConfirmService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({ name: ['', Validators.required], code: ['', Validators.required] });
  }

  ngOnInit(): void {
    this.loadOperations();
  }

  loadOperations(): void {
    this.loading = true;
    this.configService.getOperations().subscribe({
      next: (res) => {
        if (res.success && res.data) this.operations = res.data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
        this.toastService.showError('Error', 'Failed to load operations');
      },
    });
  }

  openForm(op?: Operation): void {
    this.editing = op || null;
    this.form.reset();
    if (op) this.form.patchValue({ name: op.name, code: op.code });
    this.formVisible = true;
  }

  closeForm(): void {
    this.formVisible = false;
    this.editing = null;
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const obs = this.editing
      ? this.configService.updateOperation(this.editing.id, this.form.value)
      : this.configService.createOperation(this.form.value);
    obs.subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.showSuccess(
            'Success',
            this.editing ? 'Operation updated' : 'Operation created'
          );
          this.closeForm();
          this.loadOperations();
        }
      },
      error: () => this.toastService.showError('Error', 'Operation failed'),
    });
  }

  confirmDelete(op: Operation): void {
    this.confirmService.confirmDelete(`operation "${op.name}"`).then((confirmed) => {
      if (confirmed)
        this.configService.deleteOperation(op.id).subscribe({
          next: (res) => {
            if (res.success) {
              this.toastService.showSuccess('Success', 'Operation deleted');
              this.loadOperations();
            }
          },
          error: () => this.toastService.showError('Error', 'Failed to delete operation'),
        });
    });
  }
}
