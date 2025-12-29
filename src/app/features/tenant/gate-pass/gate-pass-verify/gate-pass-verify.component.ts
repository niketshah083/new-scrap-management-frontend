import { Component, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Dialog } from 'primeng/dialog';
import { Html5Qrcode } from 'html5-qrcode';
import { GatePassService } from '../gate-pass.service';
import { GatePassVerifyResult } from '../gate-pass.model';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-gate-pass-verify',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, Button, Card, Dialog],
  template: `
    <div class="gate-pass-verify">
      <h1>Verify Gate Pass</h1>
      <p-card>
        <div class="verify-form">
          <div class="form-field">
            <label for="passNumber">Gate Pass Number</label>
            <input
              pInputText
              id="passNumber"
              [(ngModel)]="passNumber"
              placeholder="Enter gate pass number"
              (keyup.enter)="verify()"
            />
          </div>
          <div class="button-group">
            <p-button
              label="Verify"
              icon="pi pi-search"
              (click)="verify()"
              [loading]="loading"
            ></p-button>
            <p-button
              label="Scan QR"
              icon="pi pi-qrcode"
              severity="secondary"
              [outlined]="true"
              (click)="openScanner()"
            ></p-button>
          </div>
        </div>

        @if (result) {
        <div class="result" [class.valid]="result.valid" [class.invalid]="!result.valid">
          <div class="result-header">
            <i [class]="result.valid ? 'pi pi-check-circle' : 'pi pi-times-circle'"></i>
            <h3>{{ result.valid ? 'Valid Gate Pass' : 'Invalid Gate Pass' }}</h3>
          </div>
          <p class="result-message">{{ result.message }}</p>
          @if (result.gatePass) {
          <div class="gate-pass-details">
            <div class="detail-row">
              <span class="label">Pass Number</span>
              <span class="value highlight">{{ result.gatePass.passNumber }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Status</span>
              <span
                class="value status-badge"
                [class.active]="result.gatePass.status === 'active'"
                [class.used]="result.gatePass.status === 'used'"
                [class.expired]="result.gatePass.status === 'expired'"
              >
                {{ result.gatePass.status | uppercase }}
              </span>
            </div>
            <div class="detail-row">
              <span class="label">Expires At</span>
              <span class="value">{{ result.gatePass.expiresAt | date : 'medium' }}</span>
            </div>
            @if (result.gatePass.grn) {
            <div class="detail-row">
              <span class="label">GRN Number</span>
              <span class="value">{{ result.gatePass.grn.grnNumber }}</span>
            </div>
            }
          </div>
          @if (result.gatePass.status === 'active' && result.valid) {
          <div class="action-buttons">
            <p-button
              label="Mark as Used"
              icon="pi pi-check"
              severity="success"
              (click)="markAsUsed()"
              [loading]="markingUsed"
            ></p-button>
          </div>
          } }
        </div>
        }
      </p-card>
    </div>

    <!-- QR Scanner Dialog -->
    <p-dialog
      [(visible)]="showScanner"
      header="Scan QR Code"
      [modal]="true"
      [dismissableMask]="true"
      [style]="{ width: '90vw', maxWidth: '500px' }"
      (onHide)="onScannerClose()"
    >
      <div class="scanner-container">
        <div id="qr-reader" #qrReader></div>
        <p class="scanner-hint">Position the QR code within the frame to scan</p>
      </div>
      <ng-template pTemplate="footer">
        <p-button
          label="Cancel"
          severity="secondary"
          [text]="true"
          (click)="closeScanner()"
        ></p-button>
      </ng-template>
    </p-dialog>
  `,
  styles: [
    `
      .gate-pass-verify {
        h1 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 1.5rem 0;
        }
      }
      .verify-form {
        display: flex;
        gap: 1rem;
        align-items: flex-end;
        flex-wrap: wrap;
        .form-field {
          flex: 1;
          min-width: 250px;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          label {
            font-weight: 500;
            color: #334155;
          }
          input {
            width: 100%;
          }
        }
        .button-group {
          display: flex;
          gap: 0.5rem;
        }
      }
      .result {
        margin-top: 1.5rem;
        padding: 1.5rem;
        border-radius: 12px;
        &.valid {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border: 1px solid #86efac;
        }
        &.invalid {
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
          border: 1px solid #fecaca;
        }
        .result-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
          i {
            font-size: 1.5rem;
          }
          h3 {
            margin: 0;
            font-size: 1.25rem;
          }
        }
        &.valid .result-header i {
          color: #16a34a;
        }
        &.invalid .result-header i {
          color: #dc2626;
        }
        .result-message {
          margin: 0 0 1rem 0;
          color: #64748b;
        }
      }
      .gate-pass-details {
        background: white;
        border-radius: 8px;
        padding: 1rem;
        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid #f1f5f9;
          &:last-child {
            border-bottom: none;
          }
          .label {
            font-size: 0.875rem;
            color: #64748b;
          }
          .value {
            font-size: 0.9rem;
            color: #1e293b;
            font-weight: 500;
            &.highlight {
              font-size: 1rem;
              color: #3b82f6;
              font-weight: 700;
            }
          }
          .status-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
            &.active {
              background: #dcfce7;
              color: #166534;
            }
            &.used {
              background: #e0e7ff;
              color: #3730a3;
            }
            &.expired {
              background: #fee2e2;
              color: #991b1b;
            }
          }
        }
      }
      .action-buttons {
        margin-top: 1rem;
        display: flex;
        justify-content: flex-end;
      }
      .scanner-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        #qr-reader {
          width: 100%;
          max-width: 400px;
          border-radius: 8px;
          overflow: hidden;
        }
        .scanner-hint {
          color: #64748b;
          font-size: 0.875rem;
          text-align: center;
          margin: 0;
        }
      }
    `,
  ],
})
export class GatePassVerifyComponent implements OnDestroy, AfterViewInit {
  @ViewChild('qrReader') qrReaderElement!: ElementRef;

