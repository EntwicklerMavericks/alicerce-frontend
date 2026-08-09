import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { OverlayService } from '../../../core/services/overlay.service';
import { HapticsService } from '../../../core/platform/haptics.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ItemWishlist } from '../../../core/models/wishlist.models';

@Component({
  selector: 'app-modal-quebra-desafio',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, ButtonComponent],
  template: `
    <div class="quebra-modal-container">
      <div class="warning-header">
        <div class="alert-icon-ring">
          <span class="material-symbols-rounded alert-icon">warning_amber</span>
        </div>
        <h2 class="modal-title">Atenção: Quebra de Desafio de Impulso!</h2>
        <p class="modal-subtitle">Você está prestes a comprar um item que ainda está em período de reflexão.</p>
      </div>

      @if (item) {
        <div class="item-summary-card">
          <div class="item-thumb-box">
            @if (item.imagemUrl) {
              <img [src]="item.imagemUrl" [alt]="item.nome" class="item-thumb" />
            } @else {
              <span class="material-symbols-rounded placeholder-icon">shopping_bag</span>
            }
          </div>
          <div class="item-details">
            <h3 class="item-name">{{ item.nome }}</h3>
            <span class="item-price">{{ item.precoEstimado | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
          </div>
        </div>

        <div class="cooldown-warning-box">
          <span class="material-symbols-rounded clock-icon">timer</span>
          <div class="warning-text">
            <strong>Faltam {{ item.diasRestantesEsfriamento || 1 }} dia(s) para o fim do esfriamento!</strong>
            <p>O consumo consciente recomenda aguardar o tempo total de {{ item.diasEsfriamento }} dias para garantir que esta compra é realmente essencial.</p>
          </div>
        </div>
      }

      <div class="actions-group">
        <app-button
          variant="secondary-glass"
          size="lg"
          icon="hourglass_top"
          (btnClick)="manterEsfriamento()">
          Resistir & Aguardar Esfriamento
        </app-button>

        <button
          type="button"
          class="btn-break-challenge"
          (click)="confirmarQuebra()">
          <span class="material-symbols-rounded">gavel</span>
          Assumir Risco e Comprar Agora
        </button>
      </div>
    </div>
  `,
  styles: [`
    .quebra-modal-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-bottom: 12px;
      text-align: center;
    }

    .warning-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .alert-icon-ring {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: rgba(244, 67, 54, 0.15);
      border: 2px solid rgba(244, 67, 54, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 20px rgba(244, 67, 54, 0.2);
    }

    .alert-icon {
      font-size: 32px;
      color: #f44336;
    }

    .modal-title {
      font-size: 18px;
      font-weight: 800;
      color: #f44336;
      margin: 0;
    }

    .modal-subtitle {
      font-size: 13px;
      color: rgba(235, 217, 182, 0.7);
      margin: 0;
      max-width: 320px;
    }

    .item-summary-card {
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(216, 184, 126, 0.2);
      border-radius: 14px;
      padding: 12px;
      text-align: left;
    }

    .item-thumb-box {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      background: rgba(0, 0, 0, 0.3);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .item-thumb {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .placeholder-icon {
      font-size: 24px;
      color: var(--alic-color-gold-main);
    }

    .item-name {
      font-size: 14px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }

    .item-price {
      font-size: 14px;
      font-weight: 800;
      color: var(--alic-color-gold-light);
    }

    .cooldown-warning-box {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      background: rgba(244, 67, 54, 0.08);
      border: 1px dashed rgba(244, 67, 54, 0.35);
      border-radius: 12px;
      padding: 12px;
      text-align: left;
    }

    .clock-icon {
      font-size: 22px;
      color: #f44336;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .warning-text {
      display: flex;
      flex-direction: column;
      gap: 4px;

      strong {
        font-size: 13px;
        color: #f44336;
      }

      p {
        font-size: 11px;
        color: rgba(235, 217, 182, 0.7);
        margin: 0;
        line-height: 1.4;
      }
    }

    .actions-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 6px;
    }

    .btn-break-challenge {
      background: rgba(244, 67, 54, 0.15);
      border: 1px solid rgba(244, 67, 54, 0.4);
      color: #f44336;
      border-radius: 14px;
      padding: 12px 16px;
      font-size: 13px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(244, 67, 54, 0.25);
      }

      span {
        font-size: 18px;
      }
    }
  `],
})
export class ModalQuebraDesafioComponent implements OnInit {
  private readonly overlayService = inject(OverlayService);
  private readonly haptics = inject(HapticsService);

  item: ItemWishlist | null = null;

  ngOnInit(): void {
    const data = this.overlayService.activeOverlay()?.data as { item?: ItemWishlist } | undefined;
    if (data?.item) {
      this.item = data.item;
    }
  }

  manterEsfriamento(): void {
    this.haptics.impactLight();
    this.overlayService.close({ confirm: false });
  }

  confirmarQuebra(): void {
    this.haptics.impactMedium();
    this.overlayService.close({ confirm: true });
  }
}
