import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { DeliveryOrderService } from '../../delivery-order.service';
import { DoProcessingService } from '../do-processing.service';
import { DeliveryOrder } from '../../delivery-order.model';
import { StartDoProcessingRequest } from '../do-processing.model';
import { ToastService } from '../../../../../core/services/toast.service';

@Component({
  selector: 'app-do-processing-start',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, InputTextModule, Button, Card],
  templateUrl: './do-processing-start.component.html',
  styleUrls: ['./do-processing-start.component.scss'],
})
export class DoProcessingStartComponent implements OnInit {
  deliveryOrders: DeliveryOrder[] = [];
  filteredDOs: DeliveryOrder[] = [];
  selectedDO: DeliveryOrder | null = null;
  loading = false;
  submitting = false;
  searchTerm = '';
  form!: FormGroup;
  preSelectedDoId: string | null = null;
  showDoSelection = true; // Controls whether to show DO selection or go directly to form

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private doService: DeliveryOrderService,
    private doProcessingService: DoProcessingService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();

    // Check if a DO ID is provided in query params
    this.route.queryParams.subscribe((params) => {
      this.preSelectedDoId = params['doId'];
      if (this.preSelectedDoId) {
        this.showDoSelection = false; // Skip DO selection screen
        this.loadSpecificDO(this.preSelectedDoId);
      } else {
        this.showDoSelection = true; // Show DO selection screen
        this.loadDeliveryOrders();
      }
    });
  }

  private initForm(): void {
    this.form = this.fb.group({
      vehicleNo: ['', Validators.required],
      driverName: [''],
      driverPhone: [''],
      remarks: [''],
    });
  }

  loadDeliveryOrders(): void {
    this.loading = true;
    this.doService.getAllFromDataSource().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.deliveryOrders = res.data;
          this.filteredDOs = [...this.deliveryOrders];
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastService.showError('Error', 'Failed to load delivery orders');
      },
    });
  }

  loadSpecificDO(doIdentifier: string): void {
    this.loading = true;
    this.doService.getAllFromDataSource().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          // Try to find by ID first, then by DO number
          let selectedDO = res.data.find((d) => d.id?.toString() === doIdentifier);
          if (!selectedDO) {
            selectedDO = res.data.find((d) => d.doNumber === doIdentifier);
          }

          if (selectedDO) {
            this.selectedDO = selectedDO;
            console.log('Selected DO for processing:', selectedDO);
            // Pre-fill vehicle number if available
            if (selectedDO.vehicleNo) {
              this.form.patchValue({ vehicleNo: selectedDO.vehicleNo });
            }
          } else {
            this.toastService.showError('Error', 'Delivery order not found');
            this.router.navigate(['/delivery-orders']);
          }
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastService.showError('Error', 'Failed to load delivery order');
        this.router.navigate(['/delivery-orders']);
      },
    });
  }

  onSearch(): void {
    if (!this.searchTerm) {
      this.filteredDOs = [...this.deliveryOrders];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredDOs = this.deliveryOrders.filter(
      (d) =>
        d.doNumber?.toLowerCase().includes(term) ||
        d.vendor?.companyName?.toLowerCase().includes(term) ||
        d.vendorName?.toLowerCase().includes(term)
    );
  }

  selectDO(dOrder: DeliveryOrder): void {
    this.selectedDO = dOrder;
    // Pre-fill vehicle number if available
    if (dOrder.vehicleNo) {
      this.form.patchValue({ vehicleNo: dOrder.vehicleNo });
    }
  }

  clearSelection(): void {
    this.selectedDO = null;
    this.form.reset();
  }

  startProcessing(): void {
    if (!this.selectedDO || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const formValue = this.form.value;

    const request: StartDoProcessingRequest = {
      externalDoId: this.selectedDO.id?.toString(),
      doNumber: this.selectedDO.doNumber,
      doDate: this.selectedDO.doDate,
      vendorId: this.selectedDO.vendorId?.toString(),
      vendorName: this.selectedDO.vendor?.companyName || this.selectedDO.vendorName,
      vehicleNo: formValue.vehicleNo,
      driverName: formValue.driverName,
      driverPhone: formValue.driverPhone,
      remarks: formValue.remarks,
      items: this.selectedDO.items.map((item) => ({
        externalItemId: item.id?.toString(),
        materialId: item.materialId?.toString(),
        materialName: item.material?.name || item.materialName,
        materialCode: item.material?.code,
        orderedQuantity: parseFloat(item.quantity?.toString() || '0'),
        orderedRate: parseFloat(item.rate?.toString() || '0'),
      })),
    };

    this.doProcessingService.startProcessing(request).subscribe({
      next: (res) => {
        this.submitting = false;
        if (res.success && res.data) {
          this.toastService.showSuccess('Success', 'Processing started successfully');
          this.router.navigate(['/delivery-orders/processing', res.data.id]);
        }
      },
      error: (err) => {
        this.submitting = false;
        const msg = err.error?.message || 'Failed to start processing';
        this.toastService.showError('Error', msg);
      },
    });
  }

  cancel(): void {
    if (this.preSelectedDoId) {
      // If came from a specific DO, go back to delivery orders list
      this.router.navigate(['/delivery-orders']);
    } else {
      // If came from processing list, go back to processing list
      this.router.navigate(['/delivery-orders/processing']);
    }
  }

  backToSelection(): void {
    this.showDoSelection = true;
    this.selectedDO = null;
    this.preSelectedDoId = null;
    this.form.reset();
    this.loadDeliveryOrders();
    // Update URL to remove query params
    this.router.navigate(['/delivery-orders/processing/start']);
  }
}
