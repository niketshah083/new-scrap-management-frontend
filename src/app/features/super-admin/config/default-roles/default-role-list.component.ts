import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Chip } from 'primeng/chip';
import { Tag } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ConfigService, DefaultRole, Permission } from '../config.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { MultiselectComponent } from '../../../../shared/components/multiselect/multiselect.component';

@Component({
  selector: 'app-default-role-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    Button,
    Dialog,
    InputTextModule,
    Chip,
    Tag,
    TextareaModule,
    MultiselectComponent,
  ],
  template: `
    <div class="config-list">
      <div class="page-header">
        <h1>Default Roles</h1>
        <p-button label="Add Role" icon="pi pi-plus" (click)="openForm()"></p-button>
      </div>

      <p-table [value]="roles" [loading]="loading" styleClass="p-datatable-striped">
        <ng-template pTemplate="header">
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Status</th>
            <th>Permissions</th>
            <th style="width: 120px">Actions</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-role>
          <tr>
            <td>{{ role.name }}</td>
            <td>{{ role.description || '-' }}</td>
            <td>
              <p-tag
                [value]="role.isActive ? 'Active' : 'Inactive'"
                [severity]="role.isActive ? 'success' : 'danger'"
              ></p-tag>
            </td>
            <td>
              <div class="permissions-list">
                @for (perm of role.permissions?.slice(0, 3); track perm.id) {
                <p-chip [label]="perm.code"></p-chip>
                } @if (role.permissions?.length > 3) {
                <span class="more-count">+{{ role.permissions.length - 3 }} more</span>
                }
              </div>
            </td>
            <td>
              <div class="action-buttons">
                <p-button
                  icon="pi pi-pencil"
                  [rounded]="true"
                  [text]="true"
                  severity="info"
                  (click)="openForm(role)"
                ></p-button>
                <p-button
                  icon="pi pi-trash"
                  [rounded]="true"
                  [text]="true"
                  severity="danger"
                  (click)="confirmDelete(role)"
                ></p-button>
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="5" class="text-center">No default roles found</td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog
      [(visible)]="formVisible"
      [header]="editing ? 'Edit Role' : 'Add Role'"
      [modal]="true"
      [style]="{ width: '500px' }"
    >
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-field">
          <label for="name">Name *</label>
          <input pInputText id="name" formControlName="name" placeholder="Enter role name" />
        </div>
        <div class="form-field">
          <label for="description">Description</label>
          <textarea
            pTextarea
            id="description"
            formControlName="description"
            placeholder="Enter role description"
            rows="3"
          ></textarea>
        </div>
        <div class="form-field">
          <app-multiselect
            id="permissionIds"
            formControlName="permissionIds"
            [options]="permissions"
            label="Permissions"
            optionLabel="code"
            optionValue="id"
            placeholder="Select permissions"
            display="chip"
          ></app-multiselect>
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
        .permissions-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
          align-items: center;
          .more-count {
            font-size: 0.75rem;
            color: #64748b;
          }
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
export class DefaultRoleListComponent implements OnInit {
  roles: DefaultRole[] = [];
  permissions: Permission[] = [];
  loading = false;
  formVisible = false;
  editing: DefaultRole | null = null;
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
      description: [''],
      permissionIds: [[]],
    });
  }

  ngOnInit(): void {
    this.loadRoles();
    this.loadPermissions();
  }

  loadRoles(): void {
    this.loading = true;
    this.configService.getDefaultRoles().subscribe({
      next: (res) => {
        if (res.success && res.data) this.roles = res.data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
        this.toastService.showError('Error', 'Failed to load roles');
      },
    });
  }

  loadPermissions(): void {
    this.configService.getPermissions().subscribe({
      next: (res) => {
        if (res.success && res.data) this.permissions = res.data;
      },
    });
  }

  openForm(role?: DefaultRole): void {
    this.editing = role || null;
    this.form.reset({ permissionIds: [] });
    if (role)
      this.form.patchValue({
        name: role.name,
        description: role.description || '',
        permissionIds: role.permissions?.map((p) => p.id) || [],
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
      ? this.configService.updateDefaultRole(this.editing.id, this.form.value)
      : this.configService.createDefaultRole(this.form.value);
    obs.subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.showSuccess('Success', this.editing ? 'Role updated' : 'Role created');
          this.closeForm();
          this.loadRoles();
        }
      },
      error: () => this.toastService.showError('Error', 'Operation failed'),
    });
  }

  confirmDelete(role: DefaultRole): void {
    this.confirmService.confirmDelete(`role "${role.name}"`).then((confirmed) => {
      if (confirmed)
        this.configService.deleteDefaultRole(role.id).subscribe({
          next: (res) => {
            if (res.success) {
              this.toastService.showSuccess('Success', 'Role deleted');
              this.loadRoles();
            }
          },
          error: () => this.toastService.showError('Error', 'Failed to delete role'),
        });
    });
  }
}
