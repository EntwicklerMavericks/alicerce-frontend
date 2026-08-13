import { Component, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayService } from '../../../core/services/overlay.service';
import { HapticsService } from '../../../core/platform/haptics.service';

@Component({
  selector: 'app-bottom-sheet',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (overlayService.activeOverlay()?.type === 'bottom-sheet') {
      <div
        class="sheet-backdrop animate-fade-in"
        [style.opacity]="backdropOpacity()"
        (click)="close()"
      ></div>

      <div
        class="bottom-sheet-container animate-slide-up"
        [class.dragging]="isDragging()"
        [style.transform]="dragY() > 0 ? 'translateY(' + dragY() + 'px)' : 'none'"
        (touchstart)="onTouchStart($event)"
        (touchmove)="onTouchMove($event)"
        (touchend)="onTouchEnd()"
        (mousedown)="onMouseDown($event)"
      >
        <div class="drag-handle-wrapper" (click)="onHandleClick()">
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
      transition: opacity 0.15s linear;
    }

    .bottom-sheet-container {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 201;
      max-height: 85vh;
      background: var(--alic-color-vinho-deep, #18070A);
      border-top-left-radius: 28px;
      border-top-right-radius: 28px;
      border-top: 1px solid rgba(216, 184, 126, 0.35);
      box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.7);
      padding: 12px 20px calc(20px + var(--sab)) 20px;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      overflow-x: hidden;
      box-sizing: border-box;
      width: 100%;
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      user-select: none;

      &.dragging {
        transition: none;
      }
    }

    .drag-handle-wrapper {
      width: 100%;
      display: flex;
      justify-content: center;
      padding: 8px 0 14px 0;
      cursor: grab;
      flex-shrink: 0;

      &:active {
        cursor: grabbing;
      }
    }

    .drag-handle {
      width: 44px;
      height: 5px;
      border-radius: 99px;
      background: rgba(216, 184, 126, 0.6);
      box-shadow: 0 0 8px rgba(216, 184, 126, 0.4);
    }

    .sheet-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      flex-shrink: 0;
      cursor: grab;

      &:active {
        cursor: grabbing;
      }
    }

    .sheet-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--alic-color-gold-light, #ebd9b6);
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
      overflow-x: hidden;
      width: 100%;
      box-sizing: border-box;
    }
  `],
})
export class BottomSheetComponent {
  readonly overlayService = inject(OverlayService);
  private readonly haptics = inject(HapticsService);

  readonly dragY = signal<number>(0);
  readonly isDragging = signal<boolean>(false);

  private startY = 0;
  private isPointerDown = false;

  readonly backdropOpacity = computed(() => {
    const drag = this.dragY();
    if (drag <= 0) return 1;
    return Math.max(0.1, 1 - drag / 300);
  });

  onTouchStart(event: TouchEvent): void {
    if (event.touches.length > 0) {
      this.startDrag(event.touches[0].clientY, event.target as HTMLElement);
    }
  }

  onTouchMove(event: TouchEvent): void {
    if (this.isPointerDown && event.touches.length > 0) {
      this.moveDrag(event.touches[0].clientY, event);
    }
  }

  onTouchEnd(): void {
    this.endDrag();
  }

  onMouseDown(event: MouseEvent): void {
    if (event.button === 0) {
      this.startDrag(event.clientY, event.target as HTMLElement);
    }
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.isPointerDown) {
      this.moveDrag(event.clientY, event);
    }
  }

  @HostListener('window:mouseup')
  onMouseUp(): void {
    if (this.isPointerDown) {
      this.endDrag();
    }
  }

  onHandleClick(): void {
    if (!this.isDragging()) {
      this.close();
    }
  }

  close(): void {
    this.haptics.impactLight();
    this.overlayService.close(undefined);
  }

  private startDrag(clientY: number, target: HTMLElement): void {
    const sheetBody = document.querySelector('.sheet-body');
    const isAtTop = !sheetBody || sheetBody.scrollTop <= 0;
    const isHeaderOrHandle = !!(
      target.closest('.drag-handle-wrapper') ||
      target.closest('.drag-handle') ||
      target.closest('.sheet-header')
    );

    // Permitir início do drag no handle, header ou quando no topo da pagina
    if (isHeaderOrHandle || isAtTop) {
      this.isPointerDown = true;
      this.startY = clientY;
      this.dragY.set(0);
    }
  }

  private moveDrag(clientY: number, event: Event): void {
    if (!this.isPointerDown) return;
    const deltaY = clientY - this.startY;

    if (deltaY > 5) {
      this.isDragging.set(true);
      this.dragY.set(deltaY);
      if (event.cancelable) {
        event.preventDefault();
      }
    } else if (deltaY < -10 && !this.isDragging()) {
      this.isPointerDown = false;
      this.dragY.set(0);
    }
  }

  private endDrag(): void {
    if (!this.isPointerDown && !this.isDragging()) return;

    const currentDrag = this.dragY();
    if (currentDrag > 50) {
      this.close();
    }

    this.isPointerDown = false;
    this.isDragging.set(false);
    this.dragY.set(0);
  }
}
