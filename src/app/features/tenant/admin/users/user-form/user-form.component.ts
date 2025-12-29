import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { Button } from 'primeng/button';
import { TenantUser } from '../user.model';
import { RoleService } from '../../roles/role.service';
import { SelectComponent } from '../../../../../shared/components/select/select.component';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, Password, Button, SelectComponent],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
})
export class UserFormComponent implements OnInit, OnChanges {
  @Input() user: TenantUser | null = null;
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  roles: any[] = [];

  constructor(private fb: FormBuilder, private roleService: RoleService) {}

  ngOnInit(): void {
    this.initForm();
    this.loadRoles();
  }

  ngOnChanges(): void {
    if (this.form) this.patchForm();
  }

  private initForm(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', Validators.required],
      password: ['', this.user ? [] : [Validators.required, Validators.minLength(8)]],
      roleId: [null, Validators.required],
    });
    this.patchForm();
  }

  private loadRoles(): void {
    this.roleService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) this.roles = res.data;
      },
    });
  }

  private patchForm(): void {
    if (this.user) {
      this.form.patchValue({
        email: this.user.email,
        name: this.user.name,
        roleId: this.user.roleId || null,
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
    if (this.user && !data.password) delete data.password;
    if (!data.roleId) delete data.roleId;
    this.save.emit(data);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
