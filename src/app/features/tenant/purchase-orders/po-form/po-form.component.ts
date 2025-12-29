import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { DatePicker } from 'primeng/datepicker';
import { Textarea } from 'primeng/textarea';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { PurchaseOrderService } from '../purchase-order.service';
import { VendorService } from '../../vendors/vendor.service';
import { MaterialService } from '../../materials/material.service';
import { ToastService } from '../../../../core/services/toast.service';
import { SelectComponent } from '../../../../shared/components/select/select.component';

@Component({
  selector: 'app-po-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputNumber,
    DatePicker,
    Textarea,
    Button,
    Card,
    SelectComponent,
  ],
  templateUrl: './po-form.component.html',
  styleUrls: ['./po-form.component.scss'],
})
export class PoFormComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  poId: number | null = null;
  loading = false;
  vendors: any[] = [];
  materials: any[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private poService: PurchaseOrderService,
    private vendorService: VendorService,
    private materialService: MaterialService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.poId = parseInt(idParam, 10);
      this.isEdit = true;
    }

    this.initForm();

    // Load vendors and materials first, then load PO if editing
    this.loading = true;
    forkJoin({
      vendors: this.vendorService.getAll(),
      materials: this.materialService.getAll(),
    }).subscribe({
      next: (results) => {
        if (results.vendors.success && results.vendors.data) {
          this.vendors = results.vendors.data.filter((v) => v.isActive);
        }
        if (results.materials.success && results.materials.data) {
          this.materials = results.materials.data.filter((m) => m.isActive);
        }

        // Now load PO data if editing
        if (this.isEdit && this.poId) {
          this.loadPO();
        } else {
          this.loading = false;
        }
      },
      error: () => {
        this.loading = false;
        this.toastService.showError('Error', 'Failed to load data');
      },
    });
  }

  private initForm(): void {
    this.form = this.fb.group({
      poNumber: ['', Validators.required],
      vendorId: [null, Validators.required],
      expectedDeliveryDate: [null, Validators.required],
      notes: [''],
      items: this.fb.array([]),
    });
    // Only add default item for new PO, not when editing
    if (!this.isEdit) {
      this.addItem();
    }
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  addItem(): void {
    this.items.push(
      this.fb.group({
        materialId: [null, Validators.required],
        quantity: [1, [Validators.required, Validators.min(1)]],
        unitPrice: [0, [Validators.required, Validators.min(0)]],
      })
    );
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  private loadPO(): void {
    if (!this.poId) return;
    this.poService.getById(this.poId).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) {
          const po = res.data;
          this.form.patchValue({
            poNumber: po.poNumber,
            vendorId: po.vendorId,
            expectedDeliveryDate: po.expectedDeliveryDate
              ? new Date(po.expectedDeliveryDate)
              : null,
            notes: po.notes,
          });
          this.items.clear();
          po.items.forEach((item) => {
            // Use material.id from nested object if materialId doesn't match any material
            let materialId = item.materialId;
            if (item.material && item.material.id) {
              // Check if materialId exists in materials list
              const materialExists = this.materials.some((m) => m.id === materialId);
              if (!materialExists) {
                // Use the nested material's id instead
                materialId = item.material.id;
              }
            }

            this.items.push(
              this.fb.group({
                id: [item.id],
                materialId: [materialId, Validators.required],
                quantity: [
                  typeof item.quantity === 'string'
                    ? parseFloat(item.quantity)
                    : item.quantity || 1,
                  [Validators.required, Validators.min(1)],
                ],
                unitPrice: [
                  typeof item.unitPrice === 'string'
                    ? parseFloat(item.unitPrice)
                    : item.unitPrice || 0,
                  [Validators.required, Validators.min(0)],
                ],
              })
            );
          });
        }
      },
      error: () => {
        this.loading = false;
        this.toastService.showError('Error', 'Failed to load purchase order');
        this.router.navigate(['/purchase-orders']);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    const formValue = this.form.value;

    // Format date to string for API and ensure items have numeric values
    const data = {
      ...formValue,
      expectedDeliveryDate: formValue.expectedDeliveryDate
        ? this.formatDate(formValue.expectedDeliveryDate)
        : null,
      items: formValue.items.map((item: any) => ({
        ...item,
        quantity: parseFloat(item.quantity) || 0,
        unitPrice: parseFloat(item.unitPrice) || 0,
      })),
    };

    const obs =
      this.isEdit && this.poId
        ? this.poService.update(this.poId, data)
        : this.poService.create(data);

    obs.subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.toastService.showSuccess(
            'Success',
            this.isEdit ? 'Purchase order updated' : 'Purchase order created'
          );
          this.router.navigate(['/purchase-orders']);
        }
      },
      error: (err) => {
        this.loading = false;
        const errorMessage =
          err.error?.message || err.error?.errors?.join(', ') || 'Operation failed';
        this.toastService.showError('Error', errorMessage);
      },
    });
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  cancel(): void {
    this.router.navigate(['/purchase-orders']);
  }
}
