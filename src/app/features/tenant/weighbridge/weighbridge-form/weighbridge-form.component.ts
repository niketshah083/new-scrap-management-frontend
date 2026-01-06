import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { Button } from 'primeng/button';
import { WeighbridgeMaster } from '../weighbridge.model';

@Component({
  selector: 'app-weighbridge-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, TextareaModule, Button],
  templateUrl: './weighbridge-form.component.html',
  styleUrls: ['./weighbridge-form.component.scss'],
})
export class WeighbridgeFormComponent implements OnInit, OnChanges {
  @Input() weighbridge: WeighbridgeMaster | null = null;
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
      name: ['', [Validators.required, Validators.maxLength(100)]],
      code: ['', [Validators.required, Validators.maxLength(50)]],
      location: ['', Validators.maxLength(200)],
      description: [''],
    });
    this.patchForm();
  }

  private patchForm(): void {
    if (this.weighbridge) {
      this.form.patchValue(this.weighbridge);
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
