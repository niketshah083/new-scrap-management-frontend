import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';

export interface MultiSelectConfig {
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  errorMessage?: string;
  filter?: boolean;
  showClear?: boolean;
  maxSelectedLabels?: number;
  optionLabel?: string;
  optionValue?: string;
  display?: 'comma' | 'chip';
}

@Component({
  selector: 'app-multiselect',
  standalone: true,
  imports: [CommonModule, FormsModule, MultiSelectModule],
  templateUrl: './multiselect.component.html',
  styleUrls: ['./multiselect.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiselectComponent),
      multi: true,
    },
  ],
})
export class MultiselectComponent implements ControlValueAccessor {
  @Input() config: MultiSelectConfig = {};
  @Input() options: any[] = [];
  @Input() id: string = '';
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() optionLabel: string = 'label';
  @Input() optionValue: string = 'value';
  @Input() showClear: boolean = false;
  @Input() filter: boolean = true;
  @Input() required: boolean = false;
  @Input() maxSelectedLabels: number = 3;
  @Input() display: 'comma' | 'chip' = 'comma';

  value: any[] = [];
  disabled: boolean = false;

  onChange: (value: any[]) => void = () => {};
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
    return this.filter !== false && this.config.filter !== false;
  }

  get effectiveRequired(): boolean {
    return this.required || this.config.required || false;
  }

  get effectiveMaxSelectedLabels(): number {
    return this.config.maxSelectedLabels || this.maxSelectedLabels || 3;
  }

  get effectiveDisplay(): 'comma' | 'chip' {
    return this.config.display || this.display || 'comma';
  }

  writeValue(value: any[]): void {
    this.value = value || [];
  }

  registerOnChange(fn: (value: any[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onSelectionChange(value: any[]): void {
    this.value = value;
    this.onChange(this.value);
  }

  onBlur(): void {
    this.onTouched();
  }
}
