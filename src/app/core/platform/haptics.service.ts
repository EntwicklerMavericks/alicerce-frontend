import { Injectable } from '@angular/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class HapticsService {
  private readonly isNative = Capacitor.isNativePlatform();

  async impactLight(): Promise<void> {
    if (this.isNative) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  }

  async impactMedium(): Promise<void> {
    if (this.isNative) {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }
  }

  async notificationSuccess(): Promise<void> {
    if (this.isNative) {
      await Haptics.notification({ type: NotificationType.Success });
    }
  }

  async selectionChanged(): Promise<void> {
    if (this.isNative) {
      await Haptics.selectionChanged();
    }
  }
}
