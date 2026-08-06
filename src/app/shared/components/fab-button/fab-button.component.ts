import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FabActionRegistryService, FabAction } from '../../../core/services/fab-action-registry.service';
import { HapticsService } from '../../../core/platform/haptics.service';

@Component({
  selector: 'app-fab-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fab-wrapper" [class.open]="isOpen()">
      @if (isOpen()) {
        <div class="fab-backdrop" (click)="toggleMenu()"></div>
        
        <div class="fab-menu animate-fade-in">
          @for (action of fabRegistry.registeredActions(); track action.id) {
            <button class="fab-action-item touch-active" (click)="executeAction(action)">
              <span class="action-label">{{ action.label }}</span>
              <div class="action-icon-circle" [style.background]="action.color">
                <span class="material-symbols-rounded">{{ action.icon }}</span>
              </div>
            </button>
          }
        </div>
      }

      <button class="fab-main-btn touch-active" (click)="toggleMenu()" title="Ações Rápidas">
        <span class="material-symbols-rounded fab-icon">{{ isOpen() ? 'close' : 'add' }}</span>
      </button>
    </div>
  `,
  styles: [`
    .fab-wrapper {
      position: fixed;
      bottom: calc(72px + var(--sab));
      right: 20px;
      z-index: 105;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .fab-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.55);
      backdrop-filter: blur(4px);
      z-index: 104;
    }

    .fab-main-btn {
      position: relative;
      z-index: 106;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--alic-color-gold-gradient);
      color: #2b0b10;
      border: none;
      box-shadow: var(--alic-shadow-gold-glow), 0 6px 20px rgba(0, 0, 0, 0.4);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);

      .fab-icon {
        font-size: 32px;
        font-weight: 700;
        transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }
    }

    .open .fab-main-btn .fab-icon {
      transform: rotate(90deg);
    }

    .fab-menu {
      position: absolute;
      bottom: 68px;
      right: 0;
      z-index: 106;
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: flex-end;
    }

    .fab-action-item {
      display: flex;
      align-items: center;
      gap: 10px;
      background: none;
      border: none;
      cursor: pointer;
      outline: none;

      .action-label {
        background: rgba(28, 12, 16, 0.9);
        color: #ebd9b6;
        padding: 6px 12px;
        border-radius: var(--alic-radius-md);
        font-size: 13px;
        font-weight: 600;
        border: 1px solid rgba(216, 184, 126, 0.3);
        box-shadow: var(--alic-shadow-sm);
        white-space: nowrap;
      }

      .action-icon-circle {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        box-shadow: var(--alic-shadow-md);

        span { font-size: 22px; }
      }
    }
  `],
})
export class FabButtonComponent {
  readonly fabRegistry = inject(FabActionRegistryService);
  private readonly haptics = inject(HapticsService);

  readonly isOpen = signal<boolean>(false);

  toggleMenu(): void {
    this.haptics.impactLight();
    this.isOpen.update((v) => !v);
  }

  executeAction(action: FabAction): void {
    this.haptics.impactMedium();
    this.isOpen.set(false);
    action.execute();
  }
}
