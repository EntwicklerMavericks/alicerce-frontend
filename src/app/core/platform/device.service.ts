import { Injectable } from '@angular/core';
import { Device, DeviceInfo, BatteryInfo } from '@capacitor/device';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  private readonly isNative = Capacitor.isNativePlatform();

  async getInfo(): Promise<Partial<DeviceInfo>> {
    if (this.isNative) {
      return Device.getInfo();
    }
    return {
      platform: 'web',
      operatingSystem: navigator.platform.includes('Mac') ? 'mac' : 'windows',
      model: 'Browser',
      manufacturer: 'Web Client',
    };
  }

  async getBatteryInfo(): Promise<Partial<BatteryInfo>> {
    if (this.isNative) {
      return Device.getBatteryInfo();
    }
    return { batteryLevel: 1, isCharging: true };
  }

  async getLanguageCode(): Promise<string> {
    if (this.isNative) {
      const info = await Device.getLanguageCode();
      return info.value;
    }
    return navigator.language || 'pt-BR';
  }
}
