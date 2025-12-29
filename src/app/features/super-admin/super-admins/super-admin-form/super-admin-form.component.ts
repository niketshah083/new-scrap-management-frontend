import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { Button } from 'primeng/button';
import { SuperAdmin } from '../super-admin.model';

@Component({
  selector: 'app-super-admin-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, Password, Button],
  templateUrl: './super-admin-form.component.html',
  styleUrls: ['./super-admin-form.component.scss'],
})
export class SuperAdminFormComponent implements OnInit, OnChanges {
  @Input() admin: SuperAdmin | null = null;
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(): void {
    if (this.form) {
      this.patchForm();
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required]],
      password: ['', this.admin ? [] : [Validators.required, Validators.minLength(8)]],
    });
    this.patchForm();
  }

  private patchForm(): void {
    if (this.admin) {
      this.form.patchValue({
        email: this.admin.email,
        name: this.admin.name,
      });
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();
    } else {
      this.form.reset();
      this.form.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
      this.form.get('password')?.updateValueAndValidity();
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const data = { ...this.form.value };
    if (this.admin && !data.password) {
      delete data.password;
    }
    this.save.emit(data);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
