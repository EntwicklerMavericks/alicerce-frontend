import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CartoesStore } from '../store/cartoes.store';
import { OverlayService } from '../../../core/services/overlay.service';
import { HapticsService } from '../../../core/platform/haptics.service';
import { FormularioCartaoComponent } from '../components/formulario-cartao.component';
import { FormularioCompraCartaoComponent } from '../components/formulario-compra-cartao.component';
import { PagamentoFaturaComponent } from '../components/pagamento-fatura.component';
import { FaturaCartao } from '../../../core/models/cartao.models';

@Component({
  selector: 'app-cartoes-page',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div class="cartoes-container">
      <!-- Top Hero Banner: Limites Gerais -->
      <section class="hero-banner">
        <div class="hero-header">
          <span class="hero-subtitle">Módulos de Crédito</span>
          <h1 class="hero-title">Cartões & Faturas</h1>
        </div>

        <div class="kpi-grid">
          <div class="kpi-card">
            <span class="kpi-label">Limite Total</span>
            <span class="kpi-value">R$ {{ cartoesStore.limiteTotalGeral() | number:'1.2-2' }}</span>
          </div>

          <div class="kpi-card highlight-bordo">
            <span class="kpi-label">Comprometido</span>
            <span class="kpi-value">R$ {{ cartoesStore.limiteComprometidoGeral() | number:'1.2-2' }}</span>
          </div>

          <div class="kpi-card highlight-gold">
            <span class="kpi-label">Disponível Projeção</span>
            <span class="kpi-value">R$ {{ cartoesStore.limiteDisponivelGeral() | number:'1.2-2' }}</span>
          </div>
        </div>

        <div class="hero-actions">
          <app-button variant="primary-gold" icon="add" (click)="abrirNovoCartao()">
            Novo Cartão
          </app-button>
          <app-button variant="secondary-glass" icon="shopping_cart" (click)="abrirNovaCompra()">
            Nova Compra
          </app-button>
        </div>
      </section>

      <!-- Carrossel de Cartões Físicos / Seleção -->
      <section class="section-cards">
        <h2 class="section-title">Seus Cartões</h2>

        @if (cartoesStore.cartoes().length === 0) {
          <div class="empty-state">
            <span class="material-symbols-rounded">credit_card_off</span>
            <p>Nenhum cartão cadastrado. Adicione um novo cartão de crédito para gerenciar parcelas e faturas.</p>
          </div>
        } @else {
          <div class="cards-carousel">
            @for (cartao of cartoesStore.cartoes(); track cartao.id) {
              <div
                class="credit-card-item"
                [class.selected]="cartoesStore.cartaoSelecionado()?.id === cartao.id"
                [style.background]="cartao.cor || '#820ad1'"
                (click)="selecionarCartao(cartao)">
                <div class="card-chip-row">
                  <span class="card-brand">{{ cartao.bandeira }}</span>
                  <span class="material-symbols-rounded">contactless</span>
                </div>
                <div class="card-name">{{ cartao.nome }}</div>
                <div class="card-digits">•••• {{ cartao.ultimosDigitos || '4321' }}</div>
                <div class="card-footer">
                  <div class="card-meta">
                    <span>Fecha dia {{ cartao.diaFechamento }}</span>
                    <span>Vence dia {{ cartao.diaVencimento }}</span>
                  </div>
                  <div class="card-limit">
                    Disp: R$ {{ cartao.limiteDisponivel | number:'1.0-0' }}
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </section>

      <!-- Faturas do Cartão Selecionado -->
      @if (cartoesStore.cartaoSelecionado()) {
        <section class="section-faturas">
          <div class="section-header">
            <h2 class="section-title">Faturas do {{ cartoesStore.cartaoSelecionado()?.nome }}</h2>
          </div>

          @if (cartoesStore.faturasDoCartao().length === 0) {
            <div class="empty-state">
              <span class="material-symbols-rounded">receipt_long</span>
              <p>Nenhuma fatura registrada neste cartão ainda.</p>
            </div>
          } @else {
            <div class="faturas-list">
              @for (fatura of cartoesStore.faturasDoCartao(); track fatura.id) {
                <div class="fatura-card" [class.paga]="fatura.status === 'PAGA'">
                  <div class="fatura-header">
                    <div class="fatura-period">
                      <span class="period-title">Competência {{ fatura.mes | number:'2.0-0' }}/{{ fatura.ano }}</span>
                      <span class="period-due">Vence dia {{ fatura.dataVencimento | date:'dd/MM/yyyy' }}</span>
                    </div>

                    <span class="status-badge" [class]="fatura.status.toLowerCase()">
                      {{ fatura.status }}
                    </span>
                  </div>

                  <div class="fatura-body">
                    <div class="fatura-total">
                      <span class="total-label">Total da Fatura</span>
                      <span class="total-amount">R$ {{ fatura.valorTotal | number:'1.2-2' }}</span>
                    </div>

                    @if (fatura.status === 'ABERTA' || fatura.status === 'FECHADA') {
                      <app-button
                        variant="primary-bordo"
                        size="sm"
                        icon="check_circle"
                        (click)="abrirPagamentoFatura(fatura)">
                        Pagar Fatura
                      </app-button>
                    }
                  </div>

                  <!-- Detalhe das Parcelas -->
                  @if (fatura.parcelas && fatura.parcelas.length > 0) {
                    <div class="parcelas-list">
                      <div class="parcelas-title">Compras e Parcelas nesta Fatura:</div>
                      @for (p of fatura.parcelas; track p.id) {
                        <div class="parcela-item">
                          <span class="parcela-desc">{{ p.compra?.descricao || 'Compra em Cartão' }} ({{ p.numero }}/{{ p.compra?.qtdParcelas || '1' }})</span>
                          <span class="parcela-val">R$ {{ p.valor | number:'1.2-2' }}</span>
                        </div>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          }
        </section>
      }
    </div>
  `,
  styles: [`
    .cartoes-container {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 800px;
      margin: 0 auto;
      box-sizing: border-box;
      overflow-x: hidden;
    }

    .hero-banner {
      background: var(--alic-color-gold-glass);
      border: 1px solid rgba(216, 184, 126, 0.35);
      border-radius: var(--radius-lg);
      padding: 24px 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;

      .hero-subtitle {
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 1.5px;
        color: var(--color-champagne-light);
        text-transform: uppercase;
      }

      .hero-title {
        font-size: 24px;
        font-weight: 800;
        margin: 4px 0 0 0;
        color: #ffffff;
      }
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;

      @media (max-width: 500px) {
        grid-template-columns: 1fr;
      }
    }

    .kpi-card {
      background: rgba(20, 5, 8, 0.6);
      border: 1px solid rgba(216, 184, 126, 0.2);
      border-radius: var(--radius-md);
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;

      .kpi-label {
        font-size: 10px;
        font-weight: 700;
        color: var(--color-text-secondary);
        text-transform: uppercase;
      }

      .kpi-value {
        font-size: 15px;
        font-weight: 800;
        color: #ffffff;
      }

      &.highlight-gold .kpi-value {
        color: var(--color-champagne-main);
      }

      &.highlight-bordo .kpi-value {
        color: #ef5350;
      }
    }

    .hero-actions {
      display: flex;
      gap: 10px;

      @media (max-width: 400px) {
        flex-direction: column;
      }
    }

    .section-title {
      font-size: 16px;
      font-weight: 800;
      color: var(--color-champagne-light);
      margin: 0 0 12px 0;
    }

    .cards-carousel {
      display: flex;
      gap: 14px;
      overflow-x: auto;
      padding-bottom: 8px;
    }

    .credit-card-item {
      min-width: 240px;
      height: 140px;
      border-radius: 16px;
      padding: 16px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      color: #ffffff;
      cursor: pointer;
      border: 2px solid transparent;
      transition: all 0.2s ease;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);

      &.selected {
        border-color: var(--color-champagne-main);
        transform: scale(1.02);
      }

      .card-chip-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-weight: 800;
        font-size: 14px;
        letter-spacing: 1px;
      }

      .card-name {
        font-size: 16px;
        font-weight: 700;
      }

      .card-digits {
        font-size: 12px;
        opacity: 0.8;
      }

      .card-footer {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        font-size: 10px;
        opacity: 0.9;
      }

      .card-meta {
        display: flex;
        flex-direction: column;
      }

      .card-limit {
        font-weight: 700;
        font-size: 11px;
      }
    }

    .faturas-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .fatura-card {
      background: rgba(30, 10, 15, 0.7);
      border: 1px solid rgba(216, 184, 126, 0.2);
      border-radius: var(--radius-md);
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;

      &.paga {
        border-color: rgba(76, 175, 80, 0.3);
        opacity: 0.85;
      }
    }

    .fatura-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .period-title {
        font-size: 15px;
        font-weight: 700;
        color: var(--color-champagne-light);
        display: block;
      }

      .period-due {
        font-size: 11px;
        color: var(--color-text-secondary);
      }
    }

    .status-badge {
      font-size: 10px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 9999px;
      text-transform: uppercase;

      &.aberta {
        background: rgba(216, 184, 126, 0.2);
        color: var(--color-champagne-main);
      }

      &.fechada {
        background: rgba(255, 152, 0, 0.2);
        color: #ffb74d;
      }

      &.paga {
        background: rgba(76, 175, 80, 0.2);
        color: #81c784;
      }
    }

    .fatura-body {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px dashed rgba(216, 184, 126, 0.15);
      padding-top: 12px;

      .total-label {
        font-size: 11px;
        color: var(--color-text-secondary);
        display: block;
      }

      .total-amount {
        font-size: 18px;
        font-weight: 800;
        color: #ffffff;
      }
    }

    .parcelas-list {
      background: rgba(0, 0, 0, 0.25);
      border-radius: var(--radius-sm);
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 6px;

      .parcelas-title {
        font-size: 11px;
        font-weight: 700;
        color: var(--color-champagne-light);
        margin-bottom: 4px;
      }

      .parcela-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.85);
      }

      .parcela-val {
        font-weight: 700;
      }
    }

    .empty-state {
      text-align: center;
      padding: 30px;
      background: rgba(255, 255, 255, 0.02);
      border-radius: var(--radius-md);
      color: var(--color-text-secondary);

      span {
        font-size: 40px;
        margin-bottom: 8px;
      }

      p {
        font-size: 13px;
        margin: 0;
      }
    }
  `],
})
export class CartoesPage implements OnInit {
  constructor(
    readonly cartoesStore: CartoesStore,
    private readonly overlay: OverlayService,
    private readonly haptics: HapticsService,
  ) {}

  ngOnInit(): void {
    this.cartoesStore.carregarCartoes();
  }

  selecionarCartao(cartao: any): void {
    this.haptics.selectionChanged();
    this.cartoesStore.selecionarCartao(cartao);
  }

  abrirNovoCartao(): void {
    this.haptics.impactLight();
    this.overlay.openBottomSheet({
      component: FormularioCartaoComponent,
    });
  }

  abrirNovaCompra(): void {
    this.haptics.impactLight();
    this.overlay.openBottomSheet({
      component: FormularioCompraCartaoComponent,
    });
  }

  abrirPagamentoFatura(fatura: FaturaCartao): void {
    this.haptics.impactMedium();
    this.overlay.openBottomSheet({
      component: PagamentoFaturaComponent,
      data: { fatura },
    });
  }
}
