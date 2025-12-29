import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Select } from 'primeng/select';
import { Tooltip } from 'primeng/tooltip';
import { PurchaseOrderService } from '../purchase-order.service';
import { PurchaseOrder } from '../purchase-order.model';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmService } from '../../../../core/services/confirm.service';

@Component({
  selector: 'app-po-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, Button, Tag, Select, Tooltip],
  templateUrl: './po-list.component.html',
  styleUrls: ['./po-list.component.scss'],
})
export class PoListComponent implements OnInit {
  purchaseOrders: PurchaseOrder[] = [];
  filteredPOs: PurchaseOrder[] = [];
  loading = false;
  searchTerm = '';
  selectedStatus: string | null = null;

  statusOptions = [
    { label: 'Draft', value: 'draft' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Partial', value: 'partial' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  constructor(
    private poService: PurchaseOrderService,
    private toastService: ToastService,
    private confirmService: ConfirmService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPurchaseOrders();
  }

  get totalCount(): number {
    return this.purchaseOrders.length;
  }

  get draftCount(): number {
    return this.purchaseOrders.filter((p) => p.status === 'draft').length;
  }

  get confirmedCount(): number {
    return this.purchaseOrders.filter((p) => p.status === 'confirmed').length;
  }

  get totalAmount(): number {
    return this.purchaseOrders.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilter(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.purchaseOrders];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.poNumber?.toLowerCase().includes(term) ||
          p.vendor?.companyName?.toLowerCase().includes(term)
      );
    }

    if (this.selectedStatus) {
      result = result.filter((p) => p.status === this.selectedStatus);
    }

    this.filteredPOs = result;
  }

  loadPurchaseOrders(): void {
    this.loading = true;
    this.poService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.purchaseOrders = res.data;
          this.filteredPOs = [...this.purchaseOrders];
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastService.showError('Error', 'Failed to load purchase orders');
      },
    });
  }

  createNew(): void {
    this.router.navigate(['/purchase-orders/new']);
  }

  editPO(po: PurchaseOrder): void {
    this.router.navigate(['/purchase-orders', po.id, 'edit']);
  }

  confirmDelete(po: PurchaseOrder): void {
    this.confirmService.confirmDelete(`PO "${po.poNumber}"`).then((confirmed) => {
      if (confirmed) {
        this.poService.delete(po.id).subscribe({
          next: (res) => {
            if (res.success) {
              this.toastService.showSuccess('Success', 'Purchase order deleted');
              this.loadPurchaseOrders();
            }
          },
          error: () => this.toastService.showError('Error', 'Failed to delete purchase order'),
        });
      }
    });
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'completed':
        return 'success';
      case 'confirmed':
        return 'info';
      case 'partial':
        return 'warn';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  }
}
