import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayService } from '../../../core/services/overlay.service';
import { HapticsService } from '../../../core/platform/haptics.service';

@Component({
  selector: 'app-bottom-sheet',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (overlayService.activeOverlay()?.type === 'bottom-sheet') {
      <div class="sheet-backdrop animate-fade-in" (click)="close()"></div>

      <div class="bottom-sheet-container animate-slide-up">
        <div class="drag-handle-wrapper" (click)="close()">
          <div class="drag-handle"></div>
        </div>

        @if (overlayService.activeOverlay()?.title) {
          <div class="sheet-header">
            <h3 class="sheet-title">{{ overlayService.activeOverlay()?.title }}</h3>
            <button class="close-btn" (click)="close()">
              <span class="material-symbols-rounded">close</span>
            </button>
          </div>
        }

        <div class="sheet-body">
          <ng-container *ngComponentOutlet="overlayService.activeOverlay()!.component"></ng-container>
        </div>
      </div>
    }
  `,
  styles: [`
    .sheet-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(6px);
      z-index: 200;
    }

    .bottom-sheet-container {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 201;
      max-height: 85vh;
      background: var(--alic-color-vinho-deep);
      border-top-left-radius: 28px;
      border-top-right-radius: 28px;
      border-top: 1px solid rgba(216, 184, 126, 0.35);
      box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.7);
      padding: 12px 20px calc(20px + var(--sab)) 20px;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
    }

    .drag-handle-wrapper {
      width: 100%;
      display: flex;
      justify-content: center;
      padding: 8px 0 14px 0;
      cursor: pointer;
    }

    .drag-handle {
      width: 40px;
      height: 4px;
      border-radius: 2px;
      background: rgba(216, 184, 126, 0.4);
    }

    .sheet-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .sheet-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--alic-color-gold-light);
      margin: 0;
    }

    .close-btn {
      background: none;
      border: none;
      color: rgba(235, 217, 182, 0.7);
      cursor: pointer;
      padding: 4px;
      span { font-size: 24px; }
    }

    .sheet-body {
      flex: 1;
      overflow-y: auto;
    }
  `],
})
export class BottomSheetComponent {
  readonly overlayService = inject(OverlayService);
  private readonly haptics = inject(HapticsService);

  close(): void {
    this.haptics.impactLight();
    this.overlayService.close(undefined);
  }
}
