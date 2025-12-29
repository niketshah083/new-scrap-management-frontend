import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Tag } from 'primeng/tag';
import { Select } from 'primeng/select';
import { Tooltip } from 'primeng/tooltip';
import { MaterialService } from '../material.service';
import { Material } from '../material.model';
import { MaterialFormComponent } from '../material-form/material-form.component';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmService } from '../../../../core/services/confirm.service';

@Component({
  selector: 'app-material-list',
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
    MaterialFormComponent,
  ],
  templateUrl: './material-list.component.html',
  styleUrls: ['./material-list.component.scss'],
})
export class MaterialListComponent implements OnInit {
  materials: Material[] = [];
  filteredMaterials: Material[] = [];
  loading = false;
  formVisible = false;
  editingMaterial: Material | null = null;
  searchTerm = '';
  selectedStatus: boolean | null = null;

  statusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
  ];

  constructor(
    private materialService: MaterialService,
    private toastService: ToastService,
    private confirmService: ConfirmService
  ) {}

  ngOnInit(): void {
    this.loadMaterials();
  }

  get totalCount(): number {
    return this.materials.length;
  }

  get activeCount(): number {
    return this.materials.filter((m) => m.isActive).length;
  }

  get inactiveCount(): number {
    return this.materials.filter((m) => !m.isActive).length;
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilter(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.materials];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        (m) =>
          m.name?.toLowerCase().includes(term) ||
          m.code?.toLowerCase().includes(term) ||
          m.category?.toLowerCase().includes(term)
      );
    }

    if (this.selectedStatus !== null) {
      result = result.filter((m) => m.isActive === this.selectedStatus);
    }

    this.filteredMaterials = result;
  }

  loadMaterials(): void {
    this.loading = true;
    this.materialService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.materials = res.data;
          this.filteredMaterials = [...this.materials];
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastService.showError('Error', 'Failed to load materials');
      },
    });
  }

  openForm(material?: Material): void {
    this.editingMaterial = material || null;
    this.formVisible = true;
  }

  closeForm(): void {
    this.formVisible = false;
    this.editingMaterial = null;
  }

  onSave(data: any): void {
    const obs = this.editingMaterial
      ? this.materialService.update(this.editingMaterial.id, data)
      : this.materialService.create(data);

    obs.subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.showSuccess(
            'Success',
            this.editingMaterial ? 'Material updated' : 'Material created'
          );
          this.closeForm();
          this.loadMaterials();
        }
      },
      error: () => this.toastService.showError('Error', 'Operation failed'),
    });
  }

  confirmDelete(material: Material): void {
    this.confirmService.confirmDelete(`material "${material.name}"`).then((confirmed) => {
      if (confirmed) {
        this.materialService.delete(material.id).subscribe({
          next: (res) => {
            if (res.success) {
              this.toastService.showSuccess('Success', 'Material deleted');
              this.loadMaterials();
            }
          },
          error: () => this.toastService.showError('Error', 'Failed to delete material'),
        });
      }
    });
  }
}
