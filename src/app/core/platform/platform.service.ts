import { Injectable, signal, NgZone, inject } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class PlatformService {
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);

  readonly platform = signal<'web' | 'android' | 'ios'>(this.detectPlatform());
  readonly isNative = signal<boolean>(Capacitor.isNativePlatform());
  readonly isPWA = signal<boolean>(this.detectPWA());

  constructor() {
    this.initNativeFeatures();
  }

  isAndroid(): boolean {
    return this.platform() === 'android';
  }

  isIOS(): boolean {
    return this.platform() === 'ios';
  }

  isWeb(): boolean {
    return this.platform() === 'web';
  }

  private detectPlatform(): 'web' | 'android' | 'ios' {
    const nativePlatform = Capacitor.getPlatform();
    if (nativePlatform === 'android') return 'android';
    if (nativePlatform === 'ios') return 'ios';
    return 'web';
  }

  private detectPWA(): boolean {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );
  }

  private async initNativeFeatures(): Promise<void> {
    if (!this.isNative()) return;

    try {
      // 1. Configurar Status Bar
      await StatusBar.setStyle({ style: Style.Dark });
      if (this.isAndroid()) {
        await StatusBar.setBackgroundColor({ color: '#18070a' });
      }

      // 2. Esconder Splash Screen suavemente
      await SplashScreen.hide();

      // 3. Configurar Teclado
      Keyboard.setAccessoryBarVisible({ isVisible: true });

      // 4. Escutar Ciclo de Vida e Back Button
      App.addListener('appStateChange', (state) => {
        console.log('[PlatformService] App state changed:', state.isActive ? 'active' : 'background');
      });

      App.addListener('backButton', () => {
        this.ngZone.run(() => {
          if (window.history.length > 1) {
            window.history.back();
          } else {
            App.exitApp();
          }
        });
      });

      // 5. Escutar Deep Links (alicerce:// ou https://app.alicerce.com/...)
      App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
        this.ngZone.run(() => {
          const url = new URL(event.url);
          const path = url.pathname + url.search;
          if (path) {
            this.router.navigateByUrl(path);
          }
        });
      });

    } catch (err) {
      console.warn('[PlatformService] Erro ao inicializar recursos nativos:', err);
    }
  }
}
