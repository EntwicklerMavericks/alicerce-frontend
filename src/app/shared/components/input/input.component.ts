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
        @if (effectiveIcon) {
          <span class="material-symbols-rounded leading-icon">{{ effectiveIcon }}</span>
        }

        <input
          [id]="id"
          [type]="inputType"
          [attr.inputmode]="inputMode"
          [placeholder]="effectivePlaceholder"
          [disabled]="disabled"
          [value]="displayValue"
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
      color: #ebd9b6;
    }

    .required-star {
      color: #fb7185;
    }

    .input-container {
      position: relative;
      display: flex;
      align-items: center;
      background: rgba(18, 7, 9, 0.65);
      border: 1px solid rgba(216, 184, 126, 0.25);
      border-radius: var(--radius-md);
      overflow: hidden;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);

      &:hover {
        border-color: rgba(216, 184, 126, 0.5);
      }
    }

    .focused .input-container {
      border-color: #d8b87e;
      box-shadow: 0 0 15px rgba(216, 184, 126, 0.25);
      background: rgba(26, 10, 14, 0.85);
    }

    .has-error .input-container {
      border-color: #fb7185 !important;
      box-shadow: 0 0 12px rgba(244, 63, 94, 0.25) !important;
    }

    .leading-icon {
      position: absolute;
      left: 14px;
      color: #d8b87e;
      font-size: 20px;
      pointer-events: none;
      z-index: 2;
    }

    .input-field {
      width: 100%;
      background: transparent;
      border: none;
      outline: none;
      padding: 12px 16px;
      font-family: var(--font-primary);
      font-size: 14px;
      color: #fbf5eb;
      border-radius: inherit;

      &::placeholder {
        color: rgba(214, 200, 180, 0.45);
      }

      /* Fix para autofill do Chrome/Edge com fundo feio lavanda/azul mantendo a borda arredondada */
      &:-webkit-autofill,
      &:-webkit-autofill:hover, 
      &:-webkit-autofill:focus, 
      &:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0 1000px #1a0a0f inset !important;
        -webkit-text-fill-color: #fbf5eb !important;
        caret-color: #fbf5eb;
        transition: background-color 5000s ease-in-out 0s;
        border-radius: inherit !important;
      }
    }

    .input-wrapper:has(.leading-icon) .input-field {
      padding-left: 44px;
    }

    .toggle-password-btn {
      background: none;
      border: none;
      color: #d8b87e;
      cursor: pointer;
      padding: 8px 12px;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        color: #ebd9b6;
      }

      span { font-size: 20px; }
    }

    .error-msg {
      font-size: 11px;
      color: #fb7185;
      font-weight: 600;
    }

    .hint-msg {
      font-size: 11px;
      color: rgba(214, 200, 180, 0.6);
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

  displayValue = '';
  disabled = false;
  touched = false;
  isFocused = false;
  showPassword = false;

  get isPassword(): boolean {
    return this.type === 'password';
  }

  get isCurrency(): boolean {
    return this.type === 'currency';
  }

  get inputType(): string {
    if (this.isPassword) {
      return this.showPassword ? 'text' : 'password';
    }
    if (this.isCurrency) {
      return 'text';
    }
    return this.type;
  }

  get inputMode(): string | null {
    if (this.isCurrency) {
      return 'numeric';
    }
    return null;
  }

  get effectiveIcon(): string | undefined {
    if (this.icon) return this.icon;
    if (this.isCurrency) return 'attach_money';
    return undefined;
  }

  get effectivePlaceholder(): string {
    if (this.placeholder) return this.placeholder;
    if (this.isCurrency) return 'R$ 0,00';
    return '';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: any): void {
    if (this.isCurrency) {
      if (val !== null && val !== undefined && val !== '') {
        const num = Number(val);
        if (!isNaN(num) && num > 0) {
          const cents = Math.round(num * 100);
          const { display } = this.formatCurrency(cents.toString());
          this.displayValue = display;
        } else {
          this.displayValue = '';
        }
      } else {
        this.displayValue = '';
      }
    } else {
      this.displayValue = val || '';
    }
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

  onInput(event: Event): void {
    const rawVal = (event.target as HTMLInputElement).value;
    if (this.isCurrency) {
      const { display, numberValue } = this.formatCurrency(rawVal);
      this.displayValue = display;
      (event.target as HTMLInputElement).value = display;
      this.onChange(numberValue > 0 ? numberValue : null);
    } else {
      this.displayValue = rawVal;
      this.onChange(rawVal);
    }
  }

  onBlur(): void {
    this.isFocused = false;
    this.touched = true;
    this.onTouched();
  }

  private formatCurrency(val: string): { display: string; numberValue: number } {
    const digitsOnly = String(val).replace(/\D/g, '');
    if (!digitsOnly) {
      return { display: '', numberValue: 0 };
    }

    const numberValue = Number(digitsOnly) / 100;
    const display = numberValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return { display, numberValue };
  }
}
