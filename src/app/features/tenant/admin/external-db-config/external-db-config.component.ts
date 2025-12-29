import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { Button } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Checkbox } from 'primeng/checkbox';
import { TabsModule } from 'primeng/tabs';
import { Card } from 'primeng/card';
import { TableModule } from 'primeng/table';
import {
  ExternalDbConfigService,
  ExternalDbConfig,
  FieldMapping,
} from './external-db-config.service';
import { ToastService } from '../../../../core/services/toast.service';
import { AuthService } from '../../../../core/services/auth.service';
import { SelectComponent } from '../../../../shared/components/select/select.component';

@Component({
  selector: 'app-external-db-config',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Button,
    InputTextModule,
    InputNumber,
    Checkbox,
    TabsModule,
    Card,
    TableModule,
    SelectComponent,
  ],
  template: `
    <div class="external-db-config">
      <div class="page-header">
        <div>
          <h1>External Database Configuration</h1>
          <p>
            Configure connection to your external ERP/third-party database for Vendors, POs, and
            Materials.
          </p>
        </div>
        <div class="header-actions">
          <p-button
            label="Test Connection"
            icon="pi pi-bolt"
            severity="secondary"
            (click)="testConnection()"
            [loading]="testing"
            [disabled]="!config?.externalDbEnabled"
          ></p-button>
          <p-button
            label="Save Configuration"
            icon="pi pi-save"
            (click)="saveConfig()"
            [loading]="saving"
          ></p-button>
        </div>
      </div>

      @if (loading) {
      <div class="loading-state">
        <i class="pi pi-spin pi-spinner"></i>
        <p>Loading configuration...</p>
      </div>
      } @else {
      <form [formGroup]="form">
        <!-- Enable/Disable Toggle -->
        <p-card class="config-card">
          <div class="enable-section">
            <div class="enable-info">
              <h3>External Database Integration</h3>
              <p>
                When enabled, Vendors, Purchase Orders, and Materials will be fetched from your
                external database instead of the internal system.
              </p>
            </div>
            <div class="enable-toggle">
              <p-checkbox
                formControlName="externalDbEnabled"
                [binary]="true"
                inputId="externalDbEnabled"
              ></p-checkbox>
              <label for="externalDbEnabled">
                {{ form.value.externalDbEnabled ? 'Enabled' : 'Disabled' }}
              </label>
            </div>
          </div>
        </p-card>

        @if (form.value.externalDbEnabled) {
        <!-- Connection Settings -->
        <p-card class="config-card">
          <ng-template pTemplate="header">
            <div class="card-header">
              <i class="pi pi-database"></i>
              <span>Connection Settings</span>
            </div>
          </ng-template>
          <div class="form-grid">
            <div class="form-field">
              <label for="externalDbHost">Host *</label>
              <input
                pInputText
                id="externalDbHost"
                formControlName="externalDbHost"
                placeholder="e.g., db.example.com"
              />
            </div>
            <div class="form-field">
              <label for="externalDbPort">Port</label>
              <p-inputnumber
                id="externalDbPort"
                formControlName="externalDbPort"
                [min]="1"
                [max]="65535"
                placeholder="3306"
              ></p-inputnumber>
            </div>
            <div class="form-field">
              <label for="externalDbName">Database Name *</label>
              <input
                pInputText
                id="externalDbName"
                formControlName="externalDbName"
                placeholder="e.g., erp_database"
              />
            </div>
            <div class="form-field">
              <label for="externalDbUsername">Username *</label>
              <input
                pInputText
                id="externalDbUsername"
                formControlName="externalDbUsername"
                placeholder="Database username"
              />
            </div>
            <div class="form-field">
              <label for="externalDbPassword">
                Password {{ config?.hasPassword ? '(leave blank to keep current)' : '*' }}
              </label>
              <input
                pInputText
                type="password"
                id="externalDbPassword"
                formControlName="externalDbPassword"
                placeholder="Database password"
              />
            </div>
            <div class="form-field">
              <label for="externalDbCacheTtl">Cache TTL (seconds)</label>
              <p-inputnumber
                id="externalDbCacheTtl"
                formControlName="externalDbCacheTtl"
                [min]="0"
                [max]="86400"
                placeholder="300"
              ></p-inputnumber>
              <small class="hint"
                >How long to cache data from external database (0 = no cache)</small
              >
            </div>
          </div>
        </p-card>

        <!-- Table Configuration -->
        <p-card class="config-card">
          <ng-template pTemplate="header">
            <div class="card-header">
              <i class="pi pi-table"></i>
              <span>Table Configuration</span>
            </div>
          </ng-template>
          <div class="form-grid">
            <div class="form-field">
              <label for="externalDbVendorTable">Vendor Table</label>
              <input
                pInputText
                id="externalDbVendorTable"
                formControlName="externalDbVendorTable"
                placeholder="vendors"
              />
            </div>
            <div class="form-field">
              <label for="externalDbPoTable">Purchase Order Table</label>
              <input
                pInputText
                id="externalDbPoTable"
                formControlName="externalDbPoTable"
                placeholder="purchase_orders"
              />
            </div>
            <div class="form-field">
              <label for="externalDbMaterialTable">Material Table</label>
              <input
                pInputText
                id="externalDbMaterialTable"
                formControlName="externalDbMaterialTable"
                placeholder="materials"
              />
            </div>
          </div>
        </p-card>

        <!-- Field Mappings -->
        <p-card class="config-card">
          <ng-template pTemplate="header">
            <div class="card-header">
              <i class="pi pi-arrows-h"></i>
              <span>Field Mappings</span>
            </div>
          </ng-template>
          <p class="mapping-info">
            Configure how fields from your external database map to the internal system fields.
            Leave blank to use default mappings.
          </p>
          <div class="mapping-tabs">
            <p-tabs value="0">
              <p-tablist>
                <p-tab value="0">Vendor Mappings</p-tab>
                <p-tab value="1">PO Mappings</p-tab>
                <p-tab value="2">Material Mappings</p-tab>
              </p-tablist>
              <p-tabpanels>
                <p-tabpanel value="0">
                  <div class="mapping-actions">
                    <p-button
                      label="Add Mapping"
                      icon="pi pi-plus"
                      size="small"
                      (click)="addMapping('vendor')"
                    ></p-button>
                  </div>
                  <p-table [value]="vendorMappings.controls" styleClass="p-datatable-sm">
                    <ng-template pTemplate="header">
                      <tr>
                        <th>Internal Field</th>
                        <th>External Field</th>
                        <th>Transform</th>
                        <th style="width: 80px">Actions</th>
                      </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-mapping let-i="rowIndex">
                      <tr [formGroup]="mapping">
                        <td>
                          <input
                            pInputText
                            formControlName="internalField"
                            placeholder="e.g., companyName"
                          />
                        </td>
                        <td>
                          <input
                            pInputText
                            formControlName="externalField"
                            placeholder="e.g., company_name"
                          />
                        </td>
                        <td>
                          <app-select
                            formControlName="transform"
                            [options]="transformOptions"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Select"
                          ></app-select>
                        </td>
                        <td>
                          <p-button
                            icon="pi pi-trash"
                            [rounded]="true"
                            [text]="true"
                            severity="danger"
                            (click)="removeMapping('vendor', i)"
                          ></p-button>
                        </td>
                      </tr>
                    </ng-template>
                    <ng-template pTemplate="emptymessage">
                      <tr>
                        <td colspan="4" class="text-center">
                          Using default mappings. Add custom mappings to override.
                        </td>
                      </tr>
                    </ng-template>
                  </p-table>
                </p-tabpanel>
                <p-tabpanel value="1">
                  <div class="mapping-actions">
                    <p-button
                      label="Add Mapping"
                      icon="pi pi-plus"
                      size="small"
                      (click)="addMapping('po')"
                    ></p-button>
                  </div>
                  <p-table [value]="poMappings.controls" styleClass="p-datatable-sm">
                    <ng-template pTemplate="header">
                      <tr>
                        <th>Internal Field</th>
                        <th>External Field</th>
                        <th>Transform</th>
                        <th style="width: 80px">Actions</th>
                      </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-mapping let-i="rowIndex">
                      <tr [formGroup]="mapping">
                        <td>
                          <input
                            pInputText
                            formControlName="internalField"
                            placeholder="e.g., poNumber"
                          />
                        </td>
                        <td>
                          <input
                            pInputText
                            formControlName="externalField"
                            placeholder="e.g., po_number"
                          />
                        </td>
                        <td>
                          <app-select
                            formControlName="transform"
                            [options]="transformOptions"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Select"
                          ></app-select>
                        </td>
                        <td>
                          <p-button
                            icon="pi pi-trash"
                            [rounded]="true"
                            [text]="true"
                            severity="danger"
                            (click)="removeMapping('po', i)"
                          ></p-button>
                        </td>
                      </tr>
                    </ng-template>
                    <ng-template pTemplate="emptymessage">
                      <tr>
                        <td colspan="4" class="text-center">
                          Using default mappings. Add custom mappings to override.
                        </td>
                      </tr>
                    </ng-template>
                  </p-table>
                </p-tabpanel>
                <p-tabpanel value="2">
                  <div class="mapping-actions">
                    <p-button
                      label="Add Mapping"
                      icon="pi pi-plus"
                      size="small"
                      (click)="addMapping('material')"
                    ></p-button>
                  </div>
                  <p-table [value]="materialMappings.controls" styleClass="p-datatable-sm">
                    <ng-template pTemplate="header">
                      <tr>
                        <th>Internal Field</th>
                        <th>External Field</th>
                        <th>Transform</th>
                        <th style="width: 80px">Actions</th>
                      </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-mapping let-i="rowIndex">
                      <tr [formGroup]="mapping">
                        <td>
                          <input
                            pInputText
                            formControlName="internalField"
                            placeholder="e.g., name"
                          />
                        </td>
                        <td>
                          <input
                            pInputText
                            formControlName="externalField"
                            placeholder="e.g., material_name"
                          />
                        </td>
                        <td>
                          <app-select
                            formControlName="transform"
                            [options]="transformOptions"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Select"
                          ></app-select>
                        </td>
                        <td>
                          <p-button
                            icon="pi pi-trash"
                            [rounded]="true"
                            [text]="true"
                            severity="danger"
                            (click)="removeMapping('material', i)"
                          ></p-button>
                        </td>
                      </tr>
                    </ng-template>
                    <ng-template pTemplate="emptymessage">
                      <tr>
                        <td colspan="4" class="text-center">
                          Using default mappings. Add custom mappings to override.
                        </td>
                      </tr>
                    </ng-template>
                  </p-table>
                </p-tabpanel>
              </p-tabpanels>
            </p-tabs>
          </div>
        </p-card>
        }
      </form>
      }
    </div>
  `,
  styles: [
    `
      .external-db-config {
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

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          color: #64748b;
          i {
            font-size: 2rem;
            margin-bottom: 1rem;
          }
        }

        .config-card {
          margin-bottom: 1rem;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          color: #1e293b;
          i {
            color: #3b82f6;
          }
        }

        .enable-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          .enable-info {
            h3 {
              margin: 0 0 0.25rem 0;
              font-size: 1rem;
              font-weight: 600;
            }
            p {
              margin: 0;
              color: #64748b;
              font-size: 0.875rem;
            }
          }
          .enable-toggle {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            label {
              font-weight: 500;
            }
          }
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          label {
            font-weight: 500;
            color: #334155;
            font-size: 0.875rem;
          }
          input,
          :host ::ng-deep p-inputnumber {
            width: 100%;
          }
          .hint {
            color: #64748b;
            font-size: 0.75rem;
          }
        }

        .mapping-info {
          color: #64748b;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        .mapping-tabs {
          margin-top: 1rem;
        }

        .mapping-actions {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 0.5rem;
        }

        .text-center {
          text-align: center;
          color: #64748b;
          padding: 1rem !important;
        }
      }
    `,
  ],
})
export class ExternalDbConfigComponent implements OnInit {
  config: ExternalDbConfig | null = null;
  loading = false;
  saving = false;
  testing = false;
  form!: FormGroup;
  tenantId!: number;

