import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { InputNumber } from 'primeng/inputnumber';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Tag } from 'primeng/tag';
import { Textarea } from 'primeng/textarea';
import { ProgressBar } from 'primeng/progressbar';
import { InputTextModule } from 'primeng/inputtext';
import { StepsModule } from 'primeng/steps';
import { Select } from 'primeng/select';
import { MenuItem } from 'primeng/api';
import { DoProcessingService } from '../do-processing.service';
import {
  DoProcessing,
  DoProcessingItem,
  DoProcessingStatus,
  DoProcessingStep,
  DoItemLoadingStatus,
  GateEntryRequest,
  InitialWeighingRequest,
  ItemTareWeightRequest,
  ItemGrossWeightRequest,
  FinalWeighingRequest,
} from '../do-processing.model';
import { ToastService } from '../../../../../core/services/toast.service';
import { AuthService } from '../../../../../core/services/auth.service';
import {
  DeviceBridgeService,
  WeightUpdate,
} from '../../../../../core/services/device-bridge.service';
import { TransporterService } from '../../../transporters/transporter.service';
import { Transporter } from '../../../transporters/transporter.model';
import { RFIDService } from '../../../rfid/rfid.service';
import { RFIDCard } from '../../../rfid/rfid-card.model';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-do-processing-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputNumber,
    Button,
    Card,
    Tag,
    Textarea,
    ProgressBar,
    InputTextModule,
    StepsModule,
    Select,
  ],
  templateUrl: './do-processing-detail.component.html',
  styleUrls: ['./do-processing-detail.component.scss'],
})
export class DoProcessingDetailComponent implements OnInit, OnDestroy {
  processing: DoProcessing | null = null;
  loading = false;
  submitting = false;
  private destroy$ = new Subject<void>();

  // Step navigation
  steps: MenuItem[] = [
    { label: 'Gate Entry', icon: 'pi pi-sign-in' },
    { label: 'Initial Weighing', icon: 'pi pi-chart-line' },
    { label: 'Item Loading', icon: 'pi pi-box' },
    { label: 'Final Weighing', icon: 'pi pi-chart-bar' },
    { label: 'Completed', icon: 'pi pi-check' },
  ];
  activeIndex = 0;

  // Form data for inline forms
  gateEntryData: GateEntryRequest = {
    vehicleNo: '',
    driverName: '',
    driverPhone: '',
    driverLicense: '',
    rfidCardNumber: '',
    transporterId: undefined,
    remarks: '',
  };

  initialWeighingData: InitialWeighingRequest = {
    initialTareWeight: 0,
    weighbridgeId: undefined,
  };

  itemTareData: ItemTareWeightRequest = {
    itemId: 0,
    tareWeightWb2: 0,
    weighbridgeId: undefined,
  };

  itemGrossData: ItemGrossWeightRequest = {
    itemId: 0,
    grossWeightWb2: 0,
    weighbridgeId: undefined,
    itemRemarks: '',
  };

  finalWeighingData: FinalWeighingRequest = {
    finalGrossWeight: 0,
    weighbridgeId: undefined,
    remarks: '',
  };

  selectedItem: DoProcessingItem | null = null;
  skipRemarks = '';
  cancelRemarks = '';

  // Transporters
  transporters: Transporter[] = [];

  // RFID Cards
  availableRfidCards: RFIDCard[] = [];
  assignedRfidCard: RFIDCard | null = null;
  selectedRfidCardNumber = '';
  assigningRfidCard = false;
  rfidScanInput = '';
  selectedRfidCardLabel = '';

  // Permission check for RFID assignment
  get canAssignRfid(): boolean {
    return this.authService.hasPermission('RFID:Assign');
  }

