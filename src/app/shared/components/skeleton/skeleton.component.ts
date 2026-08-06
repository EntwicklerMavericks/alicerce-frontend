import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SkeletonType = 'text' | 'avatar' | 'card' | 'button' | 'chart' | 'list';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="'skeleton-item ' + type()" [style.width]="width()" [style.height]="height()"></div>
  `,
  styles: [`
    .skeleton-item {
      background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0.04) 0%,
        rgba(216, 184, 126, 0.12) 50%,
        rgba(255, 255, 255, 0.04) 100%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite linear;
      border-radius: var(--alic-radius-md);

      &.text {
        height: 16px;
        border-radius: 4px;
      }

      &.avatar {
        width: 44px;
        height: 44px;
        border-radius: 50%;
      }

      &.card {
        height: 120px;
        border-radius: var(--alic-radius-card);
      }

      &.button {
        height: 48px;
        border-radius: var(--alic-radius-md);
      }

      &.chart {
        height: 220px;
        border-radius: var(--alic-radius-lg);
      }

      &.list {
        height: 64px;
        border-radius: var(--alic-radius-md);
      }
    }
  `],
})
export class SkeletonComponent {
  readonly type = input<SkeletonType>('card');
  readonly width = input<string>('100%');
  readonly height = input<string>('');
}
