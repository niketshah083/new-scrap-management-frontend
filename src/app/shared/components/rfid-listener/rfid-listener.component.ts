import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { RFIDScannerService } from '../../../core/services/rfid-scanner.service';
import { RFIDService } from '../../../features/tenant/rfid/rfid.service';
import { ToastService } from '../../../core/services/toast.service';

/**
 * Global RFID Listener Component
 *
 * Add this component to your main layout to enable RFID scanning from anywhere.
 * When a card is scanned:
 * - If card is assigned to a GRN, navigates to that GRN
 * - If card is assigned to a DO Processing, navigates to that DO Processing
 * - If card is not assigned, shows a notification
 */
@Component({
  selector: 'app-rfid-listener',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="rfid-container">
      <!-- Manual scan dialog -->
      @if (showScanDialog) {
      <div class="scan-dialog">
        <div class="scan-dialog-header">
          <i class="pi pi-wifi"></i>
          <span>Scan RFID Card</span>
          <button class="close-btn" (click)="closeScanDialog()">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="scan-dialog-body">
          <input
            type="text"
            [(ngModel)]="manualCardNumber"
            placeholder="Scan or enter card number..."
            (keydown.enter)="submitManualScan()"
            #scanInput
            autofocus
          />
          <button class="scan-btn" (click)="submitManualScan()" [disabled]="!manualCardNumber">
            <i class="pi pi-search"></i>
            Find Record
          </button>
        </div>
      </div>
      }

      <!-- RFID indicator button -->
      <button
        class="rfid-indicator"
        [class.scanning]="isScanning"
        (click)="toggleScanDialog()"
        title="Click to scan RFID card manually"
      >
        <i class="pi pi-wifi"></i>
        <span>RFID</span>
      </button>
    </div>
  `,
  styles: [
    `
      .rfid-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
      }

      .rfid-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        background: #1e293b;
        color: #94a3b8;
        border-radius: 30px;
        font-size: 12px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        border: none;
        cursor: pointer;
        transition: all 0.3s ease;

        i {
          font-size: 14px;
        }

        &:hover {
          background: #334155;
          color: #fff;
        }

        &.scanning {
          background: #22c55e;
          color: #fff;
          animation: pulse 0.5s ease;
        }
      }

      .scan-dialog {
        position: absolute;
        bottom: 50px;
        right: 0;
        width: 320px;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
        overflow: hidden;
      }

      .scan-dialog-header {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 14px 16px;
        background: #1e293b;
        color: #fff;
        font-weight: 600;
        font-size: 14px;

        i {
          color: #3b82f6;
        }

        .close-btn {
          margin-left: auto;
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;

          &:hover {
            color: #fff;
          }
        }
      }

      .scan-dialog-body {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;

        input {
          width: 100%;
          padding: 12px 14px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          font-family: monospace;
          letter-spacing: 1px;
          transition: border-color 0.2s;

          &:focus {
            outline: none;
            border-color: #3b82f6;
          }
        }

        .scan-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          background: #3b82f6;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;

          &:hover:not(:disabled) {
            background: #2563eb;
          }
          &:disabled {
            background: #94a3b8;
            cursor: not-allowed;
          }
        }
      }

      @keyframes pulse {
        0%,
        100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.1);
        }
      }
    `,
  ],
})
export class RFIDListenerComponent implements OnInit, OnDestroy {
  isListening = false;
  isScanning = false;
  showScanDialog = false;
  manualCardNumber = '';
  private scanSub?: Subscription;

  constructor(
    private rfidScanner: RFIDScannerService,
    private rfidService: RFIDService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.rfidScanner.startListening();
    this.isListening = true;

    this.scanSub = this.rfidScanner.onScan().subscribe((cardNumber) => {
      this.handleScan(cardNumber);
    });
  }

  ngOnDestroy(): void {
    this.rfidScanner.stopListening();
    this.scanSub?.unsubscribe();
  }

  toggleScanDialog(): void {
    this.showScanDialog = !this.showScanDialog;
    if (this.showScanDialog) {
      this.manualCardNumber = '';
    }
  }

  closeScanDialog(): void {
    this.showScanDialog = false;
    this.manualCardNumber = '';
  }

  submitManualScan(): void {
    if (!this.manualCardNumber.trim()) return;
    this.handleScan(this.manualCardNumber.trim());
    this.closeScanDialog();
  }

  private handleScan(cardNumber: string): void {
    this.isScanning = true;

    this.rfidService.scan({ cardNumber }).subscribe({
      next: (res) => {
        setTimeout(() => (this.isScanning = false), 500);

        if (res.success && res.data) {
          const { card, grn, doProcessing } = res.data;

          if (grn) {
            this.toastService.showSuccess('RFID Scan', `Opening GRN ${grn.grnNumber}`);
            // Navigate to GRN at current step
            this.router.navigate(['/grn', grn.id, 'step', grn.currentStep]);
          } else if (doProcessing) {
            this.toastService.showSuccess(
              'RFID Scan',
              `Opening DO Processing ${doProcessing.doNumber}`
            );
            // Navigate to DO Processing detail
            this.router.navigate(['/delivery-orders/processing', doProcessing.id]);
          } else {
            this.toastService.showInfo(
              'RFID Scan',
              `Card ${card.label || card.cardNumber} is not assigned to any GRN or DO`
            );
          }
        }
      },
      error: (err) => {
        this.isScanning = false;
        const message = err.error?.message || 'Card not found';
        this.toastService.showError('RFID Scan', message);
      },
    });
  }
}
