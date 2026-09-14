import { Component, OnInit, OnDestroy, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CartoesStore } from '../store/cartoes.store';
import { OverlayService } from '../../../core/services/overlay.service';
import { HapticsService } from '../../../core/platform/haptics.service';
import { FormularioCartaoComponent } from '../components/formulario-cartao.component';
import { FormularioCompraCartaoComponent } from '../components/formulario-compra-cartao.component';
import { PagamentoFaturaComponent } from '../components/pagamento-fatura.component';
import { CartaoCredito, FaturaCartao } from '../../../core/models/cartao.models';

@Component({
  selector: 'app-cartoes-page',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div class="cartoes-container">
      <!-- Top Hero Banner: Limites Gerais & Ações -->
      <section class="hero-banner">
        <div class="hero-top-row">
          <div class="hero-title-group">
            <span class="hero-badge">CRÉDITO CONSOLIDADO</span>
            <h1 class="hero-title">Cartões & Faturas</h1>
          </div>

          <div class="hero-actions">
            <app-button variant="primary-gold" size="sm" icon="add" (btnClick)="abrirNovoCartao()">
              + Cartão
            </app-button>
            <app-button variant="secondary-glass" size="sm" icon="shopping_cart" (btnClick)="abrirNovaCompra()">
              + Compra
            </app-button>
          </div>
        </div>

        <!-- 3 KPIs compactos alinhados em grid horizontal -->
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
            <span class="kpi-label">Disponível</span>
            <span class="kpi-value">R$ {{ cartoesStore.limiteDisponivelGeral() | number:'1.2-2' }}</span>
          </div>
        </div>

        <!-- Barra de Progresso de Utilização do Limite -->
        <div class="limit-progress-box">
          <div class="limit-progress-bar">
            <div class="limit-progress-fill" [style.width.%]="percentualComprometido()"></div>
          </div>
          <div class="limit-progress-meta">
            <span class="meta-used">{{ percentualComprometido() }}% do limite em uso</span>
            <span class="meta-free">{{ 100 - percentualComprometido() }}% disponível</span>
          </div>
        </div>
      </section>

      <!-- Carrossel de Cartões Físicos / Seleção -->
      <section class="section-cards">
        <div class="section-header-row">
          <div class="section-title-wrap">
            <h2 class="section-title">Seus Cartões</h2>
            <span class="cards-count-pill">{{ cartoesStore.cartoes().length }}</span>
          </div>
          <span class="hint-text">
            <span class="material-symbols-rounded hint-icon">touch_app</span>
            Toque para virar
          </span>
        </div>

        @if (cartoesStore.cartoes().length === 0) {
          <div class="empty-state">
            <span class="material-symbols-rounded">credit_card_off</span>
            <p>Nenhum cartão cadastrado. Adicione um novo cartão de crédito para gerenciar parcelas e faturas.</p>
          </div>
        } @else {
          <div class="cards-carousel" #carouselRef (scroll)="onCarouselScroll()">
            @for (cartao of cartoesStore.cartoes(); track cartao.id; let idx = $index) {
              <div class="card-3d-wrapper" (click)="onCardWrapperClick(cartao, idx, $event)">
                <div
                  class="credit-card-item"
                  [class.selected]="cartoesStore.cartaoSelecionado()?.id === cartao.id"
                  [class.is-flipped]="flippedCardId() === cartao.id">

                  <!-- FRENTE DO CARTÃO -->
                  <div class="card-face card-front" [style.background]="cartao.cor || '#820ad1'">
                    <div class="card-front-overlay"></div>
                    <div class="card-chip-row">
                      <div class="brand-chip">
                        <span class="card-brand">{{ cartao.bandeira }}</span>
                        <div class="chip-graphic">
                          <div class="chip-line horizontal"></div>
                          <div class="chip-line vertical"></div>
                        </div>
                      </div>
                      <div class="card-top-icons">
                        <span class="material-symbols-rounded icon-wifi">contactless</span>
                        <span class="material-symbols-rounded icon-flip" title="Virar cartão (Editar)">3d_rotation</span>
                      </div>
                    </div>

                    <div class="card-center">
                      <div class="card-name">{{ cartao.nome }}</div>
                      <div class="card-digits">•••• •••• •••• {{ cartao.ultimosDigitos || '4321' }}</div>
                    </div>

                    <div class="card-footer">
                      <div class="card-meta">
                        <span>Fecha dia {{ cartao.diaFechamento }}</span>
                        <span>Vence dia {{ cartao.diaVencimento }}</span>
                      </div>
                      <div class="card-limit">
                        <span class="limit-label">Disponível</span>
                        <span class="limit-val">R$ {{ cartao.limiteDisponivel | number:'1.2-2' }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- VERSO DO CARTÃO -->
                  <div class="card-face card-back" [style.background]="cartao.cor ? getDarkerColor(cartao.cor) : '#4a0772'">
                    <div class="mag-stripe"></div>
                    
                    <div class="back-body">
                      <div class="sig-strip">
                        <span class="sig-label">CVV</span>
                        <span class="sig-cvv">***</span>
                      </div>

                      <div class="back-actions">
                        <button class="back-btn btn-edit" (click)="editarCartao(cartao, $event)">
                          <span class="material-symbols-rounded">edit</span>
                          Editar
                        </button>
                        
                        <button class="back-btn btn-unflip" (click)="unflipCard($event)">
                          <span class="material-symbols-rounded">flip</span>
                          Frente
                        </button>

                        <button class="back-btn btn-delete" (click)="removerCartao(cartao, $event)" title="Excluir Cartão">
                          <span class="material-symbols-rounded">delete</span>
                        </button>
                      </div>
                    </div>

                    <div class="back-footer">
                      <span>ALICERCE CREDIT SYSTEM • ENCRYPTED</span>
                    </div>
                  </div>

                </div>
              </div>
            }
          </div>

          @if (cartoesStore.cartoes().length > 1) {
            <div class="carousel-dots">
              @for (cartao of cartoesStore.cartoes(); track cartao.id; let idx = $index) {
                <button
                  type="button"
                  class="carousel-dot"
                  [class.active]="activeIndex() === idx"
                  (click)="scrollToCardIndex(idx); selecionarCartao(cartao)"
                  [title]="cartao.nome">
                </button>
              }
            </div>
          }
        }
      </section>

      <!-- Faturas do Cartão Selecionado -->
      @if (cartoesStore.cartaoSelecionado()) {
        <section class="section-faturas">
          <div class="section-header-row">
            <h2 class="section-title">Faturas • {{ cartoesStore.cartaoSelecionado()?.nome }} (•••• {{ cartoesStore.cartaoSelecionado()?.ultimosDigitos || '****' }})</h2>
            <span class="hint-text">{{ cartoesStore.faturasDoCartao().length }} fatura(s)</span>
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
                      <span class="period-due">Vencimento: {{ fatura.dataVencimento | date:'dd/MM/yyyy' }}</span>
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
                        (btnClick)="abrirPagamentoFatura(fatura)">
                        Pagar Fatura
                      </app-button>
                    }
                  </div>

                  <!-- Detalhe das Parcelas -->
                  @if (fatura.parcelas && fatura.parcelas.length > 0) {
                    <div class="parcelas-section">
                      <div class="parcelas-header">
                        <span class="material-symbols-rounded icon">shopping_bag</span>
                        <span class="parcelas-title">Compras e Parcelas nesta Fatura:</span>
                        <span class="parcelas-count">({{ fatura.parcelas.length }})</span>
                      </div>
                      <div class="parcelas-list">
                        @for (p of fatura.parcelas; track p.id) {
                          <div class="parcela-item">
                            <div class="parcela-info">
                              <span class="parcela-desc">{{ p.compra?.descricao || 'Compra no Cartão' }}</span>
                              <span class="parcela-num">Parcela {{ p.numero }}/{{ p.compra?.qtdParcelas || '1' }}</span>
                            </div>
                            <span class="parcela-val">R$ {{ p.valor | number:'1.2-2' }}</span>
                          </div>
                        }
                      </div>
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
      padding: 16px 16px calc(140px + var(--sab)) 16px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 600px;
      margin: 0 auto;
      box-sizing: border-box;
      overflow-x: hidden;
      width: 100%;
    }

    /* HERO BANNER REDESIGNED */
    .hero-banner {
      background: linear-gradient(135deg, rgba(32, 10, 16, 0.95) 0%, rgba(18, 5, 8, 0.98) 100%);
      border: 1px solid rgba(216, 184, 126, 0.3);
      border-radius: var(--radius-lg, 16px);
      padding: 18px 16px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    }

    .hero-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;
    }

    .hero-title-group {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .hero-badge {
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 1.5px;
      color: var(--color-champagne-light, #ebd9b6);
      text-transform: uppercase;
      opacity: 0.85;
    }

    .hero-title {
      font-size: 18px;
      font-weight: 800;
      margin: 0;
      color: #ffffff;
      letter-spacing: -0.2px;
    }

    .hero-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* KPI GRID: 3 columns even on mobile */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }

    .kpi-card {
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid rgba(216, 184, 126, 0.15);
      border-radius: var(--radius-md, 10px);
      padding: 10px 8px;
      display: flex;
      flex-direction: column;
      gap: 3px;
      min-width: 0;

      .kpi-label {
        font-size: 9px;
        font-weight: 700;
        color: var(--color-text-secondary, #a08c90);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .kpi-value {
        font-size: 13px;
        font-weight: 800;
        color: #ffffff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-family: var(--alic-font-family-mono, monospace);
      }

      &.highlight-gold .kpi-value {
        color: var(--color-champagne-main, #d8b87e);
      }

      &.highlight-bordo .kpi-value {
        color: #ef5350;
      }
    }

    /* PROGRESS BAR */
    .limit-progress-box {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .limit-progress-bar {
      width: 100%;
      height: 6px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 999px;
      overflow: hidden;
    }

    .limit-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #d8b87e 0%, #ef5350 100%);
      border-radius: 999px;
      transition: width 0.4s ease;
    }

    .limit-progress-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 10px;
      font-weight: 600;

      .meta-used {
        color: #ef5350;
      }

      .meta-free {
        color: var(--color-champagne-main, #d8b87e);
      }
    }

    /* SECTION HEADERS */
    .section-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    .section-title-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .section-title {
      font-size: 15px;
      font-weight: 800;
      color: var(--color-champagne-light, #ebd9b6);
      margin: 0;
    }

    .cards-count-pill {
      font-size: 10px;
      font-weight: 800;
      background: rgba(216, 184, 126, 0.15);
      color: var(--color-champagne-main, #d8b87e);
      padding: 2px 7px;
      border-radius: 999px;
      border: 1px solid rgba(216, 184, 126, 0.3);
    }

    .hint-text {
      font-size: 11px;
      color: var(--color-champagne-main, #d8b87e);
      opacity: 0.85;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 4px;

      .hint-icon {
        font-size: 14px;
      }
    }

    /* CARDS CAROUSEL */
    .cards-carousel {
      display: flex;
      gap: 16px;
      overflow-x: auto;
      padding: 6px 2px 16px 2px;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
      perspective: 1200px;
      scrollbar-width: none;

      &::-webkit-scrollbar {
        display: none;
      }
    }

    .card-3d-wrapper {
      flex: 0 0 100%;
      max-width: 360px;
      width: 100%;
      height: 200px;
      scroll-snap-align: center;
      perspective: 1200px;
      margin: 0 auto;
      box-sizing: border-box;
    }

    .carousel-dots {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      margin-top: -4px;
      margin-bottom: 8px;
    }

    .carousel-dot {
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.2);
      border: none;
      cursor: pointer;
      padding: 0;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);

      &:hover {
        background: rgba(216, 184, 126, 0.5);
      }

      &.active {
        width: 22px;
        background: var(--color-champagne-main, #d8b87e);
        box-shadow: 0 0 8px rgba(216, 184, 126, 0.6);
      }
    }

    .credit-card-item {
      width: 100%;
      height: 100%;
      position: relative;
      transform-style: preserve-3d;
      transition: transform 0.55s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s ease;
      cursor: pointer;
      border-radius: 18px;

      &.selected:not(.is-flipped) {
        box-shadow: 0 0 0 2px var(--color-champagne-main, #d8b87e), 0 10px 28px rgba(216, 184, 126, 0.35);
      }

      &.is-flipped {
        transform: rotateY(180deg) translateY(-4px);
        z-index: 10;
      }
    }

    .card-face {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      border-radius: 18px;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      overflow: hidden;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
      box-sizing: border-box;
      border: 1px solid rgba(255, 255, 255, 0.22);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
      transform: translateZ(0);
    }

    /* FRENTE */
    .card-front {
      padding: 18px 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      color: #ffffff;
      transform: rotateY(0deg);

      .card-front-overlay {
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.18) 0%, transparent 60%),
                    linear-gradient(180deg, rgba(0, 0, 0, 0) 35%, rgba(0, 0, 0, 0.45) 100%);
        pointer-events: none;
      }

      .card-chip-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        z-index: 1;
      }

      .brand-chip {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .card-brand {
        font-weight: 900;
        font-size: 15px;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        color: #ffffff;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
      }

      .chip-graphic {
        width: 36px;
        height: 26px;
        background: linear-gradient(135deg, #ffd700 0%, #c9a74e 50%, #996515 100%);
        border-radius: 5px;
        border: 1px solid rgba(255, 255, 255, 0.6);
        box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.6), 0 2px 4px rgba(0, 0, 0, 0.35);
        position: relative;
        overflow: hidden;

        .chip-line {
          position: absolute;
          background: rgba(0, 0, 0, 0.25);
          &.horizontal { top: 50%; left: 0; right: 0; height: 1px; }
          &.vertical { left: 50%; top: 0; bottom: 0; width: 1px; }
        }
      }

      .card-top-icons {
        display: flex;
        align-items: center;
        gap: 8px;

        .icon-wifi {
          font-size: 22px;
          opacity: 0.95;
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
        }

        .icon-flip {
          font-size: 20px;
          color: var(--color-champagne-light, #ebd9b6);
          opacity: 0.9;
          transition: transform 0.2s ease;
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));

          &:hover {
            transform: rotate(45deg);
            opacity: 1;
          }
        }
      }

      .card-center {
        z-index: 1;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .card-name {
        font-size: 16px;
        font-weight: 800;
        letter-spacing: 0.5px;
        color: #ffffff;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
      }

      .card-digits {
        font-size: 14px;
        font-weight: 700;
        font-family: 'Courier New', Courier, monospace;
        letter-spacing: 2.5px;
        color: rgba(255, 255, 255, 0.95);
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
      }

      .card-footer {
        z-index: 1;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        font-size: 11px;
      }

      .card-meta {
        display: flex;
        flex-direction: column;
        opacity: 0.95;
        font-weight: 700;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
      }

      .card-limit {
        display: flex;
        flex-direction: column;
        align-items: flex-end;

        .limit-label {
          font-size: 9px;
          opacity: 0.85;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
        }

        .limit-val {
          font-size: 13px;
          font-weight: 800;
          color: var(--color-champagne-light, #ebd9b6);
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
        }
      }
    }

    /* VERSO */
    .card-back {
      transform: rotateY(180deg);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      color: #ffffff;
      padding: 0 0 12px 0;

      .mag-stripe {
        width: 100%;
        height: 38px;
        background: #111111;
        margin-top: 14px;
      }

      .back-body {
        padding: 0 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .sig-strip {
        background: rgba(255, 255, 255, 0.9);
        height: 28px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 10px;

        .sig-label {
          font-size: 9px;
          font-weight: 800;
          color: #333333;
        }

        .sig-cvv {
          font-size: 12px;
          font-family: monospace;
          font-weight: 800;
          color: #111111;
          letter-spacing: 2px;
        }
      }

      .back-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .back-btn {
        flex: 1;
        height: 34px;
        border: none;
        border-radius: 8px;
        font-size: 11px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        cursor: pointer;
        transition: transform 0.15s ease, background-color 0.15s ease;

        span {
          font-size: 16px;
        }

        &:active {
          transform: scale(0.95);
        }
      }

      .btn-edit {
        background: var(--color-champagne-main, #d8b87e);
        color: #1a060a;

        &:hover {
          background: var(--color-champagne-light, #ebd9b6);
        }
      }

      .btn-unflip {
        background: rgba(255, 255, 255, 0.15);
        color: #ffffff;

        &:hover {
          background: rgba(255, 255, 255, 0.25);
        }
      }

      .btn-delete {
        flex: 0 0 34px;
        background: rgba(239, 83, 80, 0.2);
        color: #ef5350;
        border: 1px solid rgba(239, 83, 80, 0.4);

        &:hover {
          background: rgba(239, 83, 80, 0.4);
        }
      }

      .back-footer {
        text-align: center;
        font-size: 8px;
        letter-spacing: 1px;
        opacity: 0.5;
        font-weight: 800;
      }
    }

    /* FATURAS SECTION */
    .faturas-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .fatura-card {
      background: rgba(30, 10, 15, 0.7);
      border: 1px solid rgba(216, 184, 126, 0.2);
      border-radius: var(--radius-md, 12px);
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);

      &.paga {
        border-color: rgba(76, 175, 80, 0.35);
        opacity: 0.9;
      }
    }

    .fatura-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .period-title {
        font-size: 15px;
        font-weight: 700;
        color: var(--color-champagne-light, #ebd9b6);
        display: block;
      }

      .period-due {
        font-size: 11px;
        color: var(--color-text-secondary, #a08c90);
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
        color: var(--color-champagne-main, #d8b87e);
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
        color: var(--color-text-secondary, #a08c90);
        display: block;
      }

      .total-amount {
        font-size: 18px;
        font-weight: 800;
        color: #ffffff;
        font-family: var(--alic-font-family-mono, monospace);
      }
    }

    .parcelas-section {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(216, 184, 126, 0.15);
      border-radius: var(--radius-sm, 8px);
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .parcelas-header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 700;
      color: var(--color-champagne-light, #ebd9b6);
      margin-bottom: 2px;

      .icon {
        font-size: 15px;
        color: var(--color-champagne-main, #d8b87e);
      }

      .parcelas-count {
        font-size: 10px;
        opacity: 0.75;
      }
    }

    .parcelas-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .parcela-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 8px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.03);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);

      &:last-child {
        border-bottom: none;
      }
    }

    .parcela-info {
      display: flex;
      flex-direction: column;
      gap: 1px;
      min-width: 0;
    }

    .parcela-desc {
      font-size: 12px;
      font-weight: 600;
      color: #ffffff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .parcela-num {
      font-size: 10px;
      color: var(--color-text-secondary, #a08c90);
    }

    .parcela-val {
      font-size: 12px;
      font-weight: 700;
      color: var(--color-champagne-light, #ebd9b6);
      font-family: var(--alic-font-family-mono, monospace);
      flex-shrink: 0;
      margin-left: 8px;
    }

    .empty-state {
      text-align: center;
      padding: 30px;
      background: rgba(255, 255, 255, 0.02);
      border-radius: var(--radius-md, 12px);
      color: var(--color-text-secondary, #a08c90);

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
export class CartoesPage implements OnInit, OnDestroy {
  @ViewChild('carouselRef') private carouselRef?: ElementRef<HTMLDivElement>;

  readonly flippedCardId = signal<string | null>(null);
  readonly activeIndex = signal<number>(0);

  private scrollDebounceTimer?: any;
  private isProgrammaticScroll = false;

  readonly percentualComprometido = computed(() => {
    const total = this.cartoesStore.limiteTotalGeral();
    if (total <= 0) return 0;
    const comprometido = this.cartoesStore.limiteComprometidoGeral();
    return Math.min(100, Math.round((comprometido / total) * 100));
  });

  constructor(
    readonly cartoesStore: CartoesStore,
    private readonly overlay: OverlayService,
    private readonly haptics: HapticsService,
  ) {}

  ngOnInit(): void {
    this.cartoesStore.carregarCartoes();
  }

  ngOnDestroy(): void {
    clearTimeout(this.scrollDebounceTimer);
  }

  onCarouselScroll(): void {
    if (this.isProgrammaticScroll) return;

    clearTimeout(this.scrollDebounceTimer);
    this.scrollDebounceTimer = setTimeout(() => {
      this.syncActiveCardWithCarouselCenter();
    }, 60);
  }

  syncActiveCardWithCarouselCenter(): void {
    const carousel = this.carouselRef?.nativeElement;
    if (!carousel) return;

    const wrappers = carousel.querySelectorAll<HTMLElement>('.card-3d-wrapper');
    if (!wrappers || wrappers.length === 0) return;

    const carouselRect = carousel.getBoundingClientRect();
    const carouselCenter = carouselRect.left + carouselRect.width / 2;

    let closestIndex = 0;
    let minDistance = Infinity;

    wrappers.forEach((el, index) => {
      const rect = el.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const distance = Math.abs(carouselCenter - cardCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    this.activeIndex.set(closestIndex);
    const cartoes = this.cartoesStore.cartoes();
    const targetCartao = cartoes[closestIndex];
    if (targetCartao && this.cartoesStore.cartaoSelecionado()?.id !== targetCartao.id) {
      this.selecionarCartao(targetCartao);
    }
  }

  scrollToCardIndex(index: number): void {
    const carousel = this.carouselRef?.nativeElement;
    if (!carousel) return;

    const wrappers = carousel.querySelectorAll<HTMLElement>('.card-3d-wrapper');
    const targetEl = wrappers[index];
    if (targetEl) {
      this.isProgrammaticScroll = true;
      this.activeIndex.set(index);
      targetEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      setTimeout(() => {
        this.isProgrammaticScroll = false;
      }, 450);
    }
  }

  onCardWrapperClick(cartao: CartaoCredito, index: number, event: Event): void {
    const target = event.target as HTMLElement;
    if (target.closest('.back-btn')) {
      return;
    }

    // Se o cartão clicado não for o selecionado, rola até ele e o seleciona
    if (this.cartoesStore.cartaoSelecionado()?.id !== cartao.id) {
      this.scrollToCardIndex(index);
      this.selecionarCartao(cartao);
      return;
    }

    // Se já estiver selecionado e centralizado, alterna o flip 3D
    this.toggleFlip(cartao, event);
  }

  selecionarCartao(cartao: CartaoCredito): void {
    if (this.cartoesStore.cartaoSelecionado()?.id === cartao.id) {
      return;
    }
    this.haptics.selectionChanged();
    this.cartoesStore.selecionarCartao(cartao);

    const idx = this.cartoesStore.cartoes().findIndex(c => c.id === cartao.id);
    if (idx !== -1) {
      this.activeIndex.set(idx);
    }
  }

  toggleFlip(cartao: CartaoCredito, event: Event): void {
    const target = event.target as HTMLElement;
    if (target.closest('.back-btn')) {
      return;
    }

    this.selecionarCartao(cartao);

    if (this.flippedCardId() === cartao.id) {
      this.haptics.impactLight();
      this.flippedCardId.set(null);
    } else {
      this.haptics.impactMedium();
      this.flippedCardId.set(cartao.id);
    }
  }

  unflipCard(event: Event): void {
    event.stopPropagation();
    this.haptics.impactLight();
    this.flippedCardId.set(null);
  }

  editarCartao(cartao: CartaoCredito, event: Event): void {
    event.stopPropagation();
    this.haptics.impactLight();
    this.overlay.openBottomSheet({
      component: FormularioCartaoComponent,
      data: { cartao },
    });
  }

  async removerCartao(cartao: CartaoCredito, event: Event): Promise<void> {
    event.stopPropagation();
    this.haptics.impactMedium();
    if (confirm(`Deseja realmente remover o cartão "${cartao.nome}"?`)) {
      this.flippedCardId.set(null);
      await this.cartoesStore.removerCartao(cartao.id);
    }
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

  getDarkerColor(hexColor: string): string {
    if (!hexColor || !hexColor.startsWith('#')) return '#220530';
    let hex = hexColor.substring(1);
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    const r = Math.max(0, parseInt(hex.substring(0, 2), 16) - 50);
    const g = Math.max(0, parseInt(hex.substring(2, 4), 16) - 50);
    const b = Math.max(0, parseInt(hex.substring(4, 6), 16) - 50);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

