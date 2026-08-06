import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PermissionsService {
  async requestNotificationPermission(): Promise<boolean> {
    if (typeof Notification !== 'undefined') {
      const result = await Notification.requestPermission();
      return result === 'granted';
    }
    return false;
  }
}
