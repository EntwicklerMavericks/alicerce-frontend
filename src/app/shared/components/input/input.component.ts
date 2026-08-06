import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="input-wrapper" [class.has-error]="invalid && touched" [class.focused]="isFocused">
      @if (label) {
        <label [for]="id" class="input-label">
          {{ label }}
          @if (required) { <span class="required-star">*</span> }
        </label>
      }

      <div class="input-container">
        @if (icon) {
          <span class="material-symbols-rounded leading-icon">{{ icon }}</span>
        }

        <input
          [id]="id"
          [type]="isPassword ? (showPassword ? 'text' : 'password') : type"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [value]="value"
          (input)="onInput($event)"
          (blur)="onBlur()"
          (focus)="isFocused = true"
          class="input-field"
        />

        @if (type === 'password') {
          <button type="button" class="toggle-password-btn" (click)="togglePasswordVisibility()" tabIndex="-1">
            <span class="material-symbols-rounded">
              {{ showPassword ? 'visibility_off' : 'visibility' }}
            </span>
          </button>
        }
      </div>

      @if (invalid && touched && errorMessage) {
        <span class="error-msg">{{ errorMessage }}</span>
      } @else if (hint) {
        <span class="hint-msg">{{ hint }}</span>
      }
    </div>
  `,
  styles: [`
    .input-wrapper {
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 100%;
    }

    .input-label {
      font-size: 13px;
      font-weight: 600;
      color: var(--color-text-secondary);
    }

    .required-star {
      color: var(--color-negative);
    }

    .input-container {
      position: relative;
      display: flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-md);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);

      &:hover {
        border-color: rgba(216, 184, 126, 0.35);
      }
    }

    .focused .input-container {
      border-color: var(--color-champagne-main);
      box-shadow: 0 0 15px rgba(216, 184, 126, 0.2);
      background: rgba(255, 255, 255, 0.08);
    }

    .has-error .input-container {
      border-color: var(--color-negative) !important;
      box-shadow: 0 0 12px rgba(244, 63, 94, 0.2) !important;
    }

    .leading-icon {
      position: absolute;
      left: 14px;
      color: var(--color-text-tertiary);
      font-size: 20px;
      pointer-events: none;
    }

    .input-field {
      width: 100%;
      background: transparent;
      border: none;
      outline: none;
      padding: 12px 16px;
      font-family: var(--font-primary);
      font-size: 14px;
      color: var(--color-text-primary);

      &::placeholder {
        color: var(--color-text-tertiary);
      }
    }

    .input-wrapper:has(.leading-icon) .input-field {
      padding-left: 44px;
    }

    .toggle-password-btn {
      background: none;
      border: none;
      color: var(--color-text-tertiary);
      cursor: pointer;
      padding: 8px 12px;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        color: var(--color-text-primary);
      }

      span { font-size: 20px; }
    }

    .error-msg {
      font-size: 11px;
      color: var(--color-negative);
      font-weight: 600;
    }

    .hint-msg {
      font-size: 11px;
      color: var(--color-text-tertiary);
    }
  `],
})
export class InputComponent implements ControlValueAccessor {
  @Input() id = `input-${Math.random().toString(36).substr(2, 9)}`;
  @Input() label?: string;
  @Input() placeholder = '';
  @Input() type = 'text';
  @Input() icon?: string;
  @Input() hint?: string;
  @Input() errorMessage?: string;
  @Input() required = false;
  @Input() invalid = false;

  value = '';
  disabled = false;
  touched = false;
  isFocused = false;
  showPassword = false;

  get isPassword(): boolean {
    return this.type === 'password';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: string): void {
    this.value = val || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event): void {
    const inputVal = (event.target as HTMLInputElement).value;
    this.value = inputVal;
    this.onChange(inputVal);
  }

  onBlur(): void {
    this.isFocused = false;
    this.touched = true;
    this.onTouched();
  }
}
