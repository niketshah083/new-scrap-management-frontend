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
import { DeliveryOrderService } from '../delivery-order.service';
import { VendorService } from '../../vendors/vendor.service';
import { MaterialService } from '../../materials/material.service';
import { ToastService } from '../../../../core/services/toast.service';
import { SelectComponent } from '../../../../shared/components/select/select.component';

@Component({
  selector: 'app-do-form',
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
  templateUrl: './do-form.component.html',
  styleUrls: ['./do-form.component.scss'],
})
export class DoFormComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  doId: number | null = null;
  loading = false;
  vendors: any[] = [];
  materials: any[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private doService: DeliveryOrderService,
    private vendorService: VendorService,
    private materialService: MaterialService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.doId = parseInt(idParam, 10);
      this.isEdit = true;
    }

    this.initForm();

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

        if (this.isEdit && this.doId) {
          this.loadDO();
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
      doNumber: ['', Validators.required],
      vendorId: [null, Validators.required],
      doDate: [null, Validators.required],
      vehicleNo: [''],
      grossWeight: [null],
      tareWeight: [null],
      netWeight: [null],
      remarks: [''],
      items: this.fb.array([]),
    });

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
        wbNetWeight: [null],
        quantity: [1, [Validators.required, Validators.min(0.01)]],
        rate: [0, [Validators.required, Validators.min(0)]],
      })
    );
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  calculateNetWeight(): void {
    const gross = this.form.get('grossWeight')?.value || 0;
    const tare = this.form.get('tareWeight')?.value || 0;
    if (gross > 0 && tare > 0) {
      this.form.patchValue({ netWeight: gross - tare });
    }
  }

  private loadDO(): void {
    if (!this.doId) return;
    this.doService.getById(this.doId).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) {
          const dOrder = res.data;
          this.form.patchValue({
            doNumber: dOrder.doNumber,
            vendorId: dOrder.vendorId,
            doDate: dOrder.doDate ? new Date(dOrder.doDate) : null,
            vehicleNo: dOrder.vehicleNo,
            grossWeight: dOrder.grossWeight,
            tareWeight: dOrder.tareWeight,
            netWeight: dOrder.netWeight,
            remarks: dOrder.remarks,
          });
          this.items.clear();
          dOrder.items.forEach((item) => {
            let materialId = item.materialId;
            if (item.material && item.material.id) {
              const materialExists = this.materials.some((m) => m.id === materialId);
              if (!materialExists) {
                materialId = item.material.id;
              }
            }

            this.items.push(
              this.fb.group({
                id: [item.id],
                materialId: [materialId, Validators.required],
                wbNetWeight: [
                  typeof item.wbNetWeight === 'string'
                    ? parseFloat(item.wbNetWeight)
                    : item.wbNetWeight,
                ],
                quantity: [
                  typeof item.quantity === 'string'
                    ? parseFloat(item.quantity)
                    : item.quantity || 1,
                  [Validators.required, Validators.min(0.01)],
                ],
                rate: [
                  typeof item.rate === 'string' ? parseFloat(item.rate) : item.rate || 0,
                  [Validators.required, Validators.min(0)],
                ],
              })
            );
          });
        }
      },
      error: () => {
        this.loading = false;
        this.toastService.showError('Error', 'Failed to load delivery order');
        this.router.navigate(['/delivery-orders']);
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

    const data = {
      ...formValue,
      doDate: formValue.doDate ? this.formatDate(formValue.doDate) : null,
      items: formValue.items.map((item: any) => ({
        ...item,
        wbNetWeight: item.wbNetWeight ? parseFloat(item.wbNetWeight) : null,
        quantity: parseFloat(item.quantity) || 0,
        rate: parseFloat(item.rate) || 0,
      })),
    };

    const obs =
      this.isEdit && this.doId
        ? this.doService.update(this.doId, data)
        : this.doService.create(data);

    obs.subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.toastService.showSuccess(
            'Success',
            this.isEdit ? 'Delivery order updated' : 'Delivery order created'
          );
          this.router.navigate(['/delivery-orders']);
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
    this.router.navigate(['/delivery-orders']);
  }
}
