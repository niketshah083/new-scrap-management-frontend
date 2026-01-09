import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { Tag } from 'primeng/tag';
import { DeliveryOrderService } from '../delivery-order.service';
import { DoProcessingService } from '../do-processing/do-processing.service';
import { DeliveryOrder } from '../delivery-order.model';
import { DoProcessing, DoProcessingStatus } from '../do-processing/do-processing.model';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmService } from '../../../../core/services/confirm.service';

@Component({
  selector: 'app-do-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, Button, Tooltip, Tag],
  templateUrl: './do-list.component.html',
  styleUrls: ['./do-list.component.scss'],
})
export class DoListComponent implements OnInit {
  deliveryOrders: DeliveryOrder[] = [];
  filteredDOs: DeliveryOrder[] = [];
  processingRecords: DoProcessing[] = [];
  loading = false;
  searchTerm = '';

  constructor(
    private doService: DeliveryOrderService,
    private doProcessingService: DoProcessingService,
    private toastService: ToastService,
    private confirmService: ConfirmService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDeliveryOrders();
    this.loadProcessingRecords();
  }

  get totalCount(): number {
    return this.deliveryOrders.length;
  }

  get totalAmount(): number {
    return this.deliveryOrders.reduce((sum, d) => {
      const amount =
        typeof d.totalAmount === 'string' ? parseFloat(d.totalAmount) : d.totalAmount || 0;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
  }

  onSearch(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.deliveryOrders];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        (d) =>
          d.doNumber?.toLowerCase().includes(term) ||
          d.vendor?.companyName?.toLowerCase().includes(term) ||
          (d as any).vendorName?.toLowerCase().includes(term) ||
          d.vehicleNo?.toLowerCase().includes(term)
      );
    }

