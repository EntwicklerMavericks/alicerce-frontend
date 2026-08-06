import { Injectable, Type, signal } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface OverlayConfig<T = any, D = unknown> {
  component: Type<T>;
  data?: D;
  title?: string;
}

export interface ActiveOverlay<R = unknown> {
  id: string;
  type: 'bottom-sheet' | 'dialog';
  component: Type<any>;
  data?: unknown;
  title?: string;
  resultSubject: Subject<R | undefined>;
}

@Injectable({
  providedIn: 'root',
})
export class OverlayService {
  readonly activeOverlay = signal<ActiveOverlay<any> | null>(null);

  openBottomSheet<T, D = unknown, R = unknown>(config: OverlayConfig<T, D>): Observable<R | undefined> {
    this.closeAll();

    const resultSubject = new Subject<R | undefined>();
    const overlay: ActiveOverlay<R> = {
      id: `overlay-${Date.now()}`,
      type: 'bottom-sheet',
      component: config.component,
      data: config.data,
      title: config.title,
      resultSubject,
    };

    this.activeOverlay.set(overlay);
    return resultSubject.asObservable();
  }

  close<R = unknown>(result?: R): void {
    const current = this.activeOverlay();
    if (current) {
      current.resultSubject.next(result);
      current.resultSubject.complete();
      this.activeOverlay.set(null);
    }
  }

  closeAll(): void {
    this.close(undefined);
  }
}
