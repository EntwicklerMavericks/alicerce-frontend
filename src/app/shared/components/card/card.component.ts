import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="app-card glass-card" [class.gold-border]="glow">
      @if (title || subtitle) {
        <div class="card-header">
          <div class="header-text">
            @if (title) { <h3 class="card-title">{{ title }}</h3> }
            @if (subtitle) { <p class="card-subtitle">{{ subtitle }}</p> }
          </div>
          <ng-content select="[card-header-actions]"></ng-content>
        </div>
      }
      <div class="card-body">
        <ng-content></ng-content>
      </div>
      <div class="card-footer" *ngIf="hasFooter">
        <ng-content select="[card-footer]"></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .app-card {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;

      &.gold-border {
        border: 1px solid rgba(216, 184, 126, 0.4);
        box-shadow: var(--shadow-gold-glow);
      }
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .card-title {
      font-family: var(--font-primary);
      font-size: 20px;
      font-weight: 700;
      margin: 0;
      color: var(--color-text-primary);
    }

    .card-subtitle {
      font-size: 12px;
      color: var(--color-text-tertiary);
      margin: 4px 0 0 0;
    }

    .card-body {
      flex: 1;
    }

    .card-footer {
      border-top: 1px solid var(--color-border-subtle);
      padding-top: 14px;
      margin-top: 8px;
    }
  `],
})
export class CardComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() glow = false;
  @Input() hasFooter = false;
}
