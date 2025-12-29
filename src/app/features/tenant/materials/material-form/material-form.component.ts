import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { Material } from '../material.model';

@Component({
  selector: 'app-material-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, Button],
  templateUrl: './material-form.component.html',
  styleUrls: ['./material-form.component.scss'],
})
export class MaterialFormComponent implements OnInit, OnChanges {
  @Input() material: Material | null = null;
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
      name: ['', Validators.required],
      code: ['', Validators.required],
      unitOfMeasure: ['', Validators.required],
      category: ['', Validators.required],
    });
    this.patchForm();
  }

  private patchForm(): void {
    if (this.material) {
      this.form.patchValue(this.material);
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
