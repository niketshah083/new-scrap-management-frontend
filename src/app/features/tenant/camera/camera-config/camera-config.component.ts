import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { PasswordModule } from 'primeng/password';
import { Select } from 'primeng/select';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { CameraService } from '../camera.service';
import { CameraMaster, CameraConfig, TRANSPORT_OPTIONS } from '../camera.model';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-camera-config',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    PasswordModule,
    Select,
    Button,
    Card,
  ],
  templateUrl: './camera-config.component.html',
  styleUrls: ['./camera-config.component.scss'],
})
export class CameraConfigComponent implements OnInit {
  cameraMaster: CameraMaster | null = null;
  existingConfig: CameraConfig | null = null;
  form!: FormGroup;
  loading = false;
  saving = false;

  transportOptions = TRANSPORT_OPTIONS;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private cameraService: CameraService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.initForm();
    const masterId = this.route.snapshot.params['id'];
    if (masterId) {
      this.loadCameraMaster(+masterId);
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      rtspUrl: ['', Validators.pattern(/^rtsp:\/\/.+/)],
      streamUrl: [''],
      username: [''],
      password: [''],
      snapshotWidth: [1280, [Validators.min(320), Validators.max(4096)]],
      snapshotHeight: [720, [Validators.min(240), Validators.max(2160)]],
      snapshotQuality: [80, [Validators.min(1), Validators.max(100)]],
      transport: ['tcp'],
      timeout: [10000, [Validators.min(1000), Validators.max(60000)]],
    });
  }

  private loadCameraMaster(id: number): void {
    this.loading = true;
    this.cameraService.getMasterById(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.cameraMaster = res.data;
          this.loadExistingConfig(id);
        } else {
          this.toastService.showError('Error', 'Camera not found');
          this.router.navigate(['/camera']);
        }
      },
      error: () => {
        this.loading = false;
        this.toastService.showError('Error', 'Failed to load camera');
        this.router.navigate(['/camera']);
      },
    });
  }

  private loadExistingConfig(masterId: number): void {
    this.cameraService.getConfigByMasterId(masterId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.existingConfig = res.data;
          this.form.patchValue({
            ...res.data,
            password: '', // Don't show existing password
          });
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid || !this.cameraMaster) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const data = { ...this.form.value };

    // Don't send empty password (keep existing)
    if (!data.password) {
      delete data.password;
    }

    if (this.existingConfig) {
      this.cameraService.updateConfig(this.existingConfig.id, data).subscribe({
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
      this.cameraService.createConfig({ ...data, cameraMasterId: this.cameraMaster.id }).subscribe({
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
    this.router.navigate(['/camera']);
  }
}
