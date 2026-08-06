import { Injectable, signal, NgZone, inject } from '@angular/core';
import { Network, ConnectionStatus } from '@capacitor/network';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  private readonly ngZone = inject(NgZone);

  readonly isOnline = signal<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  readonly connectionType = signal<string>('unknown');

  constructor() {
    this.initNetworkListener();
  }

  private async initNetworkListener(): Promise<void> {
    try {
      const status = await Network.getStatus();
      this.atualizarStatus(status);

      Network.addListener('networkStatusChange', (status: ConnectionStatus) => {
        this.ngZone.run(() => {
          this.atualizarStatus(status);
        });
      });
    } catch {
      // Fallback para Web Browsers legados
      if (typeof window !== 'undefined') {
        window.addEventListener('online', () => this.isOnline.set(true));
        window.addEventListener('offline', () => this.isOnline.set(false));
      }
    }
  }

  private atualizarStatus(status: ConnectionStatus): void {
    this.isOnline.set(status.connected);
    this.connectionType.set(status.connectionType);
  }
}
