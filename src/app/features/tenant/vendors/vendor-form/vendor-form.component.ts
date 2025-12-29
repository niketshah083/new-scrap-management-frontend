import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Button } from 'primeng/button';
import { Vendor } from '../vendor.model';

@Component({
  selector: 'app-vendor-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, Textarea, Button],
  templateUrl: './vendor-form.component.html',
  styleUrls: ['./vendor-form.component.scss'],
})
export class VendorFormComponent implements OnInit, OnChanges {
  @Input() vendor: Vendor | null = null;
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(): void {
    if (this.form) this.patchForm();
  }

  private initForm(): void {
    this.form = this.fb.group({
      companyName: ['', Validators.required],
      contactPerson: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
    });
    this.patchForm();
  }

  private patchForm(): void {
    if (this.vendor) {
      this.form.patchValue(this.vendor);
    } else {
      this.form.reset();
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
