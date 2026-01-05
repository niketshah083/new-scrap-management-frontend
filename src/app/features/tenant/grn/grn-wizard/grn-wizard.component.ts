import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { Button } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Textarea } from 'primeng/textarea';
import { DatePicker } from 'primeng/datepicker';
import { Dialog } from 'primeng/dialog';
import * as QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { GrnService } from '../grn.service';
import { PurchaseOrderService } from '../../purchase-orders/purchase-order.service';
import { VendorService } from '../../vendors/vendor.service';
import { GatePassService } from '../../gate-pass/gate-pass.service';
import { RFIDService } from '../../rfid/rfid.service';
import { Vendor } from '../../vendors/vendor.model';
import { GRN, GRNFieldConfig } from '../grn.model';
import { GatePass } from '../../gate-pass/gate-pass.model';
import { RFIDCard } from '../../rfid/rfid-card.model';
import { ToastService } from '../../../../core/services/toast.service';
import { SelectComponent } from '../../../../shared/components/select/select.component';
import { FileUploadComponent } from '../../../../shared/components/file-upload/file-upload.component';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-grn-wizard',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    TitleCasePipe,
    ReactiveFormsModule,
    FormsModule,
    Button,
    InputTextModule,
    InputNumber,
    Textarea,
    DatePicker,
    Dialog,
    SelectComponent,
    FileUploadComponent,
  ],
  templateUrl: './grn-wizard.component.html',
  styleUrls: ['./grn-wizard.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class GrnWizardComponent implements OnInit, OnDestroy {
  @ViewChild('qrCanvas') qrCanvas!: ElementRef<HTMLCanvasElement>;

  grn: GRN | null = null;
  grnId: number | null = null;
  currentStep = 1;
  loading = false;
  purchaseOrders: any[] = [];
  vendors: Vendor[] = [];
  fieldConfigs: GRNFieldConfig[] = [];
  form!: FormGroup;
  dynamicForm!: FormGroup;
  gatePass: GatePass | null = null;
  qrCodeDataUrl: string = '';
  private routeSub?: Subscription;

  // Image preview
  showImagePreview = false;
  previewImageUrl = '';
  previewImageTitle = '';
  apiUrl = environment.apiUrl;

  // RFID Card assignment
  availableRfidCards: RFIDCard[] = [];
  selectedRfidCardNumber: string | null = null;
  selectedRfidCardLabel: string | null = null;
  rfidScanInput: string = '';
  assigningRfidCard = false;

  steps = [
    { label: 'Gate Entry', step: 1 },
    { label: 'Initial Weighing', step: 2 },
    { label: 'Unloading', step: 3 },
    { label: 'Final Weighing', step: 4 },
    { label: 'Supervisor Review', step: 5 },
    { label: 'Gate Pass', step: 6 },
    { label: 'Inspection Report', step: 7 },
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public router: Router,
    private grnService: GrnService,
    private poService: PurchaseOrderService,
    private vendorService: VendorService,
    private gatePassService: GatePassService,
    private rfidService: RFIDService,
    private toastService: ToastService
  ) {
    this.dynamicForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.initForm();
    this.loadPurchaseOrders();
    this.loadVendors();
    this.loadAvailableRfidCards();

    // Subscribe to route param changes to handle step navigation
    this.routeSub = this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      const stepParam = params.get('step');

      if (idParam) {
        this.grnId = parseInt(idParam, 10);
      }
      if (stepParam) {
        this.currentStep = parseInt(stepParam, 10);
      }

      // Reset field configs before loading new ones
      this.fieldConfigs = [];

      // Reload data when params change
      if (this.grnId) {
        this.loadGRN();
      } else {
        // New GRN - load field configs for step 1
        this.loadFieldConfigs();
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  private initForm(): void {
    this.form = this.fb.group({
      // Static fields for Step 1
      purchaseOrderId: [null],
      vendorId: [null],
      truckNumber: ['', Validators.required],
      // Static fields for Step 5
      verificationStatus: ['verified'],
      approvalStatus: ['approved'],
      rejectionReason: [''],
    });

    // Listen for PO changes to auto-select vendor
    this.form.get('purchaseOrderId')?.valueChanges.subscribe((poId) => {
      this.onPOChange(poId);
    });
  }

  /**
   * Auto-select vendor when PO is selected
   */
  private onPOChange(poId: number | null): void {
    if (!poId) return;

    const selectedPO = this.purchaseOrders.find((po) => po.id === poId);
    if (selectedPO?.vendorId) {
      this.form.patchValue({ vendorId: selectedPO.vendorId });
    }
  }

  private loadPurchaseOrders(): void {
    this.poService.getApproved().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.purchaseOrders = res.data;
        }
      },
    });
  }

  private loadVendors(): void {
    this.vendorService.getActive().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.vendors = res.data;
        }
      },
    });
  }

  private loadAvailableRfidCards(): void {
    this.rfidService.getAvailable().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.availableRfidCards = res.data;
        }
      },
    });
  }

  /**
   * Handle RFID scan input - when Enter is pressed after scanning
   */
  onRfidScanEnter(event: Event): void {
    event.preventDefault();
    const cardNumber = this.rfidScanInput.trim();
    if (!cardNumber) return;

    // Find the card in available cards
    const card = this.availableRfidCards.find((c) => c.cardNumber === cardNumber);
    if (card) {
      this.selectedRfidCardNumber = card.cardNumber;
      this.selectedRfidCardLabel = card.label || card.cardNumber;
      this.toastService.showSuccess(
        'RFID Card Found',
        `Card "${card.label || card.cardNumber}" selected`
      );
    } else {
      this.toastService.showError(
        'Card Not Found',
        `Card "${cardNumber}" is not available or doesn't exist`
      );
      this.rfidScanInput = '';
    }
  }

  /**
   * Handle manual input change - try to match as user types
   */
  onRfidInputChange(): void {
    const cardNumber = this.rfidScanInput.trim();
    if (!cardNumber) {
      this.selectedRfidCardNumber = null;
      this.selectedRfidCardLabel = null;
      return;
    }

    // Auto-select if exact match found
    const card = this.availableRfidCards.find((c) => c.cardNumber === cardNumber);
    if (card) {
      this.selectedRfidCardNumber = card.cardNumber;
      this.selectedRfidCardLabel = card.label || card.cardNumber;
    }
  }

  /**
   * Handle dropdown selection change
   */
  onRfidDropdownChange(cardNumber: string | null): void {
    if (cardNumber) {
      const card = this.availableRfidCards.find((c) => c.cardNumber === cardNumber);
      this.rfidScanInput = cardNumber;
      this.selectedRfidCardLabel = card?.label || cardNumber;
    } else {
      this.rfidScanInput = '';
      this.selectedRfidCardLabel = null;
    }
  }

  /**
   * Clear RFID selection
   */
  clearRfidSelection(): void {
    this.rfidScanInput = '';
    this.selectedRfidCardNumber = null;
    this.selectedRfidCardLabel = null;
  }

  /**
   * Assign RFID card to GRN after creation
   */
  assignRfidCard(): void {
    if (!this.grnId || !this.selectedRfidCardNumber) {
      this.toastService.showError('Error', 'Please select an RFID card');
      return;
    }

    this.assigningRfidCard = true;
    this.rfidService
      .assign({ cardNumber: this.selectedRfidCardNumber, grnId: this.grnId })
      .subscribe({
        next: (res) => {
          this.assigningRfidCard = false;
          if (res.success) {
            this.toastService.showSuccess('Success', 'RFID card assigned to GRN');
            // Reload GRN to get updated rfidCardId
            this.loadGRN();
            // Reload available cards
            this.loadAvailableRfidCards();
          }
        },
        error: (err) => {
          this.assigningRfidCard = false;
          const errorMessage = err.error?.message || 'Failed to assign RFID card';
          this.toastService.showError('Error', errorMessage);
        },
      });
  }

  /**
   * Unassign RFID card from GRN
   */
  unassignRfidCard(): void {
    if (!this.grn?.rfidCard?.cardNumber) {
      return;
    }

    this.assigningRfidCard = true;
    this.rfidService.unassign(this.grn.rfidCard.cardNumber).subscribe({
      next: (res) => {
        this.assigningRfidCard = false;
        if (res.success) {
          this.toastService.showSuccess('Success', 'RFID card unassigned');
          this.loadGRN();
          this.loadAvailableRfidCards();
        }
      },
      error: (err) => {
        this.assigningRfidCard = false;
        const errorMessage = err.error?.message || 'Failed to unassign RFID card';
        this.toastService.showError('Error', errorMessage);
      },
    });
  }

  private loadGRN(): void {
    if (!this.grnId) return;
    this.loading = true;
    this.grnService.getById(this.grnId).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) {
          this.grn = res.data;
          this.patchForm();
          // Load field configs for the current step (from URL, not GRN)
          this.loadFieldConfigs();
          // Load existing gate pass if on step 6
          if (this.currentStep === 6) {
            this.loadExistingGatePass();
          }
        }
      },
      error: () => {
        this.loading = false;
        this.toastService.showError('Error', 'Failed to load GRN');
      },
    });
  }

  private loadExistingGatePass(): void {
    if (!this.grnId) return;
    this.gatePassService.getByGrnId(this.grnId).subscribe({
      next: async (res) => {
        if (res.success && res.data) {
          this.gatePass = res.data;
          // Generate QR code for existing gate pass
          await this.generateQRCode();
        }
      },
      error: (err) => {
        console.error('Error loading gate pass:', err);
      },
    });
  }

  private loadFieldConfigs(): void {
    console.log('Loading field configs for step:', this.currentStep);
    this.grnService.getFieldConfigs(this.currentStep).subscribe({
      next: (res) => {
        console.log('Field configs response:', res);
        if (res.success && res.data) {
          this.fieldConfigs = res.data.sort((a, b) => a.displayOrder - b.displayOrder);
          console.log('Field configs loaded:', this.fieldConfigs.length);
          this.buildDynamicForm();
        }
      },
      error: (err) => {
        console.error('Error loading field configs:', err);
        this.fieldConfigs = [];
      },
    });
  }

  private buildDynamicForm(): void {
    // Reset dynamic form
    this.dynamicForm = this.fb.group({});

    // Add controls for each field config
    for (const field of this.fieldConfigs) {
      const validators = [];
      if (field.isRequired) {
        validators.push(Validators.required);
      }
      if (field.fieldType === 'number') {
        validators.push(Validators.min(0));
      }

      // Get existing value from GRN field values if available
      let defaultValue: any = '';
      if (field.fieldType === 'number') {
        defaultValue = null;
      }

      // Check if we have a saved value for this field
      if (this.grn?.fieldValues) {
        const savedValue = this.grn.fieldValues.find((fv) => fv.fieldConfigId === field.id);
        if (savedValue) {
          // Get value based on field type
          if (field.fieldType === 'number') {
            defaultValue = savedValue.numberValue ?? null;
          } else if (field.fieldType === 'photo' || field.fieldType === 'file') {
            // For file fields, use textValue or fileUrl
            defaultValue = savedValue.textValue || savedValue.fileUrl || '';
          } else if (field.fieldType === 'date') {
            defaultValue = savedValue.dateValue ? new Date(savedValue.dateValue) : null;
          } else {
            // For text, dropdown, etc.
            defaultValue = savedValue.textValue || savedValue.value || '';
          }
        }
      }

      this.dynamicForm.addControl(field.fieldName, this.fb.control(defaultValue, validators));
    }
  }

  private patchForm(): void {
    if (!this.grn) return;
    this.form.patchValue({
      purchaseOrderId: this.grn.purchaseOrderId,
      vendorId: this.grn.vendorId,
      truckNumber: this.grn.truckNumber,
      verificationStatus: this.grn.verificationStatus || 'verified',
      approvalStatus: this.grn.approvalStatus || 'approved',
      rejectionReason: this.grn.rejectionReason || '',
    });
  }

  getDropdownOptions(field: GRNFieldConfig): { label: string; value: string }[] {
    if (!field.options || !Array.isArray(field.options)) return [];
    return field.options.map((opt) => ({ label: opt, value: opt }));
  }

  onSubmitStep(): void {
    // Validate dynamic form for steps with dynamic fields
    if (this.currentStep >= 1 && this.fieldConfigs.length > 0 && this.dynamicForm.invalid) {
      this.toastService.showError('Error', 'Please fill all required fields');
      return;
    }

    this.loading = true;

    // If editing an existing GRN (including Step 1), use updateCurrentStep
    if (this.grnId) {
      this.updateCurrentStep();
      return;
    }

    // Create new GRN (Step 1 - first time only)
    // Collect dynamic field values for Step 1
    const fieldValues: { fieldConfigId: number; value: string }[] = [];
    for (const field of this.fieldConfigs) {
      const value = this.dynamicForm.get(field.fieldName)?.value;
      if (value !== null && value !== undefined && value !== '') {
        fieldValues.push({
          fieldConfigId: field.id,
          value: String(value),
        });
      }
    }

    // Static fields: purchaseOrderId, vendorId, truckNumber, rfidCardNumber
    const data: any = {
      purchaseOrderId: this.form.value.purchaseOrderId,
      vendorId: this.form.value.vendorId,
      truckNumber: this.form.value.truckNumber,
    };

    // Include RFID card number if selected
    if (this.selectedRfidCardNumber) {
      data.rfidCardNumber = this.selectedRfidCardNumber;
    }

    // Include field values if any
    if (fieldValues.length > 0) {
      data.fieldValues = fieldValues;
    }

    this.grnService.create(data).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) {
          this.toastService.showSuccess('Success', 'GRN created');
          this.router.navigate(['/grn', res.data.id, 'step', 2]);
        }
      },
      error: (err) => {
        this.loading = false;
        const errorMessage =
          err.error?.message || err.error?.errors?.join(', ') || 'Failed to create GRN';
        this.toastService.showError('Error', errorMessage);
      },
    });
  }

  private updateCurrentStep(): void {
    if (!this.grnId) return;

    // Collect dynamic field values
    const fieldValues: { fieldConfigId: number; fieldName: string; value: string }[] = [];
    for (const field of this.fieldConfigs) {
      let value = this.dynamicForm.get(field.fieldName)?.value;
      if (value !== null && value !== undefined && value !== '') {
        // Convert array to comma-separated string for storage
        if (Array.isArray(value)) {
          value = value.join(',');
        }
        fieldValues.push({
          fieldConfigId: field.id,
          fieldName: field.fieldName,
          value: String(value),
        });
      }
    }

    console.log(`Updating step ${this.currentStep} for GRN ${this.grnId}`);
    console.log('Field values:', fieldValues);

    let obs;
    switch (this.currentStep) {
      case 1:
        // Step 1: Static fields (purchaseOrderId, vendorId, truckNumber) + dynamic fields
        console.log('Calling updateStep1 API');
        obs = this.grnService.updateStep1(this.grnId, {
          purchaseOrderId: this.form.value.purchaseOrderId || null,
          vendorId: this.form.value.vendorId || null,
          truckNumber: this.form.value.truckNumber,
          fieldValues: fieldValues.length > 0 ? fieldValues : undefined,
        });
        break;
      case 2:
        // Step 2: All fields are dynamic (gross_weight, gross_weight_image)
        console.log('Calling updateStep2 API');
        obs = this.grnService.updateStep2(this.grnId, { fieldValues });
        break;
      case 3:
        // Step 3: All fields are dynamic (driver_photo, driver_licence_image, unloading_photos, unloading_notes, material_count)
        console.log('Calling updateStep3 API');
        obs = this.grnService.updateStep3(this.grnId, { fieldValues });
        break;
      case 4:
        // Step 4: All fields are dynamic (tare_weight, tare_weight_image, net_weight is auto-calculated)
        console.log('Calling updateStep4 API');
        obs = this.grnService.updateStep4(this.grnId, { fieldValues });
        break;
      case 5:
        // Step 5: Static fields (verificationStatus, approvalStatus, rejectionReason)
        console.log('Calling updateStep5 API');
        let verificationStatus = this.form.value.verificationStatus;
        if (verificationStatus) {
          // Convert "Verified" to "verified", "Not Verified" to "not_verified"
          verificationStatus = verificationStatus.toLowerCase().replace(/\s+/g, '_');
        }
        obs = this.grnService.updateStep5(this.grnId, {
          verificationStatus,
          approvalStatus: this.form.value.approvalStatus,
          rejectionReason: this.form.value.rejectionReason || undefined,
          fieldValues: fieldValues.length > 0 ? fieldValues : undefined,
        });
        break;
      default:
        this.loading = false;
        return;
    }

    obs.subscribe({
      next: (res) => {
        this.loading = false;
        console.log(`Step ${this.currentStep} update response:`, res);
        if (res.success) {
          // Check if we're editing a completed step or advancing
          const isEditingCompletedStep = this.grn && this.currentStep < this.grn.currentStep;

          if (isEditingCompletedStep) {
            // Editing a completed step - stay on this step and show save message
            this.toastService.showSuccess('Success', 'Changes saved');
            // Reload GRN to get updated data
            this.loadGRN();
          } else {
            // Advancing to next step
            this.toastService.showSuccess('Success', 'Step completed');
            if (this.currentStep < 7) {
              this.router.navigate(['/grn', this.grnId, 'step', this.currentStep + 1]);
            } else {
              this.router.navigate(['/grn', this.grnId]);
            }
          }
        }
      },
      error: (err) => {
        this.loading = false;
        console.error(`Step ${this.currentStep} update error:`, err);
        const errorMessage =
          err.error?.message || err.error?.errors?.join(', ') || 'Failed to update step';
        this.toastService.showError('Error', errorMessage);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/grn']);
  }

  /**
   * Check if user can navigate to a specific step
   * Can navigate to any step up to and including the GRN's current step
   */
  canNavigateToStep(step: number): boolean {
    if (!this.grnId || !this.grn) return false;
    // Can navigate to any completed step or the current step
    return step <= this.grn.currentStep;
  }

  /**
   * Navigate to a specific step (for editing completed steps)
   */
  navigateToStep(step: number): void {
    if (!this.canNavigateToStep(step)) return;
    if (step === this.currentStep) return; // Already on this step

    this.router.navigate(['/grn', this.grnId, 'step', step]);
  }

  /**
   * Check if we're editing a completed step (not the current active step)
   */
  isEditingCompletedStep(): boolean {
    if (!this.grn) return false;
    return this.currentStep < this.grn.currentStep;
  }

  /**
   * Get the submit button label based on whether we're editing or continuing
   */
  getSubmitButtonLabel(): string {
    return this.isEditingCompletedStep() ? 'Save Changes' : 'Continue';
  }

  onFileSelect(event: Event, fieldName: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      // For now, just store the file name - in production, you'd upload to server
      this.dynamicForm.get(fieldName)?.setValue(file.name);
      this.toastService.showSuccess('File Selected', file.name);
    }
  }

  onFileUploaded(file: File, fieldName: string): void {
    // For now, just store the file name - in production, you'd upload to server
    this.dynamicForm.get(fieldName)?.setValue(file.name);
    this.toastService.showSuccess('File Selected', file.name);
  }

  onFilesUploaded(files: File[], fieldName: string): void {
    // For multiple files, the file-upload component already manages the list
    // Just show a toast notification
    if (files.length > 0) {
      this.toastService.showSuccess('Files Selected', `${files.length} file(s) added`);
    }
  }

  generateGatePass(): void {
    if (!this.grnId) return;
    this.loading = true;
    this.gatePassService.create({ grnId: this.grnId }).subscribe({
      next: async (res) => {
        this.loading = false;
        if (res.success && res.data) {
          this.gatePass = res.data;
          this.toastService.showSuccess('Success', `Gate Pass ${res.data.passNumber} generated`);
          // Generate QR code after gate pass is created
          await this.generateQRCode();
        }
      },
      error: (err) => {
        this.loading = false;
        const errorMessage = err.error?.message || 'Failed to generate gate pass';
        this.toastService.showError('Error', errorMessage);
      },
    });
  }

  async generateQRCode(): Promise<void> {
    if (!this.gatePass) return;

    // Create QR code data with gate pass info
    const qrData = JSON.stringify({
      passNumber: this.gatePass.passNumber,
      grnNumber: this.grn?.grnNumber,
      vendor: this.grn?.vendor?.companyName,
      truckNumber: this.grn?.truckNumber,
      expiresAt: this.gatePass.expiresAt,
      status: this.gatePass.status,
    });

    try {
      this.qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  }

  async downloadGatePassPDF(): Promise<void> {
    if (!this.gatePass || !this.grn) {
      this.toastService.showError('Error', 'Gate pass data not available');
      return;
    }

    // Generate QR code if not already generated
    if (!this.qrCodeDataUrl) {
      await this.generateQRCode();
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(16, 185, 129); // Green color
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('GATE PASS', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(this.gatePass.passNumber, pageWidth / 2, 32, { align: 'center' });

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // QR Code
    if (this.qrCodeDataUrl) {
      doc.addImage(this.qrCodeDataUrl, 'PNG', pageWidth / 2 - 30, 50, 60, 60);
    }

    // Gate Pass Details
    let yPos = 125;
    const leftMargin = 20;
    const labelWidth = 60;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Gate Pass Details', leftMargin, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    const addRow = (label: string, value: string) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label + ':', leftMargin, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(value || '-', leftMargin + labelWidth, yPos);
      yPos += 8;
    };

    addRow('Pass Number', this.gatePass.passNumber);
    addRow('Status', this.gatePass.status.toUpperCase());
    addRow('Expires At', new Date(this.gatePass.expiresAt).toLocaleString());

    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('GRN Details', leftMargin, yPos);
    yPos += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    addRow('GRN Number', this.grn.grnNumber || '-');
    addRow('Vendor', this.grn.vendor?.companyName || '-');
    addRow('Truck Number', this.grn.truckNumber || '-');
    addRow('Gross Weight', `${this.getGrnFieldValue('gross_weight') || 0} kg`);
    addRow('Tare Weight', `${this.getGrnFieldValue('tare_weight') || 0} kg`);
    addRow('Net Weight', `${this.grn.netWeight || this.calculateNetWeight()} kg`);

    // Footer
    yPos += 15;
    doc.setDrawColor(200, 200, 200);
    doc.line(leftMargin, yPos, pageWidth - leftMargin, yPos);
    yPos += 10;

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(
      'This gate pass is valid only until the expiry time mentioned above.',
      pageWidth / 2,
      yPos,
      { align: 'center' }
    );
    yPos += 5;
    doc.text('Please present this pass at the gate for vehicle exit.', pageWidth / 2, yPos, {
      align: 'center',
    });
    yPos += 10;
    doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, yPos, {
      align: 'center',
    });

    // Save the PDF
    doc.save(`GatePass-${this.gatePass.passNumber}.pdf`);
    this.toastService.showSuccess('Success', 'Gate Pass PDF downloaded');
  }

  // Helper methods for Step 5 Summary
  getFieldValuesByStep(stepNumber: number): any[] {
    if (!this.grn?.fieldValues) return [];
    return this.grn.fieldValues.filter(
      (fv) => fv.fieldConfig && fv.fieldConfig.stepNumber === stepNumber
    );
  }

  isImageField(fieldValue: any): boolean {
    if (!fieldValue.fieldConfig) return false;
    const fieldType = fieldValue.fieldConfig.fieldType;
    return fieldType === 'photo' || fieldType === 'file';
  }

  getFieldValue(fieldValue: any): string {
    if (!fieldValue) return '';
    // Check all possible value columns from backend entity
    return fieldValue.textValue || fieldValue.fileUrl || fieldValue.value || '';
  }

  getImageUrls(fieldValue: any): { key: string; url: string }[] {
    // First check if backend provided fileUrls array
    if (fieldValue.fileUrls && Array.isArray(fieldValue.fileUrls)) {
      return fieldValue.fileUrls;
    }

    // Fallback: parse from textValue (for backward compatibility)
    const value = this.getFieldValue(fieldValue);
    if (!value) return [];

    // Handle comma-separated values for multiple files
    return value
      .split(',')
      .map((v: string) => v.trim())
      .filter((v: string) => v)
      .map((key: string) => ({
        key,
        url: `${this.apiUrl.replace('/api', '')}/uploads/${key}`,
      }));
  }

  formatFieldValue(fieldValue: any): string {
    if (!fieldValue) return '-';

    // Get value from the correct column based on field type
    const fieldType = fieldValue.fieldConfig?.fieldType;

    // For date fields
    if (fieldType === 'date' || fieldValue.dateValue) {
      const dateVal = fieldValue.dateValue;
      if (!dateVal) return '-';
      try {
        const date = new Date(dateVal);
        return date.toLocaleDateString();
      } catch {
        return String(dateVal);
      }
    }

    // For number fields
    if (fieldType === 'number' || fieldValue.numberValue !== null) {
      const numVal = fieldValue.numberValue;
      if (numVal === null || numVal === undefined) return '-';
      return String(numVal);
    }

    // For text, dropdown, and other fields - use textValue
    const textVal = fieldValue.textValue || fieldValue.value;
    if (!textVal) return '-';
    return String(textVal);
  }

  /**
   * Get field value from GRN's dynamic field values by field name
   */
  getGrnFieldValue(fieldName: string): string | number | null {
    if (!this.grn?.fieldValues) return null;
    const fv = this.grn.fieldValues.find((v) => v.fieldConfig?.fieldName === fieldName);
    if (!fv) return null;
    return fv.numberValue ?? fv.textValue ?? fv.fileUrl ?? null;
  }

  calculateNetWeight(): number {
    if (!this.grn) return 0;
    // netWeight is now a static field
    if (this.grn.netWeight) return this.grn.netWeight;
    // Fallback: calculate from dynamic fields
    const gross = Number(this.getGrnFieldValue('gross_weight')) || 0;
    const tare = Number(this.getGrnFieldValue('tare_weight')) || 0;
    return gross - tare;
  }

  // Image preview methods
  openImagePreview(imageUrl: string, fieldLabel: string): void {
    this.previewImageUrl = imageUrl;
    this.previewImageTitle = fieldLabel;
    this.showImagePreview = true;
  }

  closeImagePreview(): void {
    this.showImagePreview = false;
    this.previewImageUrl = '';
    this.previewImageTitle = '';
  }

  onImageError(event: Event): void {
    // Show placeholder when image fails to load
    const img = event.target as HTMLImageElement;
    img.src =
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3QgZmlsbD0iI2YxZjVmOSIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiLz48dGV4dCB4PSI1MCUiIHk9IjQ1JSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY0NzQ4YiIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PHRleHQgeD0iNTAlIiB5PSI1NSUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5NGEzYjgiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIj4oRmlsZSBub3QgdXBsb2FkZWQgdG8gc2VydmVyKTwvdGV4dD48L3N2Zz4=';
  }

  getStepIcon(step: number): string {
    const icons: { [key: number]: string } = {
      1: 'pi pi-sign-in',
      2: 'pi pi-chart-bar',
      3: 'pi pi-box',
      4: 'pi pi-chart-line',
      5: 'pi pi-check-square',
      6: 'pi pi-ticket',
      7: 'pi pi-file-check',
    };
    return icons[step] || 'pi pi-circle';
  }

  getStepDescription(step: number): string {
    const descriptions: { [key: number]: string } = {
      1: 'Record vehicle arrival and vendor details',
      2: 'Record initial gross weight of the loaded vehicle',
      3: 'Document the unloading process',
      4: 'Record tare weight after unloading',
      5: 'Review all data and approve/reject the GRN',
      6: 'Generate exit pass for the vehicle',
      7: 'View quality inspection results',
    };
    return descriptions[step] || '';
  }

  /**
   * Generate and open GRN Review PDF in a new tab
   * Includes all step details with images
   */
  async generateReviewPDF(): Promise<void> {
    if (!this.grn) {
      this.toastService.showError('Error', 'GRN data not available');
      return;
    }

    this.loading = true;
    this.toastService.showInfo('Generating PDF', 'Please wait while we prepare your document...');

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      let yPos = margin;

      // Helper function to add a new page if needed
      const checkPageBreak = (requiredHeight: number): void => {
        if (yPos + requiredHeight > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
        }
      };

      // Helper function to load image as base64 using backend proxy (bypasses CORS)
      const loadImageAsBase64 = async (imageKey: string): Promise<string | null> => {
        return new Promise((resolve) => {
          // Extract the key from the URL if it's a full URL
          let key = imageKey;

          // If it's a full URL, extract just the key part
          if (imageKey.includes('/uploads/')) {
            const parts = imageKey.split('/uploads/');
            key = parts[parts.length - 1];
          }

          // Remove any query parameters (like signed URL params)
          if (key.includes('?')) {
            key = key.split('?')[0];
          }

          this.grnService.getFileAsBase64(key).subscribe({
            next: (res) => {
              if (res.success && res.data?.base64) {
                resolve(res.data.base64);
              } else {
                resolve(null);
              }
            },
            error: (err) => {
              console.warn('Failed to load image via backend:', key, err);
              resolve(null);
            },
          });

          // Timeout after 15 seconds
          setTimeout(() => resolve(null), 15000);
        });
      };

      // ========== HEADER ==========
      doc.setFillColor(16, 185, 129); // Green color
      doc.rect(0, 0, pageWidth, 35, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('GRN REVIEW REPORT', pageWidth / 2, 15, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(this.grn.grnNumber || 'N/A', pageWidth / 2, 25, { align: 'center' });

      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 32, { align: 'center' });

      yPos = 45;
      doc.setTextColor(0, 0, 0);

      // ========== GRN OVERVIEW ==========
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129);
      doc.text('GRN Overview', margin, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);

      const overviewData = [
        ['GRN Number', this.grn.grnNumber || '-'],
        ['Status', (this.grn.status || '-').toUpperCase()],
        ['Vendor', this.grn.vendor?.companyName || '-'],
        ['Truck Number', this.grn.truckNumber || '-'],
        ['Purchase Order', this.grn.purchaseOrder?.poNumber || 'N/A'],
        ['Current Step', `Step ${this.grn.currentStep}`],
        ['Created At', this.grn.createdAt ? new Date(this.grn.createdAt).toLocaleString() : '-'],
      ];

      autoTable(doc, {
        startY: yPos,
        head: [],
        body: overviewData,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 50 },
          1: { cellWidth: pageWidth - margin * 2 - 50 },
        },
        margin: { left: margin, right: margin },
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;

      // ========== STEP 1: GATE ENTRY ==========
      checkPageBreak(40);
      doc.setFillColor(59, 130, 246); // Blue
      doc.rect(margin, yPos, pageWidth - margin * 2, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('STEP 1: GATE ENTRY', margin + 3, yPos + 5.5);
      yPos += 12;
      doc.setTextColor(0, 0, 0);

      const step1Data: string[][] = [
        ['GRN Number', this.grn.grnNumber || '-'],
        ['Vendor', this.grn.vendor?.companyName || '-'],
        ['Truck Number', this.grn.truckNumber || '-'],
        ['Purchase Order', this.grn.purchaseOrder?.poNumber || 'N/A'],
      ];

      // Add dynamic fields for step 1
      const step1Fields = this.getFieldValuesByStep(1);
      for (const fv of step1Fields) {
        if (!this.isImageField(fv)) {
          step1Data.push([fv.fieldConfig?.fieldLabel || 'Field', this.formatFieldValue(fv)]);
        }
      }

      autoTable(doc, {
        startY: yPos,
        head: [],
        body: step1Data,
        theme: 'striped',
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 50 },
        },
        margin: { left: margin, right: margin },
      });

      yPos = (doc as any).lastAutoTable.finalY + 5;

      // Add images for step 1
      for (const fv of step1Fields) {
        if (this.isImageField(fv)) {
          const images = this.getImageUrls(fv);
          if (images.length > 0) {
            checkPageBreak(50);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text(fv.fieldConfig?.fieldLabel || 'Images', margin, yPos);
            yPos += 5;

            let xPos = margin;
            for (const img of images) {
              const base64 = await loadImageAsBase64(img.key);
              if (base64) {
                checkPageBreak(45);
                try {
                  doc.addImage(base64, 'JPEG', xPos, yPos, 40, 35);
                  xPos += 45;
                  if (xPos + 40 > pageWidth - margin) {
                    xPos = margin;
                    yPos += 40;
                  }
                } catch {
                  // Skip if image can't be added
                }
              }
            }
            yPos += 45;
          }
        }
      }

      // ========== STEP 2: INITIAL WEIGHING ==========
      checkPageBreak(40);
      doc.setFillColor(249, 115, 22); // Orange
      doc.rect(margin, yPos, pageWidth - margin * 2, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('STEP 2: INITIAL WEIGHING', margin + 3, yPos + 5.5);
      yPos += 12;
      doc.setTextColor(0, 0, 0);

      const step2Fields = this.getFieldValuesByStep(2);
      const step2Data: string[][] = [];

      for (const fv of step2Fields) {
        if (!this.isImageField(fv)) {
          let value = this.formatFieldValue(fv);
          if (fv.fieldConfig?.fieldName?.includes('weight')) {
            value += ' kg';
          }
          step2Data.push([fv.fieldConfig?.fieldLabel || 'Field', value]);
        }
      }

      if (step2Data.length > 0) {
        autoTable(doc, {
          startY: yPos,
          head: [],
          body: step2Data,
          theme: 'striped',
          styles: { fontSize: 9, cellPadding: 2 },
          columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 50 },
          },
          margin: { left: margin, right: margin },
        });
        yPos = (doc as any).lastAutoTable.finalY + 5;
      }

      // Add images for step 2
      for (const fv of step2Fields) {
        if (this.isImageField(fv)) {
          const images = this.getImageUrls(fv);
          if (images.length > 0) {
            checkPageBreak(50);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text(fv.fieldConfig?.fieldLabel || 'Images', margin, yPos);
            yPos += 5;

            let xPos = margin;
            for (const img of images) {
              const base64 = await loadImageAsBase64(img.key);
              if (base64) {
                checkPageBreak(45);
                try {
                  doc.addImage(base64, 'JPEG', xPos, yPos, 40, 35);
                  xPos += 45;
                  if (xPos + 40 > pageWidth - margin) {
                    xPos = margin;
                    yPos += 40;
                  }
                } catch {
                  // Skip if image can't be added
                }
              }
            }
            yPos += 45;
          }
        }
      }

      // ========== STEP 3: UNLOADING ==========
      checkPageBreak(40);
      doc.setFillColor(139, 92, 246); // Purple
      doc.rect(margin, yPos, pageWidth - margin * 2, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('STEP 3: UNLOADING', margin + 3, yPos + 5.5);
      yPos += 12;
      doc.setTextColor(0, 0, 0);

      const step3Fields = this.getFieldValuesByStep(3);
      const step3Data: string[][] = [];

      for (const fv of step3Fields) {
        if (!this.isImageField(fv)) {
          step3Data.push([fv.fieldConfig?.fieldLabel || 'Field', this.formatFieldValue(fv)]);
        }
      }

      if (step3Data.length > 0) {
        autoTable(doc, {
          startY: yPos,
          head: [],
          body: step3Data,
          theme: 'striped',
          styles: { fontSize: 9, cellPadding: 2 },
          columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 50 },
          },
          margin: { left: margin, right: margin },
        });
        yPos = (doc as any).lastAutoTable.finalY + 5;
      } else {
        doc.setFontSize(9);
        doc.text('No data recorded', margin, yPos);
        yPos += 8;
      }

      // Add images for step 3
      for (const fv of step3Fields) {
        if (this.isImageField(fv)) {
          const images = this.getImageUrls(fv);
          if (images.length > 0) {
            checkPageBreak(50);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text(fv.fieldConfig?.fieldLabel || 'Images', margin, yPos);
            yPos += 5;

            let xPos = margin;
            for (const img of images) {
              const base64 = await loadImageAsBase64(img.key);
              if (base64) {
                checkPageBreak(45);
                try {
                  doc.addImage(base64, 'JPEG', xPos, yPos, 40, 35);
                  xPos += 45;
                  if (xPos + 40 > pageWidth - margin) {
                    xPos = margin;
                    yPos += 40;
                  }
                } catch {
                  // Skip if image can't be added
                }
              }
            }
            yPos += 45;
          }
        }
      }

      // ========== STEP 4: FINAL WEIGHING ==========
      checkPageBreak(40);
      doc.setFillColor(34, 197, 94); // Green
      doc.rect(margin, yPos, pageWidth - margin * 2, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('STEP 4: FINAL WEIGHING', margin + 3, yPos + 5.5);
      yPos += 12;
      doc.setTextColor(0, 0, 0);

      const step4Fields = this.getFieldValuesByStep(4);
      const step4Data: string[][] = [];

      for (const fv of step4Fields) {
        if (!this.isImageField(fv)) {
          let value = this.formatFieldValue(fv);
          if (fv.fieldConfig?.fieldName?.includes('weight')) {
            value += ' kg';
          }
          step4Data.push([fv.fieldConfig?.fieldLabel || 'Field', value]);
        }
      }

      // Add net weight
      if (this.grn.netWeight) {
        step4Data.push(['Net Weight', `${this.grn.netWeight} kg`]);
      }

      if (step4Data.length > 0) {
        autoTable(doc, {
          startY: yPos,
          head: [],
          body: step4Data,
          theme: 'striped',
          styles: { fontSize: 9, cellPadding: 2 },
          columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 50 },
          },
          margin: { left: margin, right: margin },
        });
        yPos = (doc as any).lastAutoTable.finalY + 5;
      } else {
        doc.setFontSize(9);
        doc.text('No data recorded', margin, yPos);
        yPos += 8;
      }

      // Add images for step 4
      for (const fv of step4Fields) {
        if (this.isImageField(fv)) {
          const images = this.getImageUrls(fv);
          if (images.length > 0) {
            checkPageBreak(50);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text(fv.fieldConfig?.fieldLabel || 'Images', margin, yPos);
            yPos += 5;

            let xPos = margin;
            for (const img of images) {
              const base64 = await loadImageAsBase64(img.key);
              if (base64) {
                checkPageBreak(45);
                try {
                  doc.addImage(base64, 'JPEG', xPos, yPos, 40, 35);
                  xPos += 45;
                  if (xPos + 40 > pageWidth - margin) {
                    xPos = margin;
                    yPos += 40;
                  }
                } catch {
                  // Skip if image can't be added
                }
              }
            }
            yPos += 45;
          }
        }
      }

      // ========== WEIGHT SUMMARY ==========
      checkPageBreak(50);
      doc.setFillColor(245, 158, 11); // Amber
      doc.rect(margin, yPos, pageWidth - margin * 2, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('WEIGHT SUMMARY', margin + 3, yPos + 5.5);
      yPos += 12;
      doc.setTextColor(0, 0, 0);

      const grossWeight = Number(this.getGrnFieldValue('gross_weight')) || 0;
      const tareWeight = Number(this.getGrnFieldValue('tare_weight')) || 0;
      const netWeight = this.grn.netWeight || this.calculateNetWeight();

      const weightData = [
        ['Gross Weight', `${grossWeight} kg`],
        ['Tare Weight', `${tareWeight} kg`],
        ['Net Weight', `${netWeight} kg`],
      ];

      autoTable(doc, {
        startY: yPos,
        head: [],
        body: weightData,
        theme: 'grid',
        styles: { fontSize: 11, cellPadding: 4, halign: 'center' },
        columnStyles: {
          0: { fontStyle: 'bold', fillColor: [240, 240, 240] },
          1: { fontStyle: 'bold', textColor: [16, 185, 129] },
        },
        margin: { left: margin, right: margin },
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;

      // ========== FOOTER ==========
      checkPageBreak(30);
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 8;

      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('This document is a comprehensive review of all GRN steps.', pageWidth / 2, yPos, {
        align: 'center',
      });
      yPos += 5;
      doc.text('Please verify all information before approval.', pageWidth / 2, yPos, {
        align: 'center',
      });

      // Add page numbers
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      }

      // Open PDF in new tab
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');

      this.loading = false;
      this.toastService.showSuccess('Success', 'PDF generated and opened in new tab');
    } catch (error) {
      this.loading = false;
      console.error('Error generating PDF:', error);
      this.toastService.showError('Error', 'Failed to generate PDF');
    }
  }
}
