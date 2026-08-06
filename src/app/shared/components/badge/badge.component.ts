import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'gold' | 'bordo' | 'positive' | 'negative' | 'neutral';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="'app-badge ' + variant">
      @if (icon) {
        <span class="material-symbols-rounded badge-icon">{{ icon }}</span>
      }
      <ng-content></ng-content>
    </span>
  `,
  styles: [`
    .app-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: var(--radius-full);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.3px;

      &.gold {
        background: rgba(216, 184, 126, 0.18);
        color: var(--color-champagne-light);
        border: 1px solid rgba(216, 184, 126, 0.3);
      }

      &.bordo {
        background: rgba(146, 38, 56, 0.2);
        color: var(--color-bordo-light);
        border: 1px solid rgba(146, 38, 56, 0.35);
      }

      &.positive {
        background: var(--color-positive-bg);
        color: var(--color-positive);
      }

      &.negative {
        background: var(--color-negative-bg);
        color: var(--color-negative);
      }

      &.neutral {
        background: rgba(255, 255, 255, 0.08);
        color: var(--color-text-secondary);
      }
    }

    .badge-icon {
      font-size: 14px;
    }
  `],
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'gold';
  @Input() icon?: string;
}
