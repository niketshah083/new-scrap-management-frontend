import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { Button } from 'primeng/button';
import { CameraMaster, CAMERA_TYPE_OPTIONS } from '../camera.model';

@Component({
  selector: 'app-camera-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, TextareaModule, Select, Button],
  templateUrl: './camera-form.component.html',
  styleUrls: ['./camera-form.component.scss'],
})
export class CameraFormComponent implements OnInit, OnChanges {
  @Input() camera: CameraMaster | null = null;
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  cameraTypeOptions = CAMERA_TYPE_OPTIONS;

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
      cameraType: ['RTSP'],
    });
    this.patchForm();
  }

  private patchForm(): void {
    if (this.camera) {
      this.form.patchValue(this.camera);
    } else {
      this.form.reset({ cameraType: 'RTSP' });
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
