import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary-gold' | 'primary-bordo' | 'secondary-glass' | 'outline-gold' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [class]="'app-btn ' + variant + ' ' + size"
      (click)="onClick($event)">
      @if (loading) {
        <span class="spinner"></span>
      } @else if (icon) {
        <span class="material-symbols-rounded btn-icon">{{ icon }}</span>
      }
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    .app-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border-radius: var(--radius-md);
      font-family: var(--font-primary);
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
      overflow: hidden;

      &:disabled {
        opacity: 0.55;
        cursor: not-allowed;
        transform: none !important;
        box-shadow: none !important;
      }

      /* Sizes */
      &.sm { padding: 8px 14px; font-size: 12px; }
      &.md { padding: 12px 20px; font-size: 14px; }
      &.lg { padding: 16px 28px; font-size: 16px; }

      /* Variants */
      &.primary-gold {
        background: var(--color-gold-gradient);
        color: #2b0b10;
        box-shadow: var(--shadow-gold-glow);

        &:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(216, 184, 126, 0.45);
        }
      }

      &.primary-bordo {
        background: var(--color-primary-gradient);
        color: #ffffff;
        border: 1px solid rgba(216, 184, 126, 0.3);
        box-shadow: var(--shadow-bordo-glow);

        &:hover:not(:disabled) {
          transform: translateY(-2px);
          border-color: rgba(216, 184, 126, 0.6);
        }
      }

      &.secondary-glass {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(216, 184, 126, 0.25);
        color: var(--color-champagne-light);

        &:hover:not(:disabled) {
          background: rgba(216, 184, 126, 0.18);
          color: #ffffff;
        }
      }

      &.outline-gold {
        background: transparent;
        border: 1px solid var(--color-champagne-main);
        color: var(--color-champagne-main);

        &:hover:not(:disabled) {
          background: rgba(216, 184, 126, 0.15);
        }
      }

      &.ghost {
        background: transparent;
        color: var(--color-text-secondary);

        &:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.06);
          color: var(--color-text-primary);
        }
      }
    }

    .btn-icon { font-size: 20px; }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `],
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary-gold';
  @Input() size: ButtonSize = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() icon?: string;

  @Output() btnClick = new EventEmitter<MouseEvent>();

  onClick(event: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.btnClick.emit(event);
    }
  }
}
