import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Tag } from 'primeng/tag';
import { Select } from 'primeng/select';
import { Tooltip } from 'primeng/tooltip';
import { CameraService } from '../camera.service';
import { CameraMaster } from '../camera.model';
import { CameraFormComponent } from '../camera-form/camera-form.component';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmService } from '../../../../core/services/confirm.service';

@Component({
  selector: 'app-camera-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    Button,
    Dialog,
    Tag,
    Select,
    Tooltip,
    CameraFormComponent,
  ],
  templateUrl: './camera-list.component.html',
  styleUrls: ['./camera-list.component.scss'],
})
export class CameraListComponent implements OnInit {
  cameras: CameraMaster[] = [];
  filteredCameras: CameraMaster[] = [];
  loading = false;
  formVisible = false;
  editingCamera: CameraMaster | null = null;
  searchTerm = '';
  selectedStatus: boolean | null = null;

  statusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
  ];

  constructor(
    private cameraService: CameraService,
    private toastService: ToastService,
    private confirmService: ConfirmService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCameras();
  }

  get totalCount(): number {
    return this.cameras.length;
  }

  get activeCount(): number {
    return this.cameras.filter((c) => c.isActive).length;
  }

  get inactiveCount(): number {
    return this.cameras.filter((c) => !c.isActive).length;
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilter(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.cameras];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.name?.toLowerCase().includes(term) ||
          c.code?.toLowerCase().includes(term) ||
          c.location?.toLowerCase().includes(term)
      );
    }

    if (this.selectedStatus !== null) {
      result = result.filter((c) => c.isActive === this.selectedStatus);
    }

    this.filteredCameras = result;
  }

  loadCameras(): void {
    this.loading = true;
    this.cameraService.getAllMasters().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.cameras = res.data;
          this.filteredCameras = [...this.cameras];
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastService.showError('Error', 'Failed to load cameras');
      },
    });
  }

  openForm(camera?: CameraMaster): void {
    this.editingCamera = camera || null;
    this.formVisible = true;
  }

  closeForm(): void {
    this.formVisible = false;
    this.editingCamera = null;
  }

  onSave(data: any): void {
    const obs = this.editingCamera
      ? this.cameraService.updateMaster(this.editingCamera.id, data)
      : this.cameraService.createMaster(data);

    obs.subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.showSuccess(
            'Success',
            this.editingCamera ? 'Camera updated' : 'Camera created'
          );
          this.closeForm();
          this.loadCameras();
        }
      },
      error: () => this.toastService.showError('Error', 'Operation failed'),
    });
  }

  openConfig(camera: CameraMaster): void {
    this.router.navigate(['/camera/config', camera.id]);
  }

  openPreview(camera: CameraMaster): void {
    this.router.navigate(['/camera/preview', camera.id]);
  }

  confirmDelete(camera: CameraMaster): void {
    this.confirmService.confirmDelete(`camera "${camera.name}"`).then((confirmed) => {
      if (confirmed) {
        this.cameraService.deleteMaster(camera.id).subscribe({
          next: (res) => {
            if (res.success) {
              this.toastService.showSuccess('Success', 'Camera deleted');
              this.loadCameras();
            }
          },
          error: () => this.toastService.showError('Error', 'Failed to delete camera'),
        });
      }
    });
  }
}