  transformOptions = [
    { label: 'String', value: 'string' },
    { label: 'Number', value: 'number' },
    { label: 'Date', value: 'date' },
    { label: 'Boolean', value: 'boolean' },
  ];

  constructor(
    private fb: FormBuilder,
    private configService: ExternalDbConfigService,
    private toastService: ToastService,
    private authService: AuthService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user?.tenantId) {
      this.tenantId = user.tenantId;
      this.loadConfig();
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      externalDbEnabled: [false],
      externalDbHost: [''],
      externalDbPort: [3306],
      externalDbName: [''],
      externalDbUsername: [''],
      externalDbPassword: [''],
      externalDbVendorTable: ['vendors'],
      externalDbPoTable: ['purchase_orders'],
      externalDbMaterialTable: ['materials'],
      externalDbCacheTtl: [300],
      externalDbVendorMappings: this.fb.array([]),
      externalDbPoMappings: this.fb.array([]),
      externalDbMaterialMappings: this.fb.array([]),
    });
  }

  get vendorMappings(): FormArray {
    return this.form.get('externalDbVendorMappings') as FormArray;
  }

  get poMappings(): FormArray {
    return this.form.get('externalDbPoMappings') as FormArray;
  }

  get materialMappings(): FormArray {
    return this.form.get('externalDbMaterialMappings') as FormArray;
  }

  loadConfig(): void {
    this.loading = true;
    this.configService.getConfig(this.tenantId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.config = res.data;
          this.patchForm(res.data);
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastService.showError('Error', 'Failed to load configuration');
      },
    });
  }

  private patchForm(config: ExternalDbConfig): void {
    this.form.patchValue({
      externalDbEnabled: config.externalDbEnabled,
      externalDbHost: config.externalDbHost || '',
      externalDbPort: config.externalDbPort || 3306,
      externalDbName: config.externalDbName || '',
      externalDbUsername: config.externalDbUsername || '',
      externalDbPassword: '',
      externalDbVendorTable: config.externalDbVendorTable || 'vendors',
      externalDbPoTable: config.externalDbPoTable || 'purchase_orders',
      externalDbMaterialTable: config.externalDbMaterialTable || 'materials',
      externalDbCacheTtl: config.externalDbCacheTtl || 300,
    });

    // Clear and repopulate mappings
    this.vendorMappings.clear();
    this.poMappings.clear();
    this.materialMappings.clear();

    config.externalDbVendorMappings?.forEach((m) =>
      this.vendorMappings.push(this.createMappingGroup(m))
    );
    config.externalDbPoMappings?.forEach((m) => this.poMappings.push(this.createMappingGroup(m)));
    config.externalDbMaterialMappings?.forEach((m) =>
      this.materialMappings.push(this.createMappingGroup(m))
    );
  }

  private createMappingGroup(mapping?: FieldMapping): FormGroup {
    return this.fb.group({
      internalField: [mapping?.internalField || '', Validators.required],
      externalField: [mapping?.externalField || '', Validators.required],
      transform: [mapping?.transform || 'string'],
    });
  }

  addMapping(type: 'vendor' | 'po' | 'material'): void {
    const mappings =
      type === 'vendor'
        ? this.vendorMappings
        : type === 'po'
        ? this.poMappings
        : this.materialMappings;
    mappings.push(this.createMappingGroup());
  }

  removeMapping(type: 'vendor' | 'po' | 'material', index: number): void {
    const mappings =
      type === 'vendor'
        ? this.vendorMappings
        : type === 'po'
        ? this.poMappings
        : this.materialMappings;
    mappings.removeAt(index);
  }

  saveConfig(): void {
    const formValue = this.form.value;

    // Build update request
    const updateData: any = {
      externalDbEnabled: formValue.externalDbEnabled,
    };

    if (formValue.externalDbEnabled) {
      updateData.externalDbHost = formValue.externalDbHost;
      updateData.externalDbPort = formValue.externalDbPort;
      updateData.externalDbName = formValue.externalDbName;
      updateData.externalDbUsername = formValue.externalDbUsername;
      updateData.externalDbVendorTable = formValue.externalDbVendorTable;
      updateData.externalDbPoTable = formValue.externalDbPoTable;
      updateData.externalDbMaterialTable = formValue.externalDbMaterialTable;
      updateData.externalDbCacheTtl = formValue.externalDbCacheTtl;

      // Only include password if provided
      if (formValue.externalDbPassword) {
        updateData.externalDbPassword = formValue.externalDbPassword;
      }

      // Include mappings if any are defined
      if (this.vendorMappings.length > 0) {
        updateData.externalDbVendorMappings = this.vendorMappings.value;
      }
      if (this.poMappings.length > 0) {
        updateData.externalDbPoMappings = this.poMappings.value;
      }
      if (this.materialMappings.length > 0) {
        updateData.externalDbMaterialMappings = this.materialMappings.value;
      }
    }

    this.saving = true;
    this.configService.updateConfig(this.tenantId, updateData).subscribe({
      next: (res) => {
        this.saving = false;
        if (res.success) {
          this.config = res.data || null;
          this.toastService.showSuccess('Success', 'Configuration saved successfully');
          // Clear password field after save
          this.form.patchValue({ externalDbPassword: '' });
        }
      },
      error: (err) => {
        this.saving = false;
        const errorMessage = err.error?.message || 'Failed to save configuration';
        this.toastService.showError('Error', errorMessage);
      },
    });
  }

  testConnection(): void {
    this.testing = true;
    this.configService.testConnection(this.tenantId).subscribe({
      next: (res) => {
        this.testing = false;
        if (res.success && res.data?.connected) {
          this.toastService.showSuccess('Success', 'Connection successful!');
        } else {
          this.toastService.showError(
            'Connection Failed',
            res.message || 'Could not connect to external database'
          );
        }
      },
      error: (err) => {
        this.testing = false;
        const errorMessage = err.error?.message || 'Connection test failed';
        this.toastService.showError('Error', errorMessage);
      },
    });
  }
}
