import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { Tag } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { DatePicker } from 'primeng/datepicker';
import { Select } from 'primeng/select';
import { DeliveryOrderService, DeliveryOrderQueryParams } from '../delivery-order.service';
import { DoProcessingService } from '../do-processing/do-processing.service';
import { DeliveryOrder } from '../delivery-order.model';
import { DoProcessing, DoProcessingStatus } from '../do-processing/do-processing.model';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { Subject, debounceTime, distinctUntilChanged, forkJoin } from 'rxjs';

@Component({
  selector: 'app-do-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    Button,
    Tooltip,
    Tag,
    InputTextModule,
    DatePicker,
    Select,
  ],
  templateUrl: './do-list.component.html',
  styleUrls: ['./do-list.component.scss'],
})
export class DoListComponent implements OnInit {
  deliveryOrders: DeliveryOrder[] = [];
  processingRecords: DoProcessing[] = [];
  processingRecordsMap: Map<string, DoProcessing> = new Map();
  loading = false;

  // Pagination
  totalRecords = 0;
  rows = 10;
  first = 0;
  rowsPerPageOptions = [10, 25, 50, 100];

  // Filters
  searchTerm = '';
  dateRange: Date[] | null = null;
  selectedStatus: string | null = null;

  // Search debounce
  private searchSubject = new Subject<string>();

  // Status options for filter
  statusOptions = [
    { label: 'All Statuses', value: null },
    { label: 'Not Started', value: 'not_started' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  // Current query params
  private currentParams: DeliveryOrderQueryParams = {
    page: 1,
    limit: 10,
    sortField: 'doDate',
    sortOrder: 'desc',
  };

  constructor(
    private doService: DeliveryOrderService,
    private doProcessingService: DoProcessingService,
    private toastService: ToastService,
    private confirmService: ConfirmService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Load processing records first, then load delivery orders
    this.loadProcessingRecords();

    // Setup search debounce
    this.searchSubject.pipe(debounceTime(400), distinctUntilChanged()).subscribe((searchTerm) => {
      this.currentParams.search = searchTerm || undefined;
      this.currentParams.page = 1;
      this.first = 0;
      this.loadDeliveryOrders();
    });
  }

  get totalAmount(): number {
    return this.deliveryOrders.reduce((sum, d) => {
      const amount =
        typeof d.totalAmount === 'string' ? parseFloat(d.totalAmount) : d.totalAmount || 0;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
  }

  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  onDateRangeChange(): void {
    if (this.dateRange && this.dateRange.length === 2 && this.dateRange[0] && this.dateRange[1]) {
      this.currentParams.startDate = this.formatDate(this.dateRange[0]);
      this.currentParams.endDate = this.formatDate(this.dateRange[1]);
    } else {
      this.currentParams.startDate = undefined;
      this.currentParams.endDate = undefined;
    }
    this.currentParams.page = 1;
    this.first = 0;
    this.loadDeliveryOrders();
  }

  onStatusChange(): void {
    // Status filter is applied client-side after fetching data
    // because processing status comes from our internal do_processing table
    this.currentParams.page = 1;
    this.first = 0;
    this.loadDeliveryOrders();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.dateRange = null;
    this.selectedStatus = null;
    this.currentParams = {
      page: 1,
      limit: this.rows,
      sortField: 'doDate',
      sortOrder: 'desc',
    };
    this.first = 0;
    this.loadDeliveryOrders();
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  loadDeliveryOrders(): void {
    this.loading = true;

    // If status filter is applied, we need to fetch more records and filter client-side
    // because processing status is in our internal DB, not the external DO source
    const params = { ...this.currentParams };

    if (this.selectedStatus) {
      // Fetch more records when filtering by status (we'll filter client-side)
      params.limit = 500; // Fetch more to filter
      params.page = 1;
    }

    this.doService.getAllFromDataSourcePaginated(params).subscribe({
      next: (res) => {
        if (res.success) {
          let orders = res.data || [];
          let total = res.pagination?.total || 0;

          // Apply status filter client-side
          if (this.selectedStatus) {
            orders = orders.filter((order) => {
              const status = this.getProcessingStatus(order);
              return status === this.selectedStatus;
            });
            total = orders.length;

            // Apply client-side pagination for status-filtered results
            const page = this.currentParams.page || 1;
            const limit = this.currentParams.limit || 10;
            const start = (page - 1) * limit;
            orders = orders.slice(start, start + limit);
          }

          this.deliveryOrders = orders;
          this.totalRecords = total;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastService.showError('Error', 'Failed to load delivery orders');
      },
    });
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    this.first = event.first || 0;
    this.rows = event.rows || 10;

    // Calculate page number (1-based)
    this.currentParams.page = Math.floor(this.first / this.rows) + 1;
    this.currentParams.limit = this.rows;

    // Handle sorting
    if (event.sortField) {
      this.currentParams.sortField = event.sortField as string;
      this.currentParams.sortOrder = event.sortOrder === 1 ? 'asc' : 'desc';
    }

    this.loadDeliveryOrders();
  }

  loadProcessingRecords(): void {
    this.doProcessingService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.processingRecords = res.data;
          // Build a map for quick lookup
          this.processingRecordsMap.clear();
          for (const p of this.processingRecords) {
            if (p.doNumber) {
              this.processingRecordsMap.set(p.doNumber, p);
            }
            if (p.externalDoId) {
              this.processingRecordsMap.set(p.externalDoId, p);
            }
          }
          // Now load delivery orders
          this.loadDeliveryOrders();
        }
      },
      error: () => {
        // Still load delivery orders even if processing records fail
        this.loadDeliveryOrders();
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
    this.createProcessingRecord(dOrder);
  }

  createProcessingRecord(dOrder: DeliveryOrder): void {
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

    this.doProcessingService.startProcessing(request).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.toastService.showSuccess('Success', 'Processing started successfully');
          this.router.navigate(['/delivery-orders/processing', res.data.id]);
          this.loadProcessingRecords();
        }
      },
      error: (err) => {
        const msg = err.error?.message || 'Failed to start processing';
        this.toastService.showError('Error', msg);
      },
    });
  }

  continueProcessing(dOrder: DeliveryOrder): void {
    const processing = this.getProcessingRecord(dOrder);
    if (processing) {
      this.router.navigate(['/delivery-orders/processing', processing.id]);
    }
  }

  viewProcessing(dOrder: DeliveryOrder): void {
    const processing = this.getProcessingRecord(dOrder);
    if (processing) {
      this.router.navigate(['/delivery-orders/processing', processing.id]);
    }
  }

  getProcessingRecord(dOrder: DeliveryOrder): DoProcessing | undefined {
    // Use the map for faster lookup
    return (
      this.processingRecordsMap.get(dOrder.doNumber) ||
      this.processingRecordsMap.get(dOrder.id?.toString() || '')
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
        this.startProcessing(dOrder);
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
