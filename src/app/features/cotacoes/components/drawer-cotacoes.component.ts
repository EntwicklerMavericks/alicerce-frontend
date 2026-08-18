import { Component, inject, OnInit, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexStroke,
  ApexTooltip,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexLegend,
  ApexPlotOptions,
} from 'ng-apexcharts';
import { CotacoesStore } from '../store/cotacoes.store';
import { OverlayService } from '../../../core/services/overlay.service';
import { ToastService } from '../../../core/services/toast.service';
import { HapticsService } from '../../../core/platform/haptics.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { FormularioCotacaoAvulsaComponent } from './formulario-cotacao-avulsa.component';
import { CotacaoAvulsa, MelhorOferta } from '../../../core/models/cotacao.models';
import { ItemWishlist } from '../../../core/models/wishlist.models';
import { Produto } from '../../../core/models/produto.models';

export type CotacoesChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke?: ApexStroke;
  tooltip?: ApexTooltip;
  dataLabels?: ApexDataLabels;
  fill?: ApexFill;
  grid?: ApexGrid;
  colors?: string[];
  legend?: ApexLegend;
  plotOptions?: ApexPlotOptions;
};

@Component({
  selector: 'app-drawer-cotacoes',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    NgApexchartsModule,
    ButtonComponent,
  ],
  template: `
    <div class="drawer-cotacoes-container animate-fade-in">
      <!-- Mobile Pull Indicator Handle -->
      <div class="mobile-drag-handle"></div>

      <!-- Header do Comparador -->
      <div class="drawer-header">
        <div class="header-main">
          <div class="header-tag">
            <span class="material-symbols-rounded icon">price_check</span>
            <span>COMPARADOR DE PREÇOS</span>
          </div>
          <h2 class="item-title">{{ cotacoesStore.nomeItem() }}</h2>
        </div>

        <div class="target-price-box">
          <span class="target-label">PREÇO ALVO</span>
          @if (cotacoesStore.precoAlvo(); as alvo) {
            <span class="target-val">{{ alvo | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
          } @else {
            <span class="target-val-none">Sem alvo</span>
          }
        </div>
      </div>

      <!-- Barra Fixa de Ações Mobile -->
      <div class="mobile-action-bar">
        <button
          class="mobile-action-pill primary"
          [disabled]="cotacoesStore.carregando()"
          (click)="executarPesquisaMercado()">
          <span class="material-symbols-rounded icon" [class.spin]="cotacoesStore.carregando()">
            {{ cotacoesStore.carregando() ? 'sync' : 'search' }}
          </span>
          <span>{{ cotacoesStore.carregando() ? 'Pesquisando...' : '🔍 Pesquisar Ofertas' }}</span>
        </button>

        <button
          class="mobile-action-pill secondary"
          (click)="abrirFormularioCotacaoAvulsa()">
          <span class="material-symbols-rounded icon">add</span>
          <span>+ Cotação</span>
        </button>
      </div>

      <!-- Status da Coleta Banner Mobile -->
      @if (cotacoesStore.statusColeta(); as status) {
        <div class="status-coleta-banner" [ngClass]="status.toLowerCase()">
          <span class="material-symbols-rounded icon">
            {{ status === 'CONCLUIDA' ? 'check_circle' : status === 'PARCIAL' ? 'warning' : 'info' }}
          </span>
          <span>
            {{ status === 'CONCLUIDA' ? 'Busca concluída nas lojas parceiras!' : status === 'PARCIAL' ? 'Busca parcial concluída.' : 'Nenhuma oferta pública encontrada.' }}
          </span>
        </div>
      }

      <!-- Badge Reluzente: "Oportunidade: Preço Alvo Atingido ✨" -->
      @if (cotacoesStore.alvoAtingido()) {
        <div class="opportunity-banner animate-bounce-in">
          <div class="sparkles-inline">
            <span class="sparkle">✨</span>
            <span class="sparkle">🏆</span>
          </div>
          <div class="opportunity-text">
            <span class="opp-badge">OPORTUNIDADE DE COMPRA</span>
            <strong class="opp-title">Preço Alvo Atingido! ✨</strong>
            <p class="opp-desc">
              Melhor oferta encontrada no mercado é menor ou igual ao seu planejamento!
            </p>
          </div>
        </div>
      }

      <!-- Card de Destaque da "Melhor Oferta do Mercado" -->
      @if (cotacoesStore.melhorOferta(); as melhor) {
        <div class="best-offer-hero-card glass-card">
          <div class="hero-header">
            <span class="hero-badge">
              <span class="material-symbols-rounded">stars</span>
              MELHOR OFERTA DO MERCADO
            </span>

            @if (melhor.isCotacaoAvulsa) {
              <span class="source-tag avulsa">Cotação Avulsa</span>
            } @else {
              <span class="source-tag integrada">Loja Parceira</span>
            }
          </div>

          <div class="hero-body">
            <div class="store-brand-group">
              <div class="store-logo-frame">
                @if (melhor.lojaLogo) {
                  <img [src]="melhor.lojaLogo" [alt]="melhor.lojaNome" class="store-logo-img" />
                } @else {
                  <span class="material-symbols-rounded store-icon">storefront</span>
                }
              </div>

              <div class="store-name-details">
                <h3 class="store-name">{{ melhor.lojaNome }}</h3>
                <span class="offer-date">Verificado em {{ melhor.data | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
            </div>

            <div class="price-action-group">
              <div class="price-value-container">
                <span class="price-symbol">R$</span>
                <span class="big-price">{{ melhor.preco | currency:'BRL':'':'1.2-2':'pt-BR' }}</span>
              </div>

              @if (melhor.url) {
                <a
                  [href]="melhor.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn-go-store"
                  (click)="haptics.impactLight()">
                  <span>Ir para Loja</span>
                  <span class="material-symbols-rounded icon">open_in_new</span>
                </a>
              }
            </div>
          </div>

          <!-- Exibição da Economia Potencial em R$ e % -->
          <div class="hero-footer-economy">
            @if (cotacoesStore.economiaPotencial(); as econ) {
              @if (econ.valor > 0) {
                <div class="economy-box positive">
                  <span class="material-symbols-rounded icon">savings</span>
                  <span>
                    Economia potencial de <strong>{{ econ.valor | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</strong>
                    ({{ econ.percentual }}% de economia frente ao preço alvo!)
                  </span>
                </div>
              } @else {
                <div class="economy-box target-reached">
                  <span class="material-symbols-rounded icon">check_circle</span>
                  <span>Oferta equivalente ao seu preço alvo de planejamento.</span>
                </div>
              }
            } @else {
              <div class="economy-box no-target">
                <span class="material-symbols-rounded icon">help_outline</span>
                <span>Sem preço alvo definido para este item.</span>
              </div>
            }
          </div>
        </div>
      }

      <!-- Gráfico ApexCharts Comparativo -->
      <div class="section-container glass-card">
        <div class="section-header">
          <div class="section-title-group">
            <span class="material-symbols-rounded section-icon">bar_chart</span>
            <div>
              <h3>Comparativo por Lojas & Mercado 📊</h3>
              <p class="subtitle">Valores atualizados encontrados em cada loja</p>
            </div>
          </div>
        </div>

        <div class="chart-wrapper">
          @if (chartOptions().series.length > 0) {
            <apx-chart
              [series]="chartOptions().series"
              [chart]="chartOptions().chart"
              [xaxis]="chartOptions().xaxis"
              [yaxis]="chartOptions().yaxis"
              [stroke]="chartOptions().stroke!"
              [tooltip]="chartOptions().tooltip!"
              [dataLabels]="chartOptions().dataLabels!"
              [plotOptions]="chartOptions().plotOptions!"
              [fill]="chartOptions().fill!"
              [grid]="chartOptions().grid!"
              [colors]="chartOptions().colors!"
              [legend]="chartOptions().legend!">
            </apx-chart>
          } @else {
            <div class="empty-chart">
              <span class="material-symbols-rounded">area_chart</span>
              <p>Nenhum histórico registrado ainda para este item.</p>
            </div>
          }
        </div>
      </div>

      <!-- Seção de Ofertas Encontradas (Mobile List) -->
      <div class="section-container glass-card">
        <div class="section-header">
          <div class="section-title-group">
            <span class="material-symbols-rounded section-icon">loyalty</span>
            <div>
              <h3>Ofertas Encontradas</h3>
              <p class="subtitle">Todas as cotações ativas ordenadas pelo menor preço</p>
            </div>
          </div>
        </div>

        <div class="cotacoes-list">
          @for (cot of cotacoesStore.cotacoesAvulsas(); track cot.id) {
            <div class="cotacao-item-row mobile-card">
              <div class="store-avatar-box">
                <span class="material-symbols-rounded">
                  {{ cot.observacao && cot.observacao.includes('MERCADO_LIVRE') ? 'shopping_cart' : (cot.observacao && cot.observacao.includes('WEB') ? 'language' : 'edit_note') }}
                </span>
              </div>

              <div class="cot-store-info">
                <div class="store-name-line">
                  <strong class="store-name">{{ cot.lojaNome }}</strong>
                  <span class="source-tag" [ngClass]="cot.observacao?.includes('MERCADO_LIVRE') ? 'avulsa' : (cot.observacao?.includes('WEB') ? 'integrada' : 'manual')">
                    {{ cot.observacao?.includes('MERCADO_LIVRE') ? 'ML' : (cot.observacao?.includes('WEB') ? 'Web' : 'Manual') }}
                  </span>
                </div>

                @if (formatarObservacao(cot.observacao); as obsLimpa) {
                  @if (obsLimpa) {
                    <p class="cot-obs">{{ obsLimpa }}</p>
                  }
                }

                <span class="cot-date">Cadastrada em {{ cot.dataCotacao | date:'dd/MM/yyyy' }}</span>
              </div>

              <div class="cot-price-action">
                <span class="cot-price">{{ cot.preco | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>

                <div class="cot-btns">
                  @if (cot.lojaUrl) {
                    <a
                      [href]="cot.lojaUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="icon-link-btn"
                      title="Abrir Link da Loja">
                      <span class="material-symbols-rounded">open_in_new</span>
                    </a>
                  }

                  <button
                    class="icon-delete-btn"
                    (click)="removerCotacao(cot)"
                    title="Excluir Cotação">
                    <span class="material-symbols-rounded">delete</span>
                  </button>
                </div>
              </div>
            </div>
          } @empty {
            <div class="empty-cotacoes">
              <span class="material-symbols-rounded empty-ic">price_change</span>
              <p>Nenhuma cotação de mercado registrada para este desejo.</p>
              <app-button
                variant="secondary-glass"
                size="sm"
                icon="add"
                (btnClick)="abrirFormularioCotacaoAvulsa()">
                Registrar Primeira Cotação Avulsa
              </app-button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .drawer-cotacoes-container {
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding-bottom: 24px;
      max-width: 720px;
      margin: 0 auto;
    }

    .mobile-drag-handle {
      width: 38px;
      height: 5px;
      background: rgba(235, 217, 182, 0.3);
      border-radius: 999px;
      margin: 0 auto 4px auto;
    }

    .drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      border-bottom: 1px solid rgba(216, 184, 126, 0.15);
      padding-bottom: 10px;
    }

    .header-main {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .header-tag {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 9px;
        font-weight: 800;
        letter-spacing: 0.8px;
        color: var(--alic-color-gold-main, #c9a74e);

        .icon { font-size: 14px; }
      }

      .item-title {
        font-size: 18px;
        font-weight: 800;
        color: #ffffff;
        margin: 0;
        line-height: 1.2;
      }
    }

    .target-price-box {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(216, 184, 126, 0.2);
      border-radius: 12px;
      padding: 6px 10px;
      flex-shrink: 0;

      .target-label {
        font-size: 8px;
        font-weight: 800;
        letter-spacing: 0.5px;
        color: rgba(235, 217, 182, 0.6);
      }

      .target-val {
        font-size: 15px;
        font-weight: 800;
        color: var(--alic-color-gold-light, #ebd9b6);
      }

      .target-val-none {
        font-size: 11px;
        color: rgba(235, 217, 182, 0.5);
      }
    }

    /* Mobile Action Toolbar */
    .mobile-action-bar {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .mobile-action-pill {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 14px;
      border-radius: 999px;
      font-weight: 800;
      font-size: 13px;
      min-height: 46px;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;

      .icon {
        font-size: 18px;
        &.spin {
          animation: spin 1s linear infinite;
        }
      }

      &.primary {
        background: var(--alic-color-gold-gradient, linear-gradient(135deg, #c9a74e 0%, #a88432 100%));
        color: #2b0b10;
        box-shadow: 0 4px 14px rgba(201, 167, 78, 0.3);

        &:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(201, 167, 78, 0.4);
        }
      }

      &.secondary {
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(216, 184, 126, 0.3);
        color: #ebd9b6;

        &:hover {
          background: rgba(255, 255, 255, 0.12);
        }
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }

    .status-coleta-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;

      .icon { font-size: 18px; }

      &.concluida {
        background: rgba(16, 185, 129, 0.15);
        border: 1px solid rgba(16, 185, 129, 0.3);
        color: #10b981;
      }

      &.parcial {
        background: rgba(245, 158, 11, 0.15);
        border: 1px solid rgba(245, 158, 11, 0.3);
        color: #f59e0b;
      }

      &.sem_resultados {
        background: rgba(239, 68, 68, 0.15);
        border: 1px solid rgba(239, 68, 68, 0.3);
        color: #ef4444;
      }
    }

    /* Opportunity Banner */
    .opportunity-banner {
      background: linear-gradient(135deg, rgba(201, 167, 78, 0.25) 0%, rgba(161, 61, 99, 0.35) 100%);
      border: 2px solid #c9a74e;
      border-radius: 16px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 0 20px rgba(201, 167, 78, 0.35);
    }

    .sparkles-inline {
      font-size: 22px;
      display: flex;
      gap: 4px;
    }

    .opportunity-text {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .opp-badge {
        font-size: 8px;
        font-weight: 800;
        letter-spacing: 0.8px;
        color: #10b981;
      }

      .opp-title {
        font-size: 15px;
        font-weight: 800;
        color: #ffffff;
      }

      .opp-desc {
        font-size: 11px;
        color: rgba(235, 217, 182, 0.9);
        margin: 0;
      }
    }

    /* Hero Best Offer Card */
    .best-offer-hero-card {
      padding: 16px;
      border-radius: 18px;
      background: linear-gradient(135deg, rgba(31, 26, 27, 0.9) 0%, rgba(55, 18, 28, 0.9) 100%);
      border: 1px solid rgba(201, 167, 78, 0.4);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .hero-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .hero-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 9px;
        font-weight: 800;
        letter-spacing: 0.5px;
        color: #10b981;

        span { font-size: 15px; }
      }
    }

    .source-tag {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 999px;
      display: inline-block;

      &.avulsa {
        background: rgba(161, 61, 99, 0.25);
        color: #ebd9b6;
        border: 1px solid rgba(161, 61, 99, 0.4);
      }

      &.integrada {
        background: rgba(201, 167, 78, 0.25);
        color: #c9a74e;
        border: 1px solid rgba(201, 167, 78, 0.4);
      }

      &.manual {
        background: rgba(255, 255, 255, 0.1);
        color: rgba(235, 217, 182, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
    }

    .hero-body {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }

    .store-brand-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .store-logo-frame {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(201, 167, 78, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;

      .store-logo-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .store-icon {
        font-size: 24px;
        color: var(--alic-color-gold-main);
      }
    }

    .store-name-details {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .store-name {
        font-size: 16px;
        font-weight: 800;
        color: #ffffff;
        margin: 0;
      }

      .offer-date {
        font-size: 10px;
        color: rgba(235, 217, 182, 0.6);
      }
    }

    .price-action-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .price-value-container {
      display: flex;
      align-items: baseline;
      gap: 4px;

      .price-symbol {
        font-size: 14px;
        font-weight: 700;
        color: rgba(235, 217, 182, 0.7);
      }

      .big-price {
        font-size: 24px;
        font-weight: 800;
        color: #10b981;
        text-shadow: 0 0 12px rgba(16, 185, 129, 0.3);
      }
    }

    .btn-go-store {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 10px;
      background: var(--alic-color-gold-gradient, linear-gradient(135deg, #c9a74e 0%, #a88432 100%));
      color: #2b0b10;
      font-size: 12px;
      font-weight: 800;
      text-decoration: none;
      box-shadow: 0 0 12px rgba(201, 167, 78, 0.3);

      .icon { font-size: 15px; }
    }

    .hero-footer-economy {
      border-top: 1px dashed rgba(201, 167, 78, 0.25);
      padding-top: 8px;
    }

    .economy-box {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;

      .icon { font-size: 16px; }

      &.positive {
        color: #10b981;
        strong { font-weight: 800; color: #ffffff; }
      }

      &.target-reached {
        color: var(--alic-color-gold-light);
      }

      &.no-target {
        color: rgba(235, 217, 182, 0.6);
      }
    }

    /* Section Container */
    .section-container {
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      border-radius: 16px;
      background: rgba(31, 26, 27, 0.7);
      border: 1px solid rgba(216, 184, 126, 0.15);
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .section-title-group {
      display: flex;
      align-items: center;
      gap: 8px;

      .section-icon {
        font-size: 20px;
        color: var(--alic-color-gold-main);
      }

      h3 {
        font-size: 14px;
        font-weight: 700;
        color: #ffffff;
        margin: 0;
      }

      .subtitle {
        font-size: 10px;
        color: rgba(235, 217, 182, 0.6);
        margin: 0;
      }
    }

    .chart-wrapper {
      min-height: 240px;
    }

    .empty-chart, .empty-cotacoes {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      gap: 8px;
      color: rgba(235, 217, 182, 0.6);
      text-align: center;

      span { font-size: 28px; color: var(--alic-color-gold-main); }
      p { font-size: 11px; margin: 0; }
    }

    /* Cotacoes List Mobile Cards */
    .cotacoes-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .cotacao-item-row.mobile-card {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(216, 184, 126, 0.15);
      border-radius: 14px;
      padding: 10px 12px;

      .store-avatar-box {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: rgba(201, 167, 78, 0.12);
        border: 1px solid rgba(201, 167, 78, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        color: #c9a74e;
        span { font-size: 18px; }
      }

      .cot-store-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex: 1;
        min-width: 0;
      }

      .store-name-line {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;

        .store-name {
          font-size: 13px;
          font-weight: 800;
          color: #ffffff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      .cot-obs {
        font-size: 11px;
        color: rgba(235, 217, 182, 0.8);
        margin: 0;
        line-height: 1.2;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .cot-date {
        font-size: 9px;
        color: rgba(235, 217, 182, 0.45);
      }

      .cot-price-action {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 4px;
        flex-shrink: 0;
      }

      .cot-price {
        font-size: 15px;
        font-weight: 800;
        color: var(--alic-color-gold-light);
      }

      .cot-btns {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .icon-link-btn, .icon-delete-btn {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: rgba(235, 217, 182, 0.7);
        width: 28px;
        height: 28px;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;

        span { font-size: 15px; }

        &:hover {
          background: rgba(201, 167, 78, 0.2);
          color: #c9a74e;
        }
      }

      .icon-delete-btn:hover {
        background: rgba(239, 68, 68, 0.2);
        color: #ef4444;
      }
    }

    @media (max-width: 600px) {
      .hero-body {
        flex-direction: column;
        align-items: flex-start;
      }
      .price-action-group {
        width: 100%;
        justify-content: space-between;
      }
    }
  `],
})
export class DrawerCotacoesComponent implements OnInit {
  readonly cotacoesStore = inject(CotacoesStore);
  private readonly overlayService = inject(OverlayService);
  private readonly toastService = inject(ToastService);
  readonly haptics = inject(HapticsService);

