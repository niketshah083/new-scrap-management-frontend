import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Select } from 'primeng/select';
import { Tooltip } from 'primeng/tooltip';
import { Dialog } from 'primeng/dialog';
import { Textarea } from 'primeng/textarea';
import { PurchaseOrderService } from '../purchase-order.service';
import { PurchaseOrder } from '../purchase-order.model';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ModuleCode } from '../../../../core/enums/modules.enum';
import { OperationCode } from '../../../../core/enums/operations.enum';

@Component({
  selector: 'app-po-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, Button, Tag, Select, Tooltip, Dialog, Textarea],
  templateUrl: './po-list.component.html',
  styleUrls: ['./po-list.component.scss'],
})
export class PoListComponent implements OnInit {
  purchaseOrders: PurchaseOrder[] = [];
  filteredPOs: PurchaseOrder[] = [];
  loading = false;
  searchTerm = '';
  selectedStatus: string | null = null;

  // Rejection dialog
  showRejectDialog = false;
  rejectionReason = '';
  selectedPOForRejection: PurchaseOrder | null = null;

  statusOptions = [
    { label: 'Draft', value: 'draft' },
    { label: 'Pending Approval', value: 'pending_approval' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Partial', value: 'partial' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  constructor(
    private poService: PurchaseOrderService,
    private toastService: ToastService,
    private confirmService: ConfirmService,
    private authService: AuthService,
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

  get pendingApprovalCount(): number {
    return this.purchaseOrders.filter((p) => p.status === 'pending_approval').length;
  }

  get approvedCount(): number {
    return this.purchaseOrders.filter((p) => p.status === 'approved').length;
  }

  get totalAmount(): number {
    return this.purchaseOrders.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  }

  get canApprove(): boolean {
    return this.authService.hasPermission(`${ModuleCode.PurchaseOrder}:${OperationCode.Approve}`);
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

  submitForApproval(po: PurchaseOrder): void {
    this.confirmService
      .confirm(`Submit PO "${po.poNumber}" for approval?`, 'Submit for Approval')
      .then((confirmed) => {
        if (confirmed) {
          this.poService.submitForApproval(po.id).subscribe({
            next: (res) => {
              if (res.success) {
                this.toastService.showSuccess('Success', 'Purchase order submitted for approval');
                this.loadPurchaseOrders();
              }
            },
            error: () =>
              this.toastService.showError('Error', 'Failed to submit purchase order for approval'),
          });
        }
      });
  }

  approvePO(po: PurchaseOrder): void {
    this.confirmService
      .confirm(`Approve PO "${po.poNumber}"?`, 'Approve Purchase Order')
      .then((confirmed) => {
        if (confirmed) {
          this.poService.approve(po.id).subscribe({
            next: (res) => {
              if (res.success) {
                this.toastService.showSuccess('Success', 'Purchase order approved');
                this.loadPurchaseOrders();
              }
            },
            error: () => this.toastService.showError('Error', 'Failed to approve purchase order'),
          });
        }
      });
  }

  openRejectDialog(po: PurchaseOrder): void {
    this.selectedPOForRejection = po;
    this.rejectionReason = '';
    this.showRejectDialog = true;
  }

  confirmReject(): void {
    if (!this.selectedPOForRejection || !this.rejectionReason.trim()) {
      this.toastService.showError('Error', 'Please provide a rejection reason');
      return;
    }

    this.poService.reject(this.selectedPOForRejection.id, this.rejectionReason).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.showSuccess('Success', 'Purchase order rejected');
          this.showRejectDialog = false;
          this.selectedPOForRejection = null;
          this.rejectionReason = '';
          this.loadPurchaseOrders();
        }
      },
      error: () => this.toastService.showError('Error', 'Failed to reject purchase order'),
    });
  }

  cancelReject(): void {
    this.showRejectDialog = false;
    this.selectedPOForRejection = null;
    this.rejectionReason = '';
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'success';
      case 'pending_approval':
        return 'info';
      case 'partial':
        return 'warn';
      case 'cancelled':
      case 'rejected':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'pending_approval':
        return 'Pending Approval';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  }
}
