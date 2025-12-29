import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Tag } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ConfigService, Module } from '../config.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmService } from '../../../../core/services/confirm.service';

@Component({
  selector: 'app-module-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    Button,
    Dialog,
    Tag,
    InputTextModule,
    TextareaModule,
  ],
  template: `
    <div class="config-list">
      <div class="page-header">
        <h1>Modules</h1>
        <p-button label="Add Module" icon="pi pi-plus" (click)="openForm()"></p-button>
      </div>

      <p-table [value]="modules" [loading]="loading" styleClass="p-datatable-striped">
        <ng-template pTemplate="header">
          <tr>
            <th>Name</th>
            <th>Code</th>
            <th>Description</th>
            <th>Status</th>
            <th style="width: 150px">Actions</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-module>
          <tr>
            <td>{{ module.name }}</td>
            <td>{{ module.code }}</td>
            <td>{{ module.description || '-' }}</td>
            <td>
              <p-tag
                [value]="module.isActive ? 'Active' : 'Inactive'"
                [severity]="module.isActive ? 'success' : 'danger'"
              ></p-tag>
            </td>
            <td>
              <div class="action-buttons">
                <p-button
                  icon="pi pi-pencil"
                  [rounded]="true"
                  [text]="true"
                  severity="info"
                  (click)="openForm(module)"
                ></p-button>
                <p-button
                  [icon]="module.isActive ? 'pi pi-ban' : 'pi pi-check'"
                  [rounded]="true"
                  [text]="true"
                  [severity]="module.isActive ? 'warn' : 'success'"
                  (click)="toggleStatus(module)"
                ></p-button>
                <p-button
                  icon="pi pi-trash"
                  [rounded]="true"
                  [text]="true"
                  severity="danger"
                  (click)="confirmDelete(module)"
                ></p-button>
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="5" class="text-center">No modules found</td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog
      [(visible)]="formVisible"
      [header]="editing ? 'Edit Module' : 'Add Module'"
      [modal]="true"
      [style]="{ width: '450px' }"
    >
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-field">
          <label for="name">Name *</label>
          <input pInputText id="name" formControlName="name" placeholder="Enter module name" />
        </div>
        <div class="form-field">
          <label for="code">Code *</label>
          <input
            pInputText
            id="code"
            formControlName="code"
            placeholder="Enter module code"
            [readonly]="!!editing"
          />
        </div>
        <div class="form-field">
          <label for="description">Description</label>
          <textarea
            pTextarea
            id="description"
            formControlName="description"
            placeholder="Enter module description"
            rows="3"
          ></textarea>
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
        input,
        textarea {
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
export class ModuleListComponent implements OnInit {
  modules: Module[] = [];
  loading = false;
  formVisible = false;
  editing: Module | null = null;
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private configService: ConfigService,
    private toastService: ToastService,
    private confirmService: ConfirmService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      code: ['', Validators.required],
      description: [''],
    });
  }

  ngOnInit(): void {
    this.loadModules();
  }

  loadModules(): void {
    this.loading = true;
    this.configService.getModules().subscribe({
      next: (res) => {
        if (res.success && res.data) this.modules = res.data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
        this.toastService.showError('Error', 'Failed to load modules');
      },
    });
  }

  openForm(module?: Module): void {
    this.editing = module || null;
    this.form.reset();
    if (module)
      this.form.patchValue({
        name: module.name,
        code: module.code,
        description: module.description || '',
      });
    this.formVisible = true;
  }

  closeForm(): void {
    this.formVisible = false;
    this.editing = null;
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const obs = this.editing
      ? this.configService.updateModule(this.editing.id, this.form.value)
      : this.configService.createModule(this.form.value);
    obs.subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.showSuccess(
            'Success',
            this.editing ? 'Module updated' : 'Module created'
          );
          this.closeForm();
          this.loadModules();
        }
      },
      error: () => this.toastService.showError('Error', 'Operation failed'),
    });
  }

  toggleStatus(module: Module): void {
    this.configService.toggleModuleStatus(module.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.showSuccess(
            'Success',
            `Module ${res.data?.isActive ? 'activated' : 'deactivated'}`
          );
          this.loadModules();
        }
      },
      error: () => this.toastService.showError('Error', 'Failed to toggle status'),
    });
  }

  confirmDelete(module: Module): void {
    this.confirmService.confirmDelete(`module "${module.name}"`).then((confirmed) => {
      if (confirmed)
        this.configService.deleteModule(module.id).subscribe({
          next: (res) => {
            if (res.success) {
              this.toastService.showSuccess('Success', 'Module deleted');
              this.loadModules();
            }
          },
          error: () => this.toastService.showError('Error', 'Failed to delete module'),
        });
    });
  }
}
