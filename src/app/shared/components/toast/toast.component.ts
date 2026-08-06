import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastItem } from '../../../core/services/toast.service';
import { HapticsService } from '../../../core/platform/haptics.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.activeToasts(); track toast.id) {
        <div [class]="'toast-item animate-fade-in ' + toast.type">
          <span class="material-symbols-rounded toast-icon">
            {{ getIcon(toast.type) }}
          </span>

          <span class="toast-message">{{ toast.message }}</span>

          @if (toast.actionLabel) {
            <button class="toast-action-btn" (click)="onAction(toast)">
              {{ toast.actionLabel }}
            </button>
          }

          <button class="toast-close-btn" (click)="dismiss(toast.id)">
            <span class="material-symbols-rounded">close</span>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: calc(16px + var(--sat));
      right: 16px;
      left: 16px;
      z-index: 300;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;

      @media (min-width: 768px) {
        left: auto;
        width: 380px;
      }
    }

    .toast-item {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: var(--alic-radius-md);
      background: rgba(24, 7, 10, 0.95);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(216, 184, 126, 0.3);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
      color: #ffffff;
      font-size: 13px;

      &.success {
        border-color: rgba(16, 185, 129, 0.4);
        .toast-icon { color: #10b981; }
      }

      &.error {
        border-color: rgba(244, 63, 94, 0.4);
        .toast-icon { color: #f43f5e; }
      }

      &.warning {
        border-color: rgba(245, 158, 11, 0.4);
        .toast-icon { color: #f59e0b; }
      }
    }

    .toast-icon { font-size: 20px; }
    .toast-message { flex: 1; font-weight: 500; }

    .toast-action-btn {
      background: rgba(216, 184, 126, 0.2);
      border: 1px solid rgba(216, 184, 126, 0.4);
      color: var(--alic-color-gold-light);
      padding: 4px 10px;
      border-radius: var(--alic-radius-sm);
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      &:hover { background: rgba(216, 184, 126, 0.35); }
    }

    .toast-close-btn {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.5);
      cursor: pointer;
      padding: 2px;
      span { font-size: 18px; }
    }
  `],
})
export class ToastComponent {
  readonly toastService = inject(ToastService);
  private readonly haptics = inject(HapticsService);

  getIcon(type: string): string {
    switch (type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'info';
    }
  }

  onAction(toast: ToastItem): void {
    this.haptics.impactMedium();
    if (toast.onAction) toast.onAction();
    this.dismiss(toast.id);
  }

  dismiss(id: string): void {
    this.haptics.impactLight();
    this.toastService.dismiss(id);
  }
}
