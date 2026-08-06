import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NetworkService } from '../../../core/platform/network.service';

@Component({
  selector: 'app-offline-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (!networkService.isOnline()) {
      <div class="offline-banner animate-fade-in">
        <span class="material-symbols-rounded icon">wifi_off</span>
        <span class="text">Modo Offline — Suas alterações serão sincronizadas quando a conexão voltar.</span>
      </div>
    }
  `,
  styles: [`
    .offline-banner {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 9999;
      background: linear-gradient(90deg, #4a121a 0%, #922638 100%);
      color: #ebd9b6;
      border-bottom: 1px solid rgba(216, 184, 126, 0.4);
      padding: 8px 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      font-size: 12px;
      font-weight: 600;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);

      .icon {
        font-size: 18px;
        color: #d8b87e;
      }
    }
  `],
})
export class OfflineBannerComponent {
  readonly networkService = inject(NetworkService);
}
