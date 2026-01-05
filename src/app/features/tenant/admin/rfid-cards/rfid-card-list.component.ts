import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Tag } from 'primeng/tag';
import { RFIDService } from '../../rfid/rfid.service';
import {
  RFIDCard,
  RFIDCardStatus,
  CreateRFIDCardRequest,
  UpdateRFIDCardRequest,
} from '../../rfid/rfid-card.model';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { SelectComponent } from '../../../../shared/components/select/select.component';

@Component({
  selector: 'app-rfid-card-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    Button,
    Dialog,
    InputTextModule,
    Textarea,
    Tag,
    SelectComponent,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>RFID Cards</h1>
          <p>Manage RFID cards for GRN tracking</p>
        </div>
        <p-button label="Add Card" icon="pi pi-plus" (click)="openCreateDialog()"></p-button>
      </div>

      <div class="card">
        <p-table
          [value]="cards"
          [loading]="loading"
          [paginator]="true"
          [rows]="10"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} cards"
          styleClass="p-datatable-sm"
        >
          <ng-template pTemplate="header">
            <tr>
              <th>Card Number</th>
              <th>Label</th>
              <th>Status</th>
              <th>Assigned GRN</th>
              <th>Last Scanned</th>
              <th style="width: 150px">Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-card>
            <tr>
              <td>
                <code>{{ card.cardNumber }}</code>
              </td>
              <td>{{ card.label || '-' }}</td>
              <td>
                <p-tag [value]="card.status" [severity]="getStatusSeverity(card.status)"></p-tag>
              </td>
              <td>{{ card.grnId ? 'GRN #' + card.grnId : '-' }}</td>
              <td>{{ card.lastScannedAt ? (card.lastScannedAt | date : 'short') : 'Never' }}</td>
              <td>
                <div class="action-buttons">
                  <p-button
                    icon="pi pi-pencil"
                    [rounded]="true"
                    [text]="true"
                    severity="info"
                    (click)="openEditDialog(card)"
                  ></p-button>
                  <p-button
                    icon="pi pi-trash"
                    [rounded]="true"
                    [text]="true"
                    severity="danger"
                    [disabled]="card.status === 'assigned'"
                    (click)="confirmDelete(card)"
                  ></p-button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="text-center p-4">
                No RFID cards found. Click "Add Card" to create one.
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <!-- Create/Edit Dialog -->
      <p-dialog
        [(visible)]="showDialog"
        [header]="editingCard ? 'Edit RFID Card' : 'Add RFID Card'"
        [modal]="true"
        [style]="{ width: '450px' }"
      >
        <div class="dialog-content">
          <div class="form-field" *ngIf="!editingCard">
            <label for="cardNumber">Card Number <span class="required">*</span></label>
            <input
              pInputText
              id="cardNumber"
              [(ngModel)]="formData.cardNumber"
              placeholder="Scan or enter card number"
              class="w-full"
            />
            <small class="hint">Scan the RFID card or manually enter its number</small>
          </div>

          <div class="form-field">
            <label for="label">Label</label>
            <input
              pInputText
              id="label"
              [(ngModel)]="formData.label"
              placeholder="e.g., Card #001"
              class="w-full"
            />
          </div>

          <div class="form-field" *ngIf="editingCard">
            <app-select
              id="status"
              [(ngModel)]="formData.status"
              [options]="statusOptions"
              label="Status"
              optionLabel="label"
              optionValue="value"
            ></app-select>
          </div>

          <div class="form-field">
            <label for="notes">Notes</label>
            <textarea
              pInputTextarea
              id="notes"
              [(ngModel)]="formData.notes"
              rows="3"
              placeholder="Optional notes about this card"
              class="w-full"
            ></textarea>
          </div>
        </div>

        <ng-template pTemplate="footer">
          <p-button
            label="Cancel"
            severity="secondary"
            [text]="true"
            (click)="closeDialog()"
          ></p-button>
          <p-button
            [label]="editingCard ? 'Update' : 'Create'"
            [loading]="saving"
            (click)="save()"
          ></p-button>
        </ng-template>
      </p-dialog>
    </div>
  `,
  styles: [
    `
      .page-container {
        padding: 24px;
      }
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        h1 {
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 4px 0;
        }
        p {
          color: #64748b;
          margin: 0;
        }
      }
      .card {
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        overflow: hidden;
      }
      .action-buttons {
        display: flex;
        gap: 4px;
      }
      .dialog-content {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .form-field {
        display: flex;
        flex-direction: column;
        gap: 8px;
        label {
          font-size: 14px;
          font-weight: 500;
          color: #334155;
        }
        .required {
          color: #ef4444;
        }
        .hint {
          font-size: 12px;
          color: #94a3b8;
        }
      }
      code {
        background: #f1f5f9;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 13px;
      }
      .w-full {
        width: 100%;
      }
      .text-center {
        text-align: center;
      }
      .p-4 {
        padding: 1rem;
      }
    `,
  ],
})
export class RfidCardListComponent implements OnInit {
  cards: RFIDCard[] = [];
  loading = false;
  saving = false;
  showDialog = false;
  editingCard: RFIDCard | null = null;

  formData: {
    cardNumber: string;
    label: string;
    status: RFIDCardStatus;
    notes: string;
  } = {
    cardNumber: '',
    label: '',
    status: RFIDCardStatus.AVAILABLE,
    notes: '',
  };

  statusOptions = [
    { label: 'Available', value: RFIDCardStatus.AVAILABLE },
    { label: 'Assigned', value: RFIDCardStatus.ASSIGNED },
    { label: 'Damaged', value: RFIDCardStatus.DAMAGED },
    { label: 'Lost', value: RFIDCardStatus.LOST },
  ];

  constructor(
    private rfidService: RFIDService,
    private toastService: ToastService,
    private confirmService: ConfirmService
  ) {}

  ngOnInit(): void {
    this.loadCards();
  }

  loadCards(): void {
    this.loading = true;
    this.rfidService.getAll().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) {
          this.cards = res.data;
        }
      },
      error: () => {
        this.loading = false;
        this.toastService.showError('Error', 'Failed to load RFID cards');
      },
    });
  }

  getStatusSeverity(status: RFIDCardStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case RFIDCardStatus.AVAILABLE:
        return 'success';
      case RFIDCardStatus.ASSIGNED:
        return 'info';
      case RFIDCardStatus.DAMAGED:
        return 'warn';
      case RFIDCardStatus.LOST:
        return 'danger';
      default:
        return 'secondary';
    }
  }

  openCreateDialog(): void {
    this.editingCard = null;
    this.formData = {
      cardNumber: '',
      label: '',
      status: RFIDCardStatus.AVAILABLE,
      notes: '',
    };
    this.showDialog = true;
  }

  openEditDialog(card: RFIDCard): void {
    this.editingCard = card;
    this.formData = {
      cardNumber: card.cardNumber,
      label: card.label || '',
      status: card.status,
      notes: card.notes || '',
    };
    this.showDialog = true;
  }

  closeDialog(): void {
    this.showDialog = false;
    this.editingCard = null;
  }

  save(): void {
    if (!this.editingCard && !this.formData.cardNumber.trim()) {
      this.toastService.showError('Error', 'Card number is required');
      return;
    }

    this.saving = true;

    if (this.editingCard) {
      const updateData: UpdateRFIDCardRequest = {
        label: this.formData.label || undefined,
        status: this.formData.status,
        notes: this.formData.notes || undefined,
      };

      this.rfidService.update(this.editingCard.id, updateData).subscribe({
        next: (res) => {
          this.saving = false;
          if (res.success) {
            this.toastService.showSuccess('Success', 'RFID card updated');
            this.closeDialog();
            this.loadCards();
          }
        },
        error: (err) => {
          this.saving = false;
          this.toastService.showError('Error', err.error?.message || 'Failed to update card');
        },
      });
    } else {
      const createData: CreateRFIDCardRequest = {
        cardNumber: this.formData.cardNumber.trim(),
        label: this.formData.label || undefined,
        notes: this.formData.notes || undefined,
      };

      this.rfidService.create(createData).subscribe({
        next: (res) => {
          this.saving = false;
          if (res.success) {
            this.toastService.showSuccess('Success', 'RFID card created');
            this.closeDialog();
            this.loadCards();
          }
        },
        error: (err) => {
          this.saving = false;
          this.toastService.showError('Error', err.error?.message || 'Failed to create card');
        },
      });
    }
  }

  confirmDelete(card: RFIDCard): void {
    this.confirmService
      .confirmDelete(`card "${card.label || card.cardNumber}"`)
      .then((confirmed) => {
        if (confirmed) {
          this.deleteCard(card);
        }
      });
  }

  deleteCard(card: RFIDCard): void {
    this.rfidService.delete(card.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.showSuccess('Success', 'RFID card deleted');
          this.loadCards();
        }
      },
      error: (err) => {
        this.toastService.showError('Error', err.error?.message || 'Failed to delete card');
      },
    });
  }
}
