import { Injectable } from '@angular/core';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class ShareService {
  private readonly isNative = Capacitor.isNativePlatform();

  async share(title: string, text: string, url?: string): Promise<void> {
    if (this.isNative) {
      await Share.share({
        title,
        text,
        url,
        dialogTitle: title,
      });
      return;
    }

    if (navigator.share) {
      await navigator.share({ title, text, url });
    } else if (url) {
      await navigator.clipboard.writeText(url);
    }
  }
}