    this.filteredDOs = result;
  }

  loadDeliveryOrders(): void {
    this.loading = true;
    // Use data source endpoint which fetches from external DB if enabled
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

  loadProcessingRecords(): void {
    this.doProcessingService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.processingRecords = res.data;
        }
      },
      error: () => {
        // Silently fail - processing records are optional for display
      },
    });
  }

  createNew(): void {
    this.router.navigate(['/delivery-orders/new']);
  }

  goToProcessing(): void {
    this.router.navigate(['/delivery-orders/processing']);
  }

  editDO(dOrder: DeliveryOrder): void {
    this.router.navigate(['/delivery-orders', dOrder.id, 'edit']);
  }

  startProcessing(dOrder: DeliveryOrder): void {
    // Debug: Check what ID we're getting
    console.log('Starting processing for DO:', dOrder);
    console.log('DO ID:', dOrder.id);
    console.log('DO Number:', dOrder.doNumber);

    // Create processing record directly and navigate to detail screen
    this.createProcessingRecord(dOrder);
  }

  createProcessingRecord(dOrder: DeliveryOrder): void {
    console.log('Creating processing record for DO:', dOrder);
    console.log('DO ID:', dOrder.id);
    console.log('DO Number:', dOrder.doNumber);

    const request = {
      externalDoId: dOrder.id?.toString(),
      doNumber: dOrder.doNumber,
      doDate: dOrder.doDate,
      vendorId: dOrder.vendorId?.toString(),
      vendorName: dOrder.vendor?.companyName || dOrder.vendorName,
      vehicleNo: dOrder.vehicleNo || '',
      driverName: '',
      driverPhone: '',
      remarks: '',
      items: dOrder.items.map((item) => ({
        externalItemId: item.id?.toString(),
        materialId: item.materialId?.toString(),
        materialName: item.material?.name || item.materialName,
        materialCode: item.material?.code,
        orderedQuantity: parseFloat(item.quantity?.toString() || '0'),
        orderedRate: parseFloat(item.rate?.toString() || '0'),
      })),
    };

    console.log('Processing request:', request);

    this.doProcessingService.startProcessing(request).subscribe({
      next: (res) => {
        console.log('Processing started successfully:', res);
        if (res.success && res.data) {
          this.toastService.showSuccess('Success', 'Processing started successfully');
          // Navigate directly to the processing detail screen (Step 1: Gate Entry)
          console.log('Navigating to processing detail:', res.data.id);
          this.router.navigate(['/delivery-orders/processing', res.data.id]);
          // Refresh the processing records to update the status
          this.loadProcessingRecords();
        }
      },
      error: (err) => {
        console.error('Error starting processing:', err);
        const msg = err.error?.message || 'Failed to start processing';
        this.toastService.showError('Error', msg);
      },
    });
  }

  continueProcessing(dOrder: DeliveryOrder): void {
    const processing = this.getProcessingRecord(dOrder);
    if (processing) {
      // Navigate to the processing detail page to continue
      this.router.navigate(['/delivery-orders/processing', processing.id]);
    }
  }

  viewProcessing(dOrder: DeliveryOrder): void {
    const processing = this.getProcessingRecord(dOrder);
    if (processing) {
      // Navigate to the processing detail page to view
      this.router.navigate(['/delivery-orders/processing', processing.id]);
    }
  }

  // Helper methods to check processing status
  getProcessingRecord(dOrder: DeliveryOrder): DoProcessing | undefined {
    return this.processingRecords.find(
      (p) => p.doNumber === dOrder.doNumber || p.externalDoId === dOrder.id?.toString()
    );
  }

  getProcessingStatus(
    dOrder: DeliveryOrder
  ): 'not_started' | 'in_progress' | 'completed' | 'cancelled' {
    const processing = this.getProcessingRecord(dOrder);
    if (!processing) return 'not_started';

    switch (processing.status) {
      case DoProcessingStatus.InProgress:
        return 'in_progress';
      case DoProcessingStatus.Completed:
        return 'completed';
      case DoProcessingStatus.Cancelled:
        return 'cancelled';
      default:
        return 'not_started';
    }
  }

  getProcessingButtonLabel(dOrder: DeliveryOrder): string {
    const status = this.getProcessingStatus(dOrder);
    switch (status) {
      case 'in_progress':
        return 'Continue Processing';
      case 'completed':
        return 'View Processing';
      case 'cancelled':
        return 'Restart Processing';
      default:
        return 'Start Processing';
    }
  }

  getProcessingButtonIcon(dOrder: DeliveryOrder): string {
    const status = this.getProcessingStatus(dOrder);
    switch (status) {
      case 'in_progress':
        return 'pi pi-arrow-right';
      case 'completed':
        return 'pi pi-eye';
      case 'cancelled':
        return 'pi pi-refresh';
      default:
        return 'pi pi-play';
    }
  }

  getProcessingButtonSeverity(dOrder: DeliveryOrder): 'success' | 'info' | 'warn' | 'secondary' {
    const status = this.getProcessingStatus(dOrder);
    switch (status) {
      case 'in_progress':
        return 'info';
      case 'completed':
        return 'secondary';
      case 'cancelled':
        return 'warn';
      default:
        return 'success';
    }
  }

  handleProcessingAction(dOrder: DeliveryOrder): void {
    const status = this.getProcessingStatus(dOrder);
    switch (status) {
      case 'in_progress':
        this.continueProcessing(dOrder);
        break;
      case 'completed':
        this.viewProcessing(dOrder);
        break;
      case 'cancelled':
        this.startProcessing(dOrder); // Restart processing
        break;
      default:
        this.startProcessing(dOrder);
        break;
    }
  }

  getProcessingStatusLabel(dOrder: DeliveryOrder): string {
    const status = this.getProcessingStatus(dOrder);
    switch (status) {
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Not Started';
    }
  }

  getProcessingStatusSeverity(
    dOrder: DeliveryOrder
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const status = this.getProcessingStatus(dOrder);
    switch (status) {
      case 'in_progress':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  confirmDelete(dOrder: DeliveryOrder): void {
    this.confirmService.confirmDelete(`DO "${dOrder.doNumber}"`).then((confirmed) => {
      if (confirmed) {
        this.doService.delete(dOrder.id).subscribe({
          next: (res) => {
            if (res.success) {
              this.toastService.showSuccess('Success', 'Delivery order deleted');
              this.loadDeliveryOrders();
            }
          },
          error: () => this.toastService.showError('Error', 'Failed to delete delivery order'),
        });
      }
    });
  }
}
