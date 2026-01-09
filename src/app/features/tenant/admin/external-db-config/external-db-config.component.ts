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
            <div class="form-field">
              <label for="externalDbDeliveryOrderTable">Delivery Order Table</label>
              <input
                pInputText
                id="externalDbDeliveryOrderTable"
                formControlName="externalDbDeliveryOrderTable"
                placeholder="delivery_orders"
              />
            </div>
            <div class="form-field">
              <label for="externalDbDeliveryOrderItemTable">Delivery Order Item Table</label>
              <input
                pInputText
                id="externalDbDeliveryOrderItemTable"
                formControlName="externalDbDeliveryOrderItemTable"
                placeholder="delivery_order_items"
              />
            </div>
            <div class="form-field">
              <label for="externalDbTransporterTable">Transporter Table</label>
              <input
                pInputText
                id="externalDbTransporterTable"
                formControlName="externalDbTransporterTable"
                placeholder="transporters"
              />
            </div>
            <div class="form-field">
              <label for="externalDbDoItemRelationKey">DO-Item Relation Key</label>
              <app-select
                formControlName="externalDbDoItemRelationKey"
                [options]="relationKeyOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select relation key"
              ></app-select>
              <small class="hint">Field used to link delivery orders to their items</small>
            </div>
          </div>
        </p-card>

        <!-- Vendor Join Configuration for Delivery Orders -->
        <p-card class="config-card">
          <ng-template pTemplate="header">
            <div class="card-header">
              <i class="pi pi-link"></i>
              <span>Vendor Join Configuration (for Delivery Orders)</span>
            </div>
          </ng-template>
          <p class="mapping-info">
            Configure how to join delivery orders with vendor table to get vendor names. Leave blank
            if vendor name is directly available in DO table.
          </p>
          <div class="form-grid">
            <div class="form-field">
              <label for="externalDbDoVendorTable">Vendor Table Name</label>
              <input
                pInputText
                id="externalDbDoVendorTable"
                formControlName="externalDbDoVendorTable"
                placeholder="e.g., acmast"
              />
              <small class="hint">Table containing vendor/party details</small>
            </div>
            <div class="form-field">
              <label for="externalDbDoVendorFk">Foreign Key in DO Table</label>
              <input
                pInputText
                id="externalDbDoVendorFk"
                formControlName="externalDbDoVendorFk"
                placeholder="e.g., party"
              />
              <small class="hint">Column in DO table that references vendor</small>
            </div>
            <div class="form-field">
              <label for="externalDbDoVendorPk">Primary Key in Vendor Table</label>
              <input
                pInputText
                id="externalDbDoVendorPk"
                formControlName="externalDbDoVendorPk"
                placeholder="e.g., id"
              />
              <small class="hint">Primary key column in vendor table</small>
            </div>
            <div class="form-field">
              <label for="externalDbDoVendorNameField">Vendor Name Field</label>
              <input
                pInputText
                id="externalDbDoVendorNameField"
                formControlName="externalDbDoVendorNameField"
                placeholder="e.g., acname, name"
              />
              <small class="hint">Column containing vendor name in vendor table</small>
            </div>
          </div>
        </p-card>

        <!-- Material Join Configuration for DO Items -->
        <p-card class="config-card">
          <ng-template pTemplate="header">
            <div class="card-header">
              <i class="pi pi-link"></i>
              <span>Material Join Configuration (for DO Items)</span>
            </div>
          </ng-template>
          <p class="mapping-info">
            Configure how to join DO items with material table to get material names. Leave blank if
            material name is directly available in items table.
          </p>
          <div class="form-grid">
            <div class="form-field">
              <label for="externalDbDoItemMaterialTable">Material Table Name</label>
              <input
                pInputText
                id="externalDbDoItemMaterialTable"
                formControlName="externalDbDoItemMaterialTable"
                placeholder="e.g., item"
              />
              <small class="hint">Table containing material/item details</small>
            </div>
            <div class="form-field">
              <label for="externalDbDoItemMaterialFk">Foreign Key in Items Table</label>
              <input
                pInputText
                id="externalDbDoItemMaterialFk"
                formControlName="externalDbDoItemMaterialFk"
                placeholder="e.g., itemcode"
              />
              <small class="hint">Column in items table that references material</small>
            </div>
            <div class="form-field">
              <label for="externalDbDoItemMaterialPk">Primary Key in Material Table</label>
              <input
                pInputText
                id="externalDbDoItemMaterialPk"
                formControlName="externalDbDoItemMaterialPk"
                placeholder="e.g., itemcode"
              />
              <small class="hint">Primary key column in material table</small>
            </div>
            <div class="form-field">
              <label for="externalDbDoItemMaterialNameField">Material Name Field</label>
              <input
                pInputText
                id="externalDbDoItemMaterialNameField"
                formControlName="externalDbDoItemMaterialNameField"
                placeholder="e.g., itemname"
              />
              <small class="hint">Column containing material name in material table</small>
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
                <p-tab value="3">DO Mappings</p-tab>
                <p-tab value="4">DO Item Mappings</p-tab>
                <p-tab value="5">Transporter Mappings</p-tab>
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
                <p-tabpanel value="3">
                  <div class="mapping-actions">
                    <p-button
                      label="Add Mapping"
                      icon="pi pi-plus"
                      size="small"
                      (click)="addMapping('deliveryOrder')"
                    ></p-button>
                  </div>
                  <p-table [value]="deliveryOrderMappings.controls" styleClass="p-datatable-sm">
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
                            placeholder="e.g., doNumber"
                          />
                        </td>
                        <td>
                          <input
                            pInputText
                            formControlName="externalField"
                            placeholder="e.g., do_number"
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
                            (click)="removeMapping('deliveryOrder', i)"
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
                <p-tabpanel value="4">
                  <div class="mapping-actions">
                    <p-button
                      label="Add Mapping"
                      icon="pi pi-plus"
                      size="small"
                      (click)="addMapping('deliveryOrderItem')"
                    ></p-button>
                  </div>
                  <p-table [value]="deliveryOrderItemMappings.controls" styleClass="p-datatable-sm">
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
                            placeholder="e.g., materialId"
                          />
                        </td>
                        <td>
                          <input
                            pInputText
                            formControlName="externalField"
                            placeholder="e.g., material_id"
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
                            (click)="removeMapping('deliveryOrderItem', i)"
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
                <p-tabpanel value="5">
                  <div class="mapping-actions">
                    <p-button
                      label="Add Mapping"
                      icon="pi pi-plus"
                      size="small"
                      (click)="addMapping('transporter')"
                    ></p-button>
                  </div>
                  <p-table [value]="transporterMappings.controls" styleClass="p-datatable-sm">
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
                            placeholder="e.g., transporterName"
                          />
                        </td>
                        <td>
                          <input
                            pInputText
                            formControlName="externalField"
                            placeholder="e.g., transporter_name"
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
                            (click)="removeMapping('transporter', i)"
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

  transformOptions = [
    { label: 'String', value: 'string' },
    { label: 'Number', value: 'number' },
    { label: 'Date', value: 'date' },
    { label: 'Boolean', value: 'boolean' },
  ];

  relationKeyOptions = [
    { label: 'DO Number (doNumber)', value: 'doNumber' },
    { label: 'DO ID (id)', value: 'id' },
  ];

  constructor(
    private fb: FormBuilder,
    private configService: ExternalDbConfigService,
    private toastService: ToastService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadConfig();
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
      externalDbDeliveryOrderTable: ['delivery_orders'],
      externalDbDeliveryOrderItemTable: ['delivery_order_items'],
      externalDbDoItemRelationKey: ['doNumber'],
      externalDbCacheTtl: [300],
      // Vendor join configuration for DO
      externalDbDoVendorTable: [''],
      externalDbDoVendorFk: [''],
      externalDbDoVendorPk: ['id'],
      externalDbDoVendorNameField: [''],
      // Material join configuration for DO items
      externalDbDoItemMaterialTable: [''],
      externalDbDoItemMaterialFk: [''],
      externalDbDoItemMaterialPk: ['itemcode'],
      externalDbDoItemMaterialNameField: [''],
      externalDbVendorMappings: this.fb.array([]),
      externalDbPoMappings: this.fb.array([]),
      externalDbMaterialMappings: this.fb.array([]),
      externalDbDeliveryOrderMappings: this.fb.array([]),
      externalDbDeliveryOrderItemMappings: this.fb.array([]),
      externalDbTransporterTable: ['transporters'],
      externalDbTransporterMappings: this.fb.array([]),
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

  get deliveryOrderMappings(): FormArray {
    return this.form.get('externalDbDeliveryOrderMappings') as FormArray;
  }

  get deliveryOrderItemMappings(): FormArray {
    return this.form.get('externalDbDeliveryOrderItemMappings') as FormArray;
  }

  get transporterMappings(): FormArray {
    return this.form.get('externalDbTransporterMappings') as FormArray;
  }

  loadConfig(): void {
    this.loading = true;
    this.configService.getConfig().subscribe({
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
      externalDbDeliveryOrderTable: config.externalDbDeliveryOrderTable || 'delivery_orders',
      externalDbDeliveryOrderItemTable:
        config.externalDbDeliveryOrderItemTable || 'delivery_order_items',
      externalDbTransporterTable: config.externalDbTransporterTable || 'transporters',
      externalDbDoItemRelationKey: config.externalDbDoItemRelationKey || 'doNumber',
      externalDbCacheTtl: config.externalDbCacheTtl || 300,
      // Vendor join configuration for DO
      externalDbDoVendorTable: config.externalDbDoVendorTable || '',
      externalDbDoVendorFk: config.externalDbDoVendorFk || '',
      externalDbDoVendorPk: config.externalDbDoVendorPk || 'id',
      externalDbDoVendorNameField: config.externalDbDoVendorNameField || '',
      // Material join configuration for DO items
      externalDbDoItemMaterialTable: config.externalDbDoItemMaterialTable || '',
      externalDbDoItemMaterialFk: config.externalDbDoItemMaterialFk || '',
      externalDbDoItemMaterialPk: config.externalDbDoItemMaterialPk || 'itemcode',
      externalDbDoItemMaterialNameField: config.externalDbDoItemMaterialNameField || '',
    });

    // Clear and repopulate mappings
    this.vendorMappings.clear();
    this.poMappings.clear();
    this.materialMappings.clear();
    this.deliveryOrderMappings.clear();
    this.deliveryOrderItemMappings.clear();
    this.transporterMappings.clear();

    config.externalDbVendorMappings?.forEach((m) =>
      this.vendorMappings.push(this.createMappingGroup(m))
    );
    config.externalDbPoMappings?.forEach((m) => this.poMappings.push(this.createMappingGroup(m)));
    config.externalDbMaterialMappings?.forEach((m) =>
      this.materialMappings.push(this.createMappingGroup(m))
    );
    config.externalDbDeliveryOrderMappings?.forEach((m) =>
      this.deliveryOrderMappings.push(this.createMappingGroup(m))
    );
    config.externalDbDeliveryOrderItemMappings?.forEach((m) =>
      this.deliveryOrderItemMappings.push(this.createMappingGroup(m))
    );
    config.externalDbTransporterMappings?.forEach((m) =>
      this.transporterMappings.push(this.createMappingGroup(m))
    );
  }

  private createMappingGroup(mapping?: FieldMapping): FormGroup {
    return this.fb.group({
      internalField: [mapping?.internalField || '', Validators.required],
      externalField: [mapping?.externalField || '', Validators.required],
      transform: [mapping?.transform || 'string'],
    });
  }

  addMapping(
    type: 'vendor' | 'po' | 'material' | 'deliveryOrder' | 'deliveryOrderItem' | 'transporter'
  ): void {
    const mappings =
      type === 'vendor'
        ? this.vendorMappings
        : type === 'po'
        ? this.poMappings
        : type === 'material'
        ? this.materialMappings
        : type === 'deliveryOrder'
        ? this.deliveryOrderMappings
        : type === 'deliveryOrderItem'
        ? this.deliveryOrderItemMappings
        : this.transporterMappings;
    mappings.push(this.createMappingGroup());
  }

  removeMapping(
    type: 'vendor' | 'po' | 'material' | 'deliveryOrder' | 'deliveryOrderItem' | 'transporter',
    index: number
  ): void {
    const mappings =
      type === 'vendor'
        ? this.vendorMappings
        : type === 'po'
        ? this.poMappings
        : type === 'material'
        ? this.materialMappings
        : type === 'deliveryOrder'
        ? this.deliveryOrderMappings
        : type === 'deliveryOrderItem'
        ? this.deliveryOrderItemMappings
        : this.transporterMappings;
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
      updateData.externalDbDeliveryOrderTable = formValue.externalDbDeliveryOrderTable;
      updateData.externalDbDeliveryOrderItemTable = formValue.externalDbDeliveryOrderItemTable;
      updateData.externalDbTransporterTable = formValue.externalDbTransporterTable;
      updateData.externalDbDoItemRelationKey = formValue.externalDbDoItemRelationKey;
      updateData.externalDbCacheTtl = formValue.externalDbCacheTtl;
      // Vendor join configuration for DO
      updateData.externalDbDoVendorTable = formValue.externalDbDoVendorTable;
      updateData.externalDbDoVendorFk = formValue.externalDbDoVendorFk;
      updateData.externalDbDoVendorPk = formValue.externalDbDoVendorPk;
      updateData.externalDbDoVendorNameField = formValue.externalDbDoVendorNameField;
      // Material join configuration for DO items
      updateData.externalDbDoItemMaterialTable = formValue.externalDbDoItemMaterialTable;
      updateData.externalDbDoItemMaterialFk = formValue.externalDbDoItemMaterialFk;
      updateData.externalDbDoItemMaterialPk = formValue.externalDbDoItemMaterialPk;
      updateData.externalDbDoItemMaterialNameField = formValue.externalDbDoItemMaterialNameField;

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
      if (this.deliveryOrderMappings.length > 0) {
        updateData.externalDbDeliveryOrderMappings = this.deliveryOrderMappings.value;
      }
      if (this.deliveryOrderItemMappings.length > 0) {
        updateData.externalDbDeliveryOrderItemMappings = this.deliveryOrderItemMappings.value;
      }
      if (this.transporterMappings.length > 0) {
        updateData.externalDbTransporterMappings = this.transporterMappings.value;
      }
    }

    this.saving = true;
    this.configService.updateConfig(0, updateData).subscribe({
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
    this.configService.testConnection().subscribe({
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
