import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Button } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { TenantRole, RolePermission } from '../role.model';
import { RoleService } from '../role.service';

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    Textarea,
    Button,
    MultiSelectModule,
  ],
  templateUrl: './role-form.component.html',
  styleUrls: ['./role-form.component.scss'],
})
export class RoleFormComponent implements OnInit, OnChanges {
  @Input() role: TenantRole | null = null;
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  permissions: RolePermission[] = [];
  permissionOptions: { label: string; value: number }[] = [];
  permissionsLoaded = false;

  constructor(private fb: FormBuilder, private roleService: RoleService) {}

  ngOnInit(): void {
    this.initForm();
    this.loadPermissions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.form && this.permissionsLoaded) {
      this.patchForm();
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      permissionIds: [[], Validators.required],
    });
  }

  private loadPermissions(): void {
    this.roleService.getAvailablePermissions().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.permissions = [...res.data];
          // Convert to simple label/value format for better filter compatibility
          this.permissionOptions = this.permissions.map((p) => ({
            label: String(p.code),
            value: Number(p.id),
          }));
          console.log(
            'Loaded permissions:',
            this.permissionOptions.length,
            this.permissionOptions.slice(0, 3)
          );
          this.permissionsLoaded = true;
          this.patchForm();
        }
      },
    });
  }

  private patchForm(): void {
    if (this.role) {
      this.form.patchValue({
        name: this.role.name,
        description: this.role.description || '',
        permissionIds: this.role.permissions?.map((p) => p.id) || [],
      });
    } else {
      this.form.reset({ permissionIds: [] });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.save.emit(this.form.value);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
