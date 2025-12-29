import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { SelectModule } from 'primeng/select';

export interface SelectOption {
  label: string;
  value: any;
  disabled?: boolean;
}

export interface SelectConfig {
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  errorMessage?: string;
  filter?: boolean;
  showClear?: boolean;
  optionLabel?: string;
  optionValue?: string;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule],
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
})
export class SelectComponent implements ControlValueAccessor {
  @Input() config: SelectConfig = {};
  @Input() options: any[] = [];
  @Input() id: string = '';
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() optionLabel: string = 'label';
  @Input() optionValue: string = 'value';
  @Input() showClear: boolean = false;
  @Input() filter: boolean = false;
  @Input() required: boolean = false;

  value: any = null;
  disabled: boolean = false;

  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  // Computed getters for merged config and direct inputs
  get effectiveLabel(): string {
    return this.label || this.config.label || '';
  }

  get effectivePlaceholder(): string {
    return this.placeholder || this.config.placeholder || 'Select...';
  }

  get effectiveOptionLabel(): string {
    return this.config.optionLabel || this.optionLabel || 'label';
  }

  get effectiveOptionValue(): string {
    return this.config.optionValue || this.optionValue || 'value';
  }

  get effectiveShowClear(): boolean {
    return this.showClear || this.config.showClear || false;
  }

  get effectiveFilter(): boolean {
    return this.filter || this.config.filter || false;
  }

  get effectiveRequired(): boolean {
    return this.required || this.config.required || false;
  }

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onSelectionChange(value: any): void {
    this.value = value;
    this.onChange(this.value);
  }

  onBlur(): void {
    this.onTouched();
  }
}
