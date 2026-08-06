import { Directive, ElementRef, Output, EventEmitter, HostListener, inject } from '@angular/core';
import { HapticsService } from '../../core/platform/haptics.service';

@Directive({
  selector: '[appPullToRefresh]',
  standalone: true,
})
export class PullToRefreshDirective {
  private readonly el = inject(ElementRef);
  private readonly haptics = inject(HapticsService);

  @Output() refresh = new EventEmitter<void>();

  private startY = 0;
  private currentY = 0;
  private isPulling = false;

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    if (this.el.nativeElement.scrollTop === 0) {
      this.startY = event.touches[0].clientY;
      this.isPulling = true;
    }
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    if (!this.isPulling) return;
    this.currentY = event.touches[0].clientY;
    const diff = this.currentY - this.startY;

    if (diff > 70 && this.el.nativeElement.scrollTop === 0) {
      this.haptics.impactLight();
    }
  }

  @HostListener('touchend')
  onTouchEnd(): void {
    if (!this.isPulling) return;
    const diff = this.currentY - this.startY;

    if (diff > 80 && this.el.nativeElement.scrollTop === 0) {
      this.haptics.notificationSuccess();
      this.refresh.emit();
    }

    this.isPulling = false;
    this.startY = 0;
    this.currentY = 0;
  }
}