  passNumber = '';
  loading = false;
  markingUsed = false;
  result: GatePassVerifyResult | null = null;
  gatePassId: number | null = null;
  showScanner = false;
  private html5QrCode: Html5Qrcode | null = null;

  constructor(private gatePassService: GatePassService, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    // Initialize scanner element reference
  }

  ngOnDestroy(): void {
    this.stopScanner();
  }

  verify(): void {
    if (!this.passNumber) {
      this.toastService.showError('Error', 'Please enter a gate pass number');
      return;
    }
    this.loading = true;
    this.result = null;
    this.gatePassService.verify({ passNumber: this.passNumber }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) {
          this.result = res.data;
          if (res.data.gatePass) {
            this.gatePassId = res.data.gatePass.id;
          }
        }
      },
      error: (err) => {
        this.loading = false;
        const errorMessage = err.error?.message || 'Failed to verify gate pass';
        this.toastService.showError('Error', errorMessage);
      },
    });
  }

  markAsUsed(): void {
    if (!this.gatePassId) return;
    this.markingUsed = true;
    this.gatePassService.markAsUsed(this.gatePassId).subscribe({
      next: () => {
        this.markingUsed = false;
        this.toastService.showSuccess('Success', 'Gate pass marked as used');
        this.verify();
      },
      error: (err) => {
        this.markingUsed = false;
        const errorMessage = err.error?.message || 'Failed to mark as used';
        this.toastService.showError('Error', errorMessage);
      },
    });
  }

  openScanner(): void {
    this.showScanner = true;
    // Start scanner after dialog is visible
    setTimeout(() => this.startScanner(), 100);
  }

  closeScanner(): void {
    this.stopScanner();
    this.showScanner = false;
  }

  onScannerClose(): void {
    this.stopScanner();
  }

  private async startScanner(): Promise<void> {
    try {
      this.html5QrCode = new Html5Qrcode('qr-reader');
      await this.html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => this.onScanSuccess(decodedText),
        () => {
          // QR code not found - ignore
        }
      );
    } catch (err) {
      console.error('Error starting scanner:', err);
      this.toastService.showError('Error', 'Could not access camera. Please check permissions.');
      this.showScanner = false;
    }
  }

  private async stopScanner(): Promise<void> {
    if (this.html5QrCode) {
      try {
        await this.html5QrCode.stop();
        this.html5QrCode = null;
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  }

  private onScanSuccess(decodedText: string): void {
    // Stop scanner first
    this.stopScanner();
    this.showScanner = false;

    // Try to parse the QR code data
    try {
      const data = JSON.parse(decodedText);
      if (data.passNumber) {
        this.passNumber = data.passNumber;
        this.toastService.showSuccess('QR Scanned', `Pass Number: ${data.passNumber}`);
        // Auto-verify after scanning
        this.verify();
      } else {
        this.toastService.showError('Error', 'Invalid QR code format');
      }
    } catch {
      // If not JSON, treat as plain pass number
      this.passNumber = decodedText;
      this.toastService.showSuccess('QR Scanned', `Pass Number: ${decodedText}`);
      this.verify();
    }
  }
}
