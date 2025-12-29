import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Button } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { Tenant, CreateTenantRequest } from '../tenant.model';

@Component({
  selector: 'app-tenant-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, Textarea, Button, PasswordModule],
  templateUrl: './tenant-form.component.html',
  styleUrls: ['./tenant-form.component.scss'],
})
export class TenantFormComponent implements OnInit, OnChanges {
  @Input() tenant: Tenant | null = null;
  @Output() save = new EventEmitter<CreateTenantRequest | Partial<Tenant>>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  isEditing = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(): void {
    this.isEditing = !!this.tenant;
    if (this.form) {
      this.patchForm();
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      companyName: ['', [Validators.required, Validators.maxLength(255)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      phone: ['', [Validators.required, Validators.maxLength(20)]],
      address: [''],
      // Admin user fields (only for create)
      adminName: ['', [Validators.required, Validators.maxLength(100)]],
      adminEmail: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      adminPassword: [
        '',
        [Validators.required, Validators.minLength(8), Validators.maxLength(100)],
      ],
    });
    this.patchForm();
  }

  private patchForm(): void {
    if (this.tenant) {
      this.form.patchValue({
        companyName: this.tenant.companyName,
        email: this.tenant.email,
        phone: this.tenant.phone || '',
        address: this.tenant.address || '',
      });
      // Disable admin fields when editing
      this.form.get('adminName')?.disable();
      this.form.get('adminEmail')?.disable();
      this.form.get('adminPassword')?.disable();
      // Remove validators for admin fields when editing
      this.form.get('adminName')?.clearValidators();
      this.form.get('adminEmail')?.clearValidators();
      this.form.get('adminPassword')?.clearValidators();
      this.form.get('adminName')?.updateValueAndValidity();
      this.form.get('adminEmail')?.updateValueAndValidity();
      this.form.get('adminPassword')?.updateValueAndValidity();
    } else {
      this.form.reset();
      // Enable admin fields when creating
      this.form.get('adminName')?.enable();
      this.form.get('adminEmail')?.enable();
      this.form.get('adminPassword')?.enable();
      // Add validators back
      this.form.get('adminName')?.setValidators([Validators.required, Validators.maxLength(100)]);
      this.form
        .get('adminEmail')
        ?.setValidators([Validators.required, Validators.email, Validators.maxLength(255)]);
      this.form
        .get('adminPassword')
        ?.setValidators([Validators.required, Validators.minLength(8), Validators.maxLength(100)]);
      this.form.get('adminName')?.updateValueAndValidity();
      this.form.get('adminEmail')?.updateValueAndValidity();
      this.form.get('adminPassword')?.updateValueAndValidity();
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.tenant) {
      // Only send tenant fields when editing
      const { companyName, email, phone, address } = this.form.value;
      this.save.emit({ companyName, email, phone, address });
    } else {
      // Send all fields when creating
      this.save.emit(this.form.value);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
