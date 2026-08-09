import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ProjetosStore } from '../store/projetos.store';
import { WishlistStore } from '../../wishlist/store/wishlist.store';
import { MetasStore } from '../../metas/store/metas.store';
import { OverlayService } from '../../../core/services/overlay.service';
import { ToastService } from '../../../core/services/toast.service';
import { HapticsService } from '../../../core/platform/haptics.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { TipoItemProjeto } from '../../../core/models/projeto.models';
import { ItemWishlist } from '../../../core/models/wishlist.models';
import { Meta } from '../../../core/models/meta.models';

@Component({
  selector: 'app-vincular-item-projeto',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, ButtonComponent, BadgeComponent],
  template: `
    <div class="form-sheet-container">
      <div class="sheet-title-box">
        <h2>Vincular Desejo ou Meta à Etapa</h2>
        <p>Conecte uma meta de acúmulo ou item da Wishlist para integrar aos custos e progresso</p>
      </div>

      <!-- Abas de Seleção de Tipo -->
      <div class="tabs-selector">
        <button
          type="button"
          class="tab-btn"
          [class.active]="tipoSelecionado() === 'WISHLIST'"
          (click)="setTipo('WISHLIST')">
          <span class="material-symbols-rounded">shopping_bag</span>
          <span>Desejo (Wishlist)</span>
        </button>

        <button
          type="button"
          class="tab-btn"
          [class.active]="tipoSelecionado() === 'META'"
          (click)="setTipo('META')">
          <span class="material-symbols-rounded">flag</span>
          <span>Meta Financeira</span>
        </button>
      </div>

      <!-- Conteúdo da Aba Wishlist -->
      @if (tipoSelecionado() === 'WISHLIST') {
        <div class="items-list-container">
          @if (wishlistStore.carregando()) {
            <div class="loading-state">
              <span class="spinner"></span>
              <span>Carregando Wishlist...</span>
            </div>
          } @else if (wishlistStore.itens().length === 0) {
            <div class="empty-items">
              <span class="material-symbols-rounded">shopping_bag</span>
              <p>Nenhum item cadastrado na Wishlist.</p>
            </div>
          } @else {
            <div class="cards-list">
              @for (wish of wishlistStore.itens(); track wish.id) {
                <div
                  class="selectable-card"
                  [class.selected]="referenciaIdSelecionada() === wish.id"
                  (click)="selecionarItem('WISHLIST', wish.id, wish)">
                  <div class="card-left">
                    <span class="material-symbols-rounded item-icon">shopping_bag</span>
                    <div class="item-text">
                      <span class="item-title">{{ wish.nome }}</span>
                      <span class="item-price">{{ wish.precoEstimado | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
                    </div>
                  </div>

                  <div class="card-right">
                    <app-badge [variant]="wish.status === 'COMPRADO' ? 'positive' : 'gold'">
                      {{ wish.status }}
                    </app-badge>
                    <span class="material-symbols-rounded radio-icon">
                      {{ referenciaIdSelecionada() === wish.id ? 'radio_button_checked' : 'radio_button_unchecked' }}
                    </span>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- Conteúdo da Aba Metas -->
      @if (tipoSelecionado() === 'META') {
        <div class="items-list-container">
          @if (metasStore.carregando()) {
            <div class="loading-state">
              <span class="spinner"></span>
              <span>Carregando Metas...</span>
            </div>
          } @else if (metasStore.metas().length === 0) {
            <div class="empty-items">
              <span class="material-symbols-rounded">flag</span>
              <p>Nenhuma Meta cadastrada.</p>
            </div>
          } @else {
            <div class="cards-list">
              @for (meta of metasStore.metas(); track meta.id) {
                <div
                  class="selectable-card"
                  [class.selected]="referenciaIdSelecionada() === meta.id"
                  (click)="selecionarItem('META', meta.id, meta)">
                  <div class="card-left">
                    <span class="material-symbols-rounded item-icon" [style.color]="meta.cor || '#C9A74E'">
                      {{ meta.icone || 'flag' }}
                    </span>
                    <div class="item-text">
                      <span class="item-title">{{ meta.nome }}</span>
                      <span class="item-price">
                        {{ meta.valorAtual | currency:'BRL':'symbol':'1.2-2':'pt-BR' }} / {{ meta.valorAlvo | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                      </span>
                    </div>
                  </div>

                  <div class="card-right">
                    <app-badge [variant]="meta.status === 'CONCLUIDA' ? 'positive' : 'gold'">
                      {{ meta.percentualConcluido }}%
                    </app-badge>
                    <span class="material-symbols-rounded radio-icon">
                      {{ referenciaIdSelecionada() === meta.id ? 'radio_button_checked' : 'radio_button_unchecked' }}
                    </span>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- Ação de Confirmação -->
      <app-button
        variant="primary-gold"
        size="lg"
        [disabled]="!referenciaIdSelecionada() || projetosStore.carregando()"
        [loading]="projetosStore.carregando()"
        (btnClick)="confirmarVinculo()">
        Vincular Item à Etapa
      </app-button>
    </div>
  `,
  styles: [`
    .form-sheet-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-bottom: 12px;
    }

    .sheet-title-box {
      h2 { font-size: 18px; font-weight: 700; margin: 0; color: #ebd9b6; }
      p { font-size: 12px; color: rgba(235, 217, 182, 0.6); margin: 2px 0 0 0; }
    }

    .tabs-selector {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      background: rgba(255, 255, 255, 0.04);
      padding: 4px;
      border-radius: 12px;
      border: 1px solid rgba(216, 184, 126, 0.15);
    }

    .tab-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 10px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: rgba(235, 217, 182, 0.6);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;

      span { font-size: 18px; }

      &.active {
        background: var(--alic-color-gold-gradient, linear-gradient(135deg, #d8b87e 0%, #c19b56 100%));
        color: #2b0b10;
        font-weight: 700;
        box-shadow: 0 0 10px rgba(216, 184, 126, 0.3);
      }
    }

    .items-list-container {
      max-height: 280px;
      overflow-y: auto;
    }

    .cards-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .selectable-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 14px;
      background: rgba(31, 26, 27, 0.6);
      border: 1px solid rgba(216, 184, 126, 0.2);
      border-radius: 14px;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(216, 184, 126, 0.1);
      }

      &.selected {
        border-color: #d8b87e;
        background: rgba(216, 184, 126, 0.15);
        box-shadow: 0 0 10px rgba(216, 184, 126, 0.25);
      }
    }

    .card-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .item-icon {
      font-size: 22px;
      color: var(--alic-color-gold-main, #d8b87e);
    }

    .item-text {
      display: flex;
      flex-direction: column;
    }

    .item-title {
      font-size: 14px;
      font-weight: 700;
      color: #ffffff;
    }

    .item-price {
      font-size: 12px;
      color: rgba(235, 217, 182, 0.7);
    }

    .card-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .radio-icon {
      font-size: 20px;
      color: var(--alic-color-gold-main, #d8b87e);
    }

    .empty-items {
      padding: 24px;
      text-align: center;
      color: rgba(235, 217, 182, 0.5);
      span { font-size: 32px; display: block; margin-bottom: 8px; }
      p { margin: 0; font-size: 13px; }
    }

    .loading-state {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 24px;
      color: var(--alic-color-gold-light);
      font-size: 13px;

      .spinner {
        width: 18px;
        height: 18px;
        border: 2px solid currentColor;
        border-right-color: transparent;
        border-radius: 50%;
        animation: spin 0.75s linear infinite;
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `],
})
export class VincularItemProjetoComponent implements OnInit {
  readonly projetosStore = inject(ProjetosStore);
  readonly wishlistStore = inject(WishlistStore);
  readonly metasStore = inject(MetasStore);

