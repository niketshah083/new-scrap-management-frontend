import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { Select } from 'primeng/select';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { WeighbridgeService } from '../weighbridge.service';
import {
  WeighbridgeMaster,
  WeighbridgeConfig,
  BAUD_RATES,
  DATA_BITS,
  STOP_BITS,
  PARITY_OPTIONS,
  WEIGHT_UNITS,
} from '../weighbridge.model';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-weighbridge-config',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    Select,
    Button,
    Card,
  ],
  templateUrl: './weighbridge-config.component.html',
  styleUrls: ['./weighbridge-config.component.scss'],
})
export class WeighbridgeConfigComponent implements OnInit {
  weighbridgeMaster: WeighbridgeMaster | null = null;
  existingConfig: WeighbridgeConfig | null = null;
  form!: FormGroup;
  loading = false;
  saving = false;

  baudRateOptions = BAUD_RATES.map((r) => ({ label: r.toString(), value: r }));
  dataBitsOptions = DATA_BITS.map((d) => ({ label: d.toString(), value: d }));
  stopBitsOptions = STOP_BITS.map((s) => ({ label: s.toString(), value: s }));
  parityOptions = PARITY_OPTIONS.map((p) => ({ label: p, value: p }));
  weightUnitOptions = WEIGHT_UNITS.map((u) => ({ label: u, value: u }));

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private weighbridgeService: WeighbridgeService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.initForm();
    const masterId = this.route.snapshot.params['id'];
    if (masterId) {
      this.loadWeighbridgeMaster(+masterId);
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      serialPort: ['', Validators.required],
      baudRate: [9600, Validators.required],
      dataBits: [8, Validators.required],
      stopBits: [1, Validators.required],
      parity: ['none', Validators.required],
      weightRegex: [''],
      weightStartMarker: [''],
      weightEndMarker: [''],
      weightMultiplier: [1],
      weightUnit: ['kg'],
      pollingInterval: [1000],
      stableReadings: [3],
      stabilityThreshold: [0.5],
    });
  }

  private loadWeighbridgeMaster(id: number): void {
    this.loading = true;
    this.weighbridgeService.getMasterById(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.weighbridgeMaster = res.data;
          this.loadExistingConfig(id);
        } else {
          this.toastService.showError('Error', 'Weighbridge not found');
          this.router.navigate(['/tenant/weighbridge']);
        }
      },
      error: () => {
        this.loading = false;
        this.toastService.showError('Error', 'Failed to load weighbridge');
        this.router.navigate(['/tenant/weighbridge']);
      },
    });
  }

  private loadExistingConfig(masterId: number): void {
    this.weighbridgeService.getConfigByMasterId(masterId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.existingConfig = res.data;
          this.form.patchValue(res.data);
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid || !this.weighbridgeMaster) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const data = this.form.value;

    if (this.existingConfig) {
      this.weighbridgeService.updateConfig(this.existingConfig.id, data).subscribe({
        next: (res) => {
          this.saving = false;
          if (res.success) {
            this.toastService.showSuccess('Success', 'Configuration updated');
          }
        },
        error: () => {
          this.saving = false;
          this.toastService.showError('Error', 'Failed to update configuration');
        },
      });
    } else {
      this.weighbridgeService
        .createConfig({ ...data, weighbridgeMasterId: this.weighbridgeMaster.id })
        .subscribe({
          next: (res) => {
            this.saving = false;
            if (res.success && res.data) {
              this.existingConfig = res.data;
              this.toastService.showSuccess('Success', 'Configuration created');
            }
          },
          error: () => {
            this.saving = false;
            this.toastService.showError('Error', 'Failed to create configuration');
          },
        });
    }
  }

  goBack(): void {
    this.router.navigate(['/tenant/weighbridge']);
  }
}