  formatarObservacao(obs?: string | null): string {
    if (!obs) return '';
    const match = obs.match(/^Encontrado via [^(]+\((.*)\)$/i);
    if (match && match[1]) {
      return match[1]
        .replace(/&eacute;/g, 'é')
        .replace(/&ccedil;/g, 'ç')
        .replace(/&atilde;/g, 'ã')
        .replace(/&amp;/g, '&')
        .trim();
    }
    return obs;
  }

  // Chart configuration computed from multi-series store signal
  readonly chartOptions = computed<CotacoesChartOptions>(() => {
    const seriesList = this.cotacoesStore.seriesApexCharts();

    // Coletar categorias temporais únicas ordenadas
    const categoriesSet = new Set<string>();
    seriesList.forEach((s) => {
      s.data.forEach((d) => categoriesSet.add(d.x));
    });
    const categories = Array.from(categoriesSet);

    // Se temos apenas 1 data (ex: hoje), exibir gráfico de barras comparativo entre LOJAS!
    if (categories.length <= 1 && seriesList.length > 0) {
      const storeNames = seriesList.map((s) => s.name);
      const storePrices = seriesList.map((s) => s.data[s.data.length - 1]?.y || 0);

      return {
        series: [
          {
            name: 'Preço no Mercado',
            data: storePrices,
          },
        ],
        chart: {
          type: 'bar',
          height: 240,
          toolbar: { show: false },
          background: 'transparent',
        },
        colors: ['#C9A74E', '#10B981', '#A13D63', '#0288D1', '#F59E0B', '#8B5CF6', '#EC4899'],
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '38%',
            borderRadius: 6,
            distributed: true,
            dataLabels: {
              position: 'top',
            },
          },
        },
        dataLabels: {
          enabled: true,
          formatter: (val: number) => `R$ ${val.toFixed(0)}`,
          style: {
            fontSize: '11px',
            colors: ['#ebd9b6'],
          },
          offsetY: -20,
        },
        xaxis: {
          categories: storeNames,
          labels: {
            style: { colors: 'rgba(235, 217, 182, 0.9)', fontSize: '10px' },
          },
          axisBorder: { show: false },
          axisTicks: { show: false },
        },
        yaxis: {
          labels: {
            style: { colors: 'rgba(235, 217, 182, 0.7)', fontSize: '10px' },
            formatter: (val: number) => `R$ ${val.toFixed(0)}`,
          },
        },
        tooltip: {
          theme: 'dark',
          y: {
            formatter: (val: number) => `R$ ${val.toFixed(2)}`,
          },
        },
        grid: {
          borderColor: 'rgba(216, 184, 126, 0.12)',
          strokeDashArray: 4,
        },
        legend: {
          show: false,
        },
      };
    }

    // Gráfico de linha histórica quando houver múltiplas datas
    const chartSeries: ApexAxisChartSeries = seriesList.map((s) => ({
      name: s.name,
      data: s.data.map((d) => d.y),
    }));

    return {
      series: chartSeries,
      chart: {
        type: 'line',
        height: 240,
        toolbar: { show: false },
        background: 'transparent',
      },
      colors: ['#C9A74E', '#10B981', '#A13D63', '#0288D1', '#F59E0B'],
      stroke: {
        curve: 'smooth',
        width: 3,
      },
      fill: {
        type: 'solid',
        opacity: 1,
      },
      xaxis: {
        categories: categories.length > 0 ? categories : ['Hoje'],
        labels: {
          style: { colors: 'rgba(235, 217, 182, 0.7)', fontSize: '10px' },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: { colors: 'rgba(235, 217, 182, 0.7)', fontSize: '10px' },
          formatter: (val: number) => `R$ ${val.toFixed(0)}`,
        },
      },
      tooltip: {
        theme: 'dark',
        y: {
          formatter: (val: number) => `R$ ${val.toFixed(2)}`,
        },
      },
      dataLabels: { enabled: false },
      grid: {
        borderColor: 'rgba(216, 184, 126, 0.12)',
        strokeDashArray: 4,
      },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'center',
        labels: {
          colors: 'rgba(235, 217, 182, 0.8)',
        },
      },
    };
  });

  ngOnInit(): void {
    const data = this.overlayService.activeOverlay()?.data as {
      itemWishlist?: ItemWishlist;
      produto?: Produto;
      itemWishlistId?: string;
    };

    if (data?.itemWishlistId || data?.itemWishlist?.id) {
      const id = data.itemWishlistId || data.itemWishlist?.id || '';
      void this.cotacoesStore.carregarComparador(id, data.itemWishlist, data.produto);
    }
  }

  async executarPesquisaMercado(): Promise<void> {
    const itemWishId = this.cotacoesStore.itemWishlistId();
    if (!itemWishId) return;

    this.haptics.impactMedium();
    this.toastService.showInfo('Buscando ofertas de mercado sob demanda...');

    await this.cotacoesStore.buscarCotacoesSobDemanda(itemWishId);

    const status = this.cotacoesStore.statusColeta();
    if (status === 'CONCLUIDA') {
      this.toastService.showSuccess('Cotações de mercado atualizadas!');
    } else if (status === 'PARCIAL') {
      this.toastService.showWarning('Cotações atualizadas parcialmente.');
    } else {
      this.toastService.showError('Nenhuma cotação pública encontrada.');
    }
  }

  abrirFormularioCotacaoAvulsa(): void {
    this.haptics.impactLight();
    const itemWishlistId = this.cotacoesStore.itemWishlistId();
    if (!itemWishlistId) return;

    this.overlayService.openBottomSheet({
      component: FormularioCotacaoAvulsaComponent,
      data: {
        itemWishlistId,
        itemWishlistNome: this.cotacoesStore.nomeItem(),
      },
    });
  }

  async removerCotacao(cot: CotacaoAvulsa): Promise<void> {
    this.haptics.impactMedium();
    try {
      await this.cotacoesStore.removerCotacaoAvulsa(cot.id);
      this.toastService.showSuccess(`Cotação da ${cot.lojaNome} removida.`);
    } catch (err: any) {
      this.toastService.showError(err.message || 'Erro ao remover cotação.');
    }
  }

  fecharModal(): void {
    this.haptics.impactLight();
    this.overlayService.close();
  }
}
