import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  durationMs?: number;
  actionLabel?: string;
  onAction?: () => void;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  readonly activeToasts = signal<ToastItem[]>([]);

  show(config: Omit<ToastItem, 'id'>): string {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const toast: ToastItem = {
      id,
      durationMs: 4000,
      ...config,
    };

    this.activeToasts.update((list) => [...list, toast]);

    if (toast.durationMs && toast.durationMs > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, toast.durationMs);
    }

    return id;
  }

  showSuccess(message: string, actionLabel?: string, onAction?: () => void): string {
    return this.show({ message, type: 'success', actionLabel, onAction });
  }

  showError(message: string): string {
    return this.show({ message, type: 'error', durationMs: 5000 });
  }

  showWarning(message: string): string {
    return this.show({ message, type: 'warning', durationMs: 4000 });
  }

  dismiss(id: string): void {
    this.activeToasts.update((list) => list.filter((t) => t.id !== id));
  }

  clearAll(): void {
    this.activeToasts.set([]);
  }
}
