import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Subscription } from 'rxjs';
import { CameraService } from '../camera.service';
import { CameraMaster, CameraConfig } from '../camera.model';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-camera-preview',
  standalone: true,
  imports: [CommonModule, Button, Card],
  templateUrl: './camera-preview.component.html',
  styleUrls: ['./camera-preview.component.scss'],
})
export class CameraPreviewComponent implements OnInit, OnDestroy {
  cameraMaster: CameraMaster | null = null;
  cameraConfig: CameraConfig | null = null;
  loading = false;
  isFullscreen = false;
  currentFrame: string | null = null;
  lastUpdated: Date | null = null;

  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private cameraService: CameraService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const masterId = this.route.snapshot.params['id'];
    if (masterId) {
      this.loadCamera(+masterId);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private loadCamera(id: number): void {
    this.loading = true;
    this.cameraService.getMasterById(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.cameraMaster = res.data;
          this.loadConfig(id);
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

  private loadConfig(masterId: number): void {
    this.cameraService.getConfigByMasterId(masterId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.cameraConfig = res.data;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
  }

  captureSnapshot(): void {
    // This would trigger a snapshot capture via Socket.IO
    this.toastService.showInfo('Info', 'Snapshot capture requested');
  }

  goBack(): void {
    this.router.navigate(['/camera']);
  }
}
