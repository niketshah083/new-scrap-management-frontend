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
import { WeighbridgeService } from '../weighbridge.service';
import { WeighbridgeMaster } from '../weighbridge.model';
import { WeighbridgeFormComponent } from '../weighbridge-form/weighbridge-form.component';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmService } from '../../../../core/services/confirm.service';

@Component({
  selector: 'app-weighbridge-list',
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
    WeighbridgeFormComponent,
  ],
  templateUrl: './weighbridge-list.component.html',
  styleUrls: ['./weighbridge-list.component.scss'],
})
export class WeighbridgeListComponent implements OnInit {
  weighbridges: WeighbridgeMaster[] = [];
  filteredWeighbridges: WeighbridgeMaster[] = [];
  loading = false;
  formVisible = false;
  editingWeighbridge: WeighbridgeMaster | null = null;
  searchTerm = '';
  selectedStatus: boolean | null = null;

  statusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
  ];

  constructor(
    private weighbridgeService: WeighbridgeService,
    private toastService: ToastService,
    private confirmService: ConfirmService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadWeighbridges();
  }

  get totalCount(): number {
    return this.weighbridges.length;
  }

  get activeCount(): number {
    return this.weighbridges.filter((w) => w.isActive).length;
  }

  get inactiveCount(): number {
    return this.weighbridges.filter((w) => !w.isActive).length;
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilter(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.weighbridges];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        (w) =>
          w.name?.toLowerCase().includes(term) ||
          w.code?.toLowerCase().includes(term) ||
          w.location?.toLowerCase().includes(term)
      );
    }

    if (this.selectedStatus !== null) {
      result = result.filter((w) => w.isActive === this.selectedStatus);
    }

    this.filteredWeighbridges = result;
  }

  loadWeighbridges(): void {
    this.loading = true;
    this.weighbridgeService.getAllMasters().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.weighbridges = res.data;
          this.filteredWeighbridges = [...this.weighbridges];
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastService.showError('Error', 'Failed to load weighbridges');
      },
    });
  }

  openForm(weighbridge?: WeighbridgeMaster): void {
    this.editingWeighbridge = weighbridge || null;
    this.formVisible = true;
  }

  closeForm(): void {
    this.formVisible = false;
    this.editingWeighbridge = null;
  }

  onSave(data: any): void {
    const obs = this.editingWeighbridge
      ? this.weighbridgeService.updateMaster(this.editingWeighbridge.id, data)
      : this.weighbridgeService.createMaster(data);

    obs.subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.showSuccess(
            'Success',
            this.editingWeighbridge ? 'Weighbridge updated' : 'Weighbridge created'
          );
          this.closeForm();
          this.loadWeighbridges();
        }
      },
      error: () => this.toastService.showError('Error', 'Operation failed'),
    });
  }

  openConfig(weighbridge: WeighbridgeMaster): void {
    this.router.navigate(['/weighbridge/config', weighbridge.id]);
  }

  confirmDelete(weighbridge: WeighbridgeMaster): void {
    this.confirmService.confirmDelete(`weighbridge "${weighbridge.name}"`).then((confirmed) => {
      if (confirmed) {
        this.weighbridgeService.deleteMaster(weighbridge.id).subscribe({
          next: (res) => {
            if (res.success) {
              this.toastService.showSuccess('Success', 'Weighbridge deleted');
              this.loadWeighbridges();
            }
          },
          error: () => this.toastService.showError('Error', 'Failed to delete weighbridge'),
        });
      }
    });
  }
}
