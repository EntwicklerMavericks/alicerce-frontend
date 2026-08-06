import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly isNative = Capacitor.isNativePlatform();

  async getItem(key: string): Promise<string | null> {
    if (this.isNative) {
      const result = await Preferences.get({ key });
      return result.value;
    }
    return localStorage.getItem(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    if (this.isNative) {
      await Preferences.set({ key, value });
      return;
    }
    localStorage.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    if (this.isNative) {
      await Preferences.remove({ key });
      return;
    }
    localStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    if (this.isNative) {
      await Preferences.clear();
      return;
    }
    localStorage.clear();
  }
}