  private readonly overlayService = inject(OverlayService);
  private readonly toastService = inject(ToastService);
  private readonly haptics = inject(HapticsService);

  projetoId = '';
  etapaId = '';

  readonly tipoSelecionado = signal<TipoItemProjeto>('WISHLIST');
  readonly referenciaIdSelecionada = signal<string>('');
  objetoSelecionado: any = null;

  ngOnInit(): void {
    const data = this.overlayService.activeOverlay()?.data as
      | { projetoId: string; etapaId: string }
      | undefined;

    if (data?.projetoId && data?.etapaId) {
      this.projetoId = data.projetoId;
      this.etapaId = data.etapaId;
    }

    this.wishlistStore.carregarWishlist();
    this.metasStore.carregarMetas();
  }

  setTipo(tipo: TipoItemProjeto): void {
    this.haptics.impactLight();
    this.tipoSelecionado.set(tipo);
    this.referenciaIdSelecionada.set('');
    this.objetoSelecionado = null;
  }

  selecionarItem(tipo: TipoItemProjeto, id: string, obj: any): void {
    this.haptics.impactLight();
    this.referenciaIdSelecionada.set(id);
    this.objetoSelecionado = obj;
  }

  async confirmarVinculo(): Promise<void> {
    const refId = this.referenciaIdSelecionada();
    if (!refId || !this.projetoId || !this.etapaId) return;

    this.haptics.impactMedium();
    const ok = await this.projetosStore.vincularItemEtapa(
      this.projetoId,
      this.etapaId,
      {
        tipo: this.tipoSelecionado(),
        referenciaId: refId,
        etapaId: this.etapaId,
      },
      this.objetoSelecionado
    );

    if (ok) {
      this.toastService.showSuccess('Item vinculado à etapa com sucesso!');
      this.overlayService.close({ saved: true });
    }
  }
}