  // Live weight from weighbridge
  liveWeight: number | null = null;
  isWeightStable = false;
  isDeviceBridgeConnected = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doProcessingService: DoProcessingService,
    private toastService: ToastService,
    private authService: AuthService,
    private deviceBridgeService: DeviceBridgeService,
    private transporterService: TransporterService,
    private rfidService: RFIDService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProcessing(parseInt(id, 10));
    }

    // Load transporters
    this.loadTransporters();

    // Load available RFID cards
    this.loadAvailableRfidCards();

    // Subscribe to live weight updates
    this.deviceBridgeService.weightUpdates$
      .pipe(takeUntil(this.destroy$))
      .subscribe((update: WeightUpdate) => {
        console.log('Live weight update received:', update);
        this.liveWeight = update.weight;
        this.isWeightStable = update.isStable;

        // Automatically update weight fields with live weight by default
        this.updateWeightFieldsWithLiveWeight();
      });

    // Subscribe to connection status
    this.deviceBridgeService.connectionStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe((connected: boolean) => {
        console.log('Device bridge connection status:', connected);
        this.isDeviceBridgeConnected = connected;
      });

    // Connect to device bridge
    this.deviceBridgeService.connect();
    console.log('Device bridge connection initiated');
  }

  ngOnDestroy(): void {
    console.log('DO Processing Detail component destroying, cleaning up subscriptions');
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProcessing(id: number): void {
    this.loading = true;
    this.doProcessingService.getById(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.processing = res.data;
          this.updateActiveStep();
          this.prefillFormData();
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastService.showError('Error', 'Failed to load processing record');
        this.router.navigate(['/delivery-orders/processing']);
      },
    });
  }

  loadTransporters(): void {
    this.transporterService.getActive().subscribe({
      next: (res) => {
        if (res.success) {
          // Normalize IDs to strings for consistent comparison
          this.transporters = (res.data || []).map((t) => ({
            ...t,
            id: String(t.id),
          }));
        }
      },
      error: () => {
        console.error('Failed to load transporters');
      },
    });
  }

  loadAvailableRfidCards(): void {
    this.rfidService.getAvailable().subscribe({
      next: (res) => {
        if (res.success) {
          this.availableRfidCards = res.data || [];
        }
      },
      error: () => {
        console.error('Failed to load available RFID cards');
      },
    });
  }

  // Debounce timer for RFID scan input
  private rfidScanDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private lastMatchedCardNumber = '';

  /**
   * Handle RFID scan input - auto-select if exact match found
   */
  onRfidScanEnter(event: Event): void {
    event.preventDefault();
    // Clear any pending debounce
    if (this.rfidScanDebounceTimer) {
      clearTimeout(this.rfidScanDebounceTimer);
      this.rfidScanDebounceTimer = null;
    }
    this.matchRfidCard(this.rfidScanInput, true);
  }

  onRfidInputChange(): void {
    // Clear previous debounce timer
    if (this.rfidScanDebounceTimer) {
      clearTimeout(this.rfidScanDebounceTimer);
    }

    // Debounce: wait 300ms after last input before matching
    // This handles RFID scanners that send characters rapidly
    this.rfidScanDebounceTimer = setTimeout(() => {
      if (this.rfidScanInput && this.rfidScanInput.length >= 5) {
        this.matchRfidCard(this.rfidScanInput, true);
      }
    }, 300);
  }

  private matchRfidCard(value: string, showNotification = false): void {
    const trimmedValue = value?.trim();
    if (!trimmedValue) return;

    // Prevent duplicate notifications for the same card
    if (trimmedValue.toLowerCase() === this.lastMatchedCardNumber.toLowerCase()) {
      return;
    }

    // Check if the scanned value matches any card number exactly
    const matchedCard = this.availableRfidCards.find(
      (card) => card.cardNumber.toLowerCase() === trimmedValue.toLowerCase()
    );

    if (matchedCard) {
      // Auto-select the matched card
      this.gateEntryData.rfidCardNumber = matchedCard.cardNumber;
      this.selectedRfidCardLabel = matchedCard.label || matchedCard.cardNumber;
      this.lastMatchedCardNumber = trimmedValue;
      if (showNotification) {
        this.toastService.showSuccess('RFID Card Found', `Selected: ${this.selectedRfidCardLabel}`);
      }
    } else if (showNotification) {
      // Card not found in available list - might be already assigned or invalid
      // Only show warning if it looks like a complete card number (not partial input)
      if (trimmedValue.length >= 8) {
        this.toastService.showWarning(
          'Card Not Found',
          'This card is not available for assignment'
        );
      }
    }
  }

  onRfidDropdownChange(cardNumber: string | null): void {
    if (cardNumber) {
      const card = this.availableRfidCards.find((c) => c.cardNumber === cardNumber);
      this.selectedRfidCardLabel = card?.label || card?.cardNumber || '';
      this.rfidScanInput = cardNumber;
    } else {
      this.selectedRfidCardLabel = '';
      this.rfidScanInput = '';
    }
  }

  clearRfidSelection(): void {
    this.rfidScanInput = '';
    this.gateEntryData.rfidCardNumber = '';
    this.selectedRfidCardLabel = '';
    this.lastMatchedCardNumber = '';
  }

  assignRfidCard(): void {
    if (!this.processing?.id || !this.selectedRfidCardNumber) {
      this.toastService.showError('Error', 'Please select an RFID card');
      return;
    }

    this.assigningRfidCard = true;
    this.rfidService
      .assign({ cardNumber: this.selectedRfidCardNumber, doProcessingId: this.processing.id })
      .subscribe({
        next: (res) => {
          this.assigningRfidCard = false;
          if (res.success && res.data) {
            this.toastService.showSuccess('Success', 'RFID card assigned to DO Processing');
            // Store the assigned card
            this.assignedRfidCard = res.data.card;
            // Reload processing to get updated rfidCardId
            this.loadProcessing(this.processing!.id);
            // Reload available cards
            this.loadAvailableRfidCards();
            this.selectedRfidCardNumber = '';
          }
        },
        error: (err) => {
          this.assigningRfidCard = false;
          this.toastService.showError('Error', err.error?.message || 'Failed to assign RFID card');
        },
      });
  }

  unassignRfidCard(): void {
    const cardNumber = this.assignedRfidCard?.cardNumber || this.processing?.rfidTag;
    if (!cardNumber) {
      return;
    }

    this.assigningRfidCard = true;
    this.rfidService.unassign(cardNumber).subscribe({
      next: (res) => {
        this.assigningRfidCard = false;
        if (res.success) {
          this.toastService.showSuccess('Success', 'RFID card unassigned');
          this.assignedRfidCard = null;
          // Reload processing
          this.loadProcessing(this.processing!.id);
          // Reload available cards
          this.loadAvailableRfidCards();
        }
      },
      error: (err) => {
        this.assigningRfidCard = false;
        this.toastService.showError('Error', err.error?.message || 'Failed to unassign RFID card');
      },
    });
  }

  private updateActiveStep(): void {
    if (!this.processing) return;

    switch (this.processing.currentStep) {
      case DoProcessingStep.GateEntry:
        this.activeIndex = 0;
        break;
      case DoProcessingStep.InitialWeighing:
        this.activeIndex = 1;
        break;
      case DoProcessingStep.ItemLoading:
        this.activeIndex = 2;
        break;
      case DoProcessingStep.FinalWeighing:
        this.activeIndex = 3;
        break;
      case DoProcessingStep.Completed:
        this.activeIndex = 4;
        break;
    }
  }

  requestLiveWeight(): void {
    // Request weight reading from weighbridge
    this.deviceBridgeService.requestWeightReading(1); // Request from weighbridge 1
    console.log('Requested live weight from weighbridge 1');
  }

  private updateWeightFieldsWithLiveWeight(): void {
    if (!this.liveWeight || !this.processing) return;

    console.log(
      'Updating weight fields with live weight:',
      this.liveWeight,
      'Current step:',
      this.processing.currentStep
    );

    // Update initial weighing weight if on that step - always update for real-time display
    if (this.processing.currentStep === DoProcessingStep.InitialWeighing) {
      this.initialWeighingData.initialTareWeight = this.liveWeight;
      console.log('Updated initial tare weight:', this.liveWeight);
    }

    // Update final weighing weight if on that step
    if (this.processing.currentStep === DoProcessingStep.FinalWeighing) {
      this.finalWeighingData.finalGrossWeight = this.liveWeight;
      console.log('Updated final gross weight:', this.liveWeight);
    }

    // Update item weights if in item loading step
    if (this.processing.currentStep === DoProcessingStep.ItemLoading) {
      console.log('In item loading step, live weight:', this.liveWeight);
      // The live weight will be used in the weight recording interface
      // No need to automatically update form fields here as they are calculated dynamically
    }
  }

  private prefillFormData(): void {
    if (!this.processing) return;

    this.gateEntryData = {
      vehicleNo: this.processing.vehicleNo || '',
      driverName: this.processing.driverName || '',
      driverPhone: this.processing.driverPhone || '',
      driverLicense: this.processing.driverLicense || '',
      rfidCardNumber: '',
      // Normalize transporterId to string for consistent comparison with dropdown options
      transporterId: this.processing.transporterId
        ? String(this.processing.transporterId)
        : undefined,
      remarks: this.processing.remarks || '',
    };

    // Always use live weight by default
    this.initialWeighingData = {
      initialTareWeight: this.liveWeight || 0,
      weighbridgeId: 1, // Default to weighbridge-1
    };

    this.finalWeighingData = {
      finalGrossWeight: this.liveWeight || 0,
      weighbridgeId: 1, // Default to weighbridge-1
      remarks: '',
    };
  }

  // Status helpers
  get isInProgress(): boolean {
    return this.processing?.status === DoProcessingStatus.InProgress;
  }

  get isCompleted(): boolean {
    return this.processing?.status === DoProcessingStatus.Completed;
  }

  get isCancelled(): boolean {
    return this.processing?.status === DoProcessingStatus.Cancelled;
  }

  get canProceedToNextStep(): boolean {
    if (!this.processing || !this.isInProgress) return false;

    switch (this.processing.currentStep) {
      case DoProcessingStep.GateEntry:
        return !!this.processing.gateEntryTime;
      case DoProcessingStep.InitialWeighing:
        return !!this.processing.initialWeighingTime;
      case DoProcessingStep.ItemLoading:
        return this.loadedItemsCount > 0 || this.skippedItemsCount === this.totalItemsCount;
      case DoProcessingStep.FinalWeighing:
        return !!this.processing.finalWeighingTime;
      default:
        return false;
    }
  }

  get pendingItems(): DoProcessingItem[] {
    return (
      this.processing?.items?.filter((i) => i.loadingStatus === DoItemLoadingStatus.Pending) || []
    );
  }

  get atWeighbridgeItems(): DoProcessingItem[] {
    return (
      this.processing?.items?.filter(
        (i) => i.loadingStatus === DoItemLoadingStatus.AtWeighbridge
      ) || []
    );
  }

  get loadedItems(): DoProcessingItem[] {
    return (
      this.processing?.items?.filter((i) => i.loadingStatus === DoItemLoadingStatus.Loaded) || []
    );
  }

  get skippedItems(): DoProcessingItem[] {
    return (
      this.processing?.items?.filter((i) => i.loadingStatus === DoItemLoadingStatus.Skipped) || []
    );
  }

  get loadedItemsCount(): number {
    return this.loadedItems.length;
  }

  get skippedItemsCount(): number {
    return this.skippedItems.length;
  }

  get totalItemsCount(): number {
    return this.processing?.items?.length || 0;
  }

  get progressPercentage(): number {
    if (!this.totalItemsCount) return 0;
    return Math.round(
      ((this.loadedItemsCount + this.skippedItemsCount) / this.totalItemsCount) * 100
    );
  }

  // Step 1: Gate Entry
  submitGateEntry(): void {
    if (!this.processing) return;

    this.submitting = true;

    // Prepare gate entry data without rfidCardNumber (will be handled separately)
    const gateEntryPayload = {
      vehicleNo: this.gateEntryData.vehicleNo,
      driverName: this.gateEntryData.driverName,
      driverPhone: this.gateEntryData.driverPhone,
      driverLicense: this.gateEntryData.driverLicense,
      transporterId: this.gateEntryData.transporterId,
      remarks: this.gateEntryData.remarks,
    };

    this.doProcessingService.recordGateEntry(this.processing.id, gateEntryPayload).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.processing = res.data;
          this.updateActiveStep();

          // Auto-assign RFID card if provided
          if (this.gateEntryData.rfidCardNumber?.trim()) {
            this.autoAssignRfidCard(this.gateEntryData.rfidCardNumber.trim());
          } else {
            this.submitting = false;
            this.toastService.showSuccess('Success', 'Gate entry recorded successfully');
          }
        } else {
          this.submitting = false;
        }
      },
      error: (err) => {
        this.submitting = false;
        this.toastService.showError('Error', err.error?.message || 'Failed to record gate entry');
      },
    });
  }

  private autoAssignRfidCard(cardNumber: string): void {
    if (!this.processing) {
      this.submitting = false;
      return;
    }

    this.rfidService.assign({ cardNumber, doProcessingId: this.processing.id }).subscribe({
      next: (res) => {
        this.submitting = false;
        if (res.success && res.data) {
          this.assignedRfidCard = res.data.card;
          this.toastService.showSuccess('Success', 'Gate entry recorded and RFID card assigned');
          // Reload processing to get updated rfidCardId
          this.loadProcessing(this.processing!.id);
        } else {
          this.toastService.showSuccess(
            'Success',
            'Gate entry recorded (RFID card assignment failed)'
          );
        }
      },
      error: (err) => {
        this.submitting = false;
        this.toastService.showWarning(
          'Warning',
          `Gate entry recorded but RFID card assignment failed: ${
            err.error?.message || 'Unknown error'
          }`
        );
      },
    });
  }

  // Step 2: Initial Weighing
  useLiveWeightForInitial(): void {
    if (this.liveWeight) {
      this.initialWeighingData.initialTareWeight = this.liveWeight;
    }
  }

  submitInitialWeighing(): void {
    if (!this.processing) return;

    this.submitting = true;
    this.doProcessingService
      .recordInitialWeighing(this.processing.id, this.initialWeighingData)
      .subscribe({
        next: (res) => {
          this.submitting = false;
          if (res.success && res.data) {
            this.processing = res.data;
            this.updateActiveStep();
            this.toastService.showSuccess('Success', 'Initial weighing recorded successfully');
          }
        },
        error: (err) => {
          this.submitting = false;
          this.toastService.showError(
            'Error',
            err.error?.message || 'Failed to record initial weighing'
          );
        },
      });
  }

  // Step 3: Item Loading - Sequential process
  markItemAsLoaded(item: DoProcessingItem): void {
    if (!this.processing) return;

    // Mark item as loaded (ready for weighing)
    this.submitting = true;
    this.doProcessingService.markItemAsLoaded(this.processing.id, item.id).subscribe({
      next: (res) => {
        this.submitting = false;
        if (res.success && res.data) {
          this.processing = res.data;
          this.toastService.showSuccess(
            'Success',
            'Item marked as loaded - please weigh the truck'
          );
        }
      },
      error: (err) => {
        this.submitting = false;
        this.toastService.showError('Error', err.error?.message || 'Failed to mark item as loaded');
      },
    });
  }

  recordCurrentTruckWeight(): void {
    const currentLoadingItem = this.getCurrentLoadingItem();
    if (!this.processing || !currentLoadingItem || !this.liveWeight) {
      console.warn('Cannot record weight: missing processing, currentLoadingItem, or liveWeight');
      return;
    }

    this.submitting = true;

    // The current live weight is the truck weight after loading this item
    const weightAfterLoading = this.liveWeight;

    const request = {
      itemId: currentLoadingItem.id,
      weightAfterLoading: weightAfterLoading,
      weighbridgeId: 2,
      itemRemarks: '',
    };

    console.log('Recording item weight:', request);

    this.doProcessingService.recordItemWeight(this.processing.id, request).subscribe({
      next: (res) => {
        this.submitting = false;
        if (res.success && res.data) {
          console.log('Item weight recorded successfully:', res.data);
          this.processing = res.data;
          this.updateActiveStep();
          this.toastService.showSuccess('Success', 'Item weight recorded successfully');
        }
      },
      error: (err) => {
        this.submitting = false;
        console.error('Failed to record item weight:', err);
        this.toastService.showError('Error', err.error?.message || 'Failed to record item weight');
      },
    });
  }

  getCurrentTruckWeight(): number {
    if (!this.processing) return 0;

    // Start with initial tare weight - ensure it's a number
    const initialTareWeight = Number(this.processing.initialTareWeight) || 0;

    // Add weight of all loaded items - ensure each is a number
    const loadedItems =
      this.processing.items?.filter((i) => i.loadingStatus === DoItemLoadingStatus.Loaded) || [];
    const totalLoadedWeight = loadedItems.reduce(
      (sum, item) => sum + (Number(item.loadedWeight) || 0),
      0
    );

    return initialTareWeight + totalLoadedWeight;
  }

  getNextItemToLoad(): DoProcessingItem | null {
    if (!this.processing?.items) return null;

    return (
      this.processing.items.find((item) => item.loadingStatus === DoItemLoadingStatus.Pending) ||
      null
    );
  }

  getCurrentLoadingItem(): DoProcessingItem | null {
    if (!this.processing?.items) return null;

    return (
      this.processing.items.find((item) => item.loadingStatus === DoItemLoadingStatus.Loading) ||
      null
    );
  }

  // Step 8: Final Weighing
  useLiveWeightForFinal(): void {
    if (this.liveWeight) {
      this.finalWeighingData.finalGrossWeight = this.liveWeight;
    }
  }

  submitFinalWeighing(): void {
    if (!this.processing) return;

    this.submitting = true;
    this.doProcessingService
      .recordFinalWeighing(this.processing.id, this.finalWeighingData)
      .subscribe({
        next: (res) => {
          this.submitting = false;
          if (res.success && res.data) {
            this.processing = res.data;
            this.updateActiveStep();
            this.toastService.showSuccess(
              'Success',
              'Final weighing recorded successfully - Process completed!'
            );
          }
        },
        error: (err) => {
          this.submitting = false;
          this.toastService.showError(
            'Error',
            err.error?.message || 'Failed to record final weighing'
          );
        },
      });
  }

  // Cancel Processing
  cancelProcessing(): void {
    if (!this.processing) return;

    this.submitting = true;
    this.doProcessingService.cancelProcessing(this.processing.id, this.cancelRemarks).subscribe({
      next: (res) => {
        this.submitting = false;
        if (res.success && res.data) {
          this.processing = res.data;
          this.toastService.showSuccess('Success', 'Processing cancelled');
        }
      },
      error: (err) => {
        this.submitting = false;
        this.toastService.showError('Error', err.error?.message || 'Failed to cancel processing');
      },
    });
  }

  // Helpers
  getStatusSeverity(
    status: DoProcessingStatus
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case DoProcessingStatus.Completed:
        return 'success';
      case DoProcessingStatus.InProgress:
        return 'info';
      case DoProcessingStatus.Cancelled:
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getItemStatusSeverity(
    status: DoItemLoadingStatus
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case DoItemLoadingStatus.Loaded:
        return 'success';
      case DoItemLoadingStatus.AtWeighbridge:
      case DoItemLoadingStatus.Loading:
        return 'info';
      case DoItemLoadingStatus.Skipped:
        return 'warn';
      default:
        return 'secondary';
    }
  }

  getItemStatusLabel(status: DoItemLoadingStatus): string {
    switch (status) {
      case DoItemLoadingStatus.Loaded:
        return 'Loaded';
      case DoItemLoadingStatus.AtWeighbridge:
        return 'At Weighbridge';
      case DoItemLoadingStatus.Loading:
        return 'Loading';
      case DoItemLoadingStatus.Skipped:
        return 'Skipped';
      default:
        return 'Pending';
    }
  }

  goBack(): void {
    this.router.navigate(['/delivery-orders/processing']);
  }

  // Download PDF
  downloadPDF(): void {
    if (!this.processing) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Delivery Order Processing Report', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // DO Number and Status
    doc.setFontSize(14);
    doc.text(`DO Number: ${this.processing.doNumber}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Status: ${this.processing.status.toUpperCase()}`, pageWidth / 2, yPos, {
      align: 'center',
    });
    yPos += 15;

    // Delivery Order Details Section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Delivery Order Details', 14, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const doDetails = [
      ['DO Number', this.processing.doNumber || '-'],
      ['Vendor', this.processing.vendorName || '-'],
      [
        'DO Date',
        this.processing.doDate ? new Date(this.processing.doDate).toLocaleDateString() : '-',
      ],
      ['Vehicle No', this.processing.vehicleNo || '-'],
      ['Driver Name', this.processing.driverName || '-'],
      ['Driver Phone', this.processing.driverPhone || '-'],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: doDetails,
      theme: 'plain',
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 },
        1: { cellWidth: 60 },
      },
      margin: { left: 14 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Weight Summary Section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Weight Summary', 14, yPos);
    yPos += 8;

    const weightSummary = [
      ['Initial Tare Weight (WB-1)', `${this.formatWeight(this.processing.initialTareWeight)} kg`],
      ['Total Loaded Weight', `${this.formatWeight(this.processing.totalLoadedWeight)} kg`],
      ['Final Gross Weight (WB-1)', `${this.formatWeight(this.processing.finalGrossWeight)} kg`],
      ['Net Weight', `${this.formatWeight(this.processing.netWeight)} kg`],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: weightSummary,
      theme: 'striped',
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60 },
        1: { cellWidth: 50, halign: 'right' },
      },
      margin: { left: 14 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Timeline Section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Processing Timeline', 14, yPos);
    yPos += 8;

    const timeline = [
      ['Gate Entry', this.formatDateTime(this.processing.gateEntryTime)],
      ['Initial Weighing', this.formatDateTime(this.processing.initialWeighingTime)],
      ['Final Weighing', this.formatDateTime(this.processing.finalWeighingTime)],
      ['Completed', this.formatDateTime(this.processing.completedTime)],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: timeline,
      theme: 'plain',
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 60 },
      },
      margin: { left: 14 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Items Weight Summary Section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Items Weight Summary', 14, yPos);
    yPos += 8;

    const itemsHeader = [
      ['Material', 'Tare Weight (kg)', 'Gross Weight (kg)', 'Net Weight (kg)', 'Status'],
    ];
    const itemsBody =
      this.processing.items?.map((item) => [
        `${item.materialName || 'Unknown'}\n${item.materialCode || ''}`,
        item.tareWeightWb2 ? this.formatWeight(item.tareWeightWb2) : '-',
        item.grossWeightWb2 ? this.formatWeight(item.grossWeightWb2) : '-',
        item.loadedWeight ? this.formatWeight(item.loadedWeight) : '-',
        this.getItemStatusLabel(item.loadingStatus),
      ]) || [];

    // Add totals row
    itemsBody.push([
      'TOTAL',
      this.formatWeight(this.processing.initialTareWeight),
      this.formatWeight(this.processing.finalGrossWeight),
      this.formatWeight(this.processing.totalLoadedWeight),
      '',
    ]);

    autoTable(doc, {
      startY: yPos,
      head: itemsHeader,
      body: itemsBody,
      theme: 'striped',
      headStyles: { fillColor: [66, 139, 202], textColor: 255 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 35, halign: 'right' },
        2: { cellWidth: 35, halign: 'right' },
        3: { cellWidth: 35, halign: 'right' },
        4: { cellWidth: 25, halign: 'center' },
      },
      margin: { left: 14 },
      didParseCell: (data) => {
        // Bold the totals row
        if (data.row.index === itemsBody.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [240, 240, 240];
        }
      },
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Generated on: ${new Date().toLocaleString()} | Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    // Save the PDF
    const fileName = `DO_Processing_${this.processing.doNumber}_${
      new Date().toISOString().split('T')[0]
    }.pdf`;
    doc.save(fileName);

    this.toastService.showSuccess('Success', 'PDF downloaded successfully');
  }

  private formatWeight(weight: number | null | undefined): string {
    if (weight === null || weight === undefined) return '0.00';
    return Number(weight).toFixed(2);
  }

  private formatDateTime(date: Date | string | null | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleString();
  }
}
