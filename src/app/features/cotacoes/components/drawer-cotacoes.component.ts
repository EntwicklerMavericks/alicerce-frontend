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
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
  fill: ApexFill;
  grid: ApexGrid;
  colors: string[];
  legend: ApexLegend;
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
      <!-- Header do Comparador -->
      <div class="drawer-header">
        <div class="header-main">
          <div class="header-tag">
            <span class="material-symbols-rounded icon">price_check</span>
            <span>MOTOR DE COTAÇÕES & COMPARADOR</span>
          </div>
          <h2 class="item-title">{{ cotacoesStore.nomeItem() }}</h2>
        </div>

        <div class="target-price-box">
          <span class="target-label">PREÇO ALVO</span>
          @if (cotacoesStore.precoAlvo(); as alvo) {
            <span class="target-val">{{ alvo | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
          } @else {
            <span class="target-val-none">Sem preço alvo</span>
          }
        </div>
      </div>

      <!-- Badge Reluzente: "Oportunidade: Preço Alvo Atingido ✨" -->
      @if (cotacoesStore.alvoAtingido()) {
        <div class="opportunity-banner animate-bounce-in">
          <div class="sparkles-inline">
            <span class="sparkle">✨</span>
            <span class="sparkle">🏆</span>
          </div>
          <div class="opportunity-text">
            <span class="opp-badge">OPORTUNIDADE DE COMPRA CONSCIENTE</span>
            <strong class="opp-title">Preço Alvo Atingido! ✨</strong>
            <p class="opp-desc">
              A melhor oferta encontrada no mercado é menor ou igual ao seu valor planejado!
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

      <!-- Gráfico ApexCharts com Histórico Temporal Sobreposto por Loja -->
      <div class="section-container glass-card">
        <div class="section-header">
          <div class="section-title-group">
            <span class="material-symbols-rounded section-icon">show_chart</span>
            <div>
              <h3>Histórico Comparativo de Preços 📈</h3>
              <p class="subtitle">Evolução temporal sobreposta por loja no mercado</p>
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
              [stroke]="chartOptions().stroke"
              [tooltip]="chartOptions().tooltip"
              [dataLabels]="chartOptions().dataLabels"
              [fill]="chartOptions().fill"
              [grid]="chartOptions().grid"
              [colors]="chartOptions().colors"
              [legend]="chartOptions().legend">
            </apx-chart>
          } @else {
            <div class="empty-chart">
              <span class="material-symbols-rounded">area_chart</span>
              <p>Nenhum histórico temporal registrado ainda para este item.</p>
            </div>
          }
        </div>
      </div>

      <!-- Seção de Cotações Avulsas Registradas & Ação de Cadastro -->
      <div class="section-container glass-card">
        <div class="section-header space-between">
          <div class="section-title-group">
            <span class="material-symbols-rounded section-icon">loyalty</span>
            <div>
              <h3>Cotações Avulsas Encontradas</h3>
              <p class="subtitle">Preços manuais anotados de lojas físicas ou sites</p>
            </div>
          </div>

          <app-button
            variant="primary-gold"
            size="sm"
            icon="add"
            (btnClick)="abrirFormularioCotacaoAvulsa()">
            + Cotação Avulsa
          </app-button>
        </div>

        <div class="cotacoes-list">
          @for (cot of cotacoesStore.cotacoesAvulsas(); track cot.id) {
            <div class="cotacao-item-row">
              <div class="cot-store-info">
                <div class="store-name-line">
                  <span class="material-symbols-rounded store-ic">storefront</span>
                  <strong class="store-name">{{ cot.lojaNome }}</strong>
                </div>

                @if (cot.observacao) {
                  <p class="cot-obs">{{ cot.observacao }}</p>
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
                      title="Abrir Link">
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
              <p>Nenhuma cotação avulsa registrada para este desejo.</p>
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
      gap: 18px;
      padding-bottom: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .drawer-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      border-bottom: 1px solid rgba(216, 184, 126, 0.2);
      padding-bottom: 14px;
    }

    .header-main {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .header-tag {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 1px;
        color: var(--alic-color-gold-main, #c9a74e);

        .icon { font-size: 16px; }
      }

      .item-title {
        font-size: 20px;
        font-weight: 800;
        color: #ffffff;
        margin: 0;
      }
    }

    .target-price-box {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(216, 184, 126, 0.2);
      border-radius: 12px;
      padding: 6px 12px;

      .target-label {
        font-size: 9px;
        font-weight: 800;
        letter-spacing: 0.5px;
        color: rgba(235, 217, 182, 0.6);
      }

      .target-val {
        font-size: 16px;
        font-weight: 800;
        color: var(--alic-color-gold-light, #ebd9b6);
      }

      .target-val-none {
        font-size: 12px;
        color: rgba(235, 217, 182, 0.5);
      }
    }

    /* Banner Reluzente: "Oportunidade: Preço Alvo Atingido ✨" */
    .opportunity-banner {
      background: linear-gradient(135deg, rgba(201, 167, 78, 0.25) 0%, rgba(161, 61, 99, 0.35) 100%);
      border: 2px solid #c9a74e;
      border-radius: 16px;
      padding: 14px 18px;
      display: flex;
      align-items: center;
      gap: 14px;
      box-shadow: 0 0 20px rgba(201, 167, 78, 0.35);
      position: relative;
      overflow: hidden;
    }

    .sparkles-inline {
      font-size: 24px;
      display: flex;
      gap: 4px;
    }

    .opportunity-text {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .opp-badge {
        font-size: 9px;
        font-weight: 800;
        letter-spacing: 1px;
        color: #10b981;
      }

      .opp-title {
        font-size: 16px;
        font-weight: 800;
        color: #ffffff;
      }

      .opp-desc {
        font-size: 12px;
        color: rgba(235, 217, 182, 0.9);
        margin: 0;
      }
    }

    /* Hero Best Offer Card */
    .best-offer-hero-card {
      padding: 18px;
      border-radius: 20px;
      background: linear-gradient(135deg, rgba(31, 26, 27, 0.9) 0%, rgba(55, 18, 28, 0.9) 100%);
      border: 1px solid rgba(201, 167, 78, 0.4);
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .hero-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .hero-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.5px;
        color: #10b981;

        span { font-size: 16px; }
      }

      .source-tag {
        font-size: 10px;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 999px;

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
      }
    }

    .hero-body {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }

    .store-brand-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .store-logo-frame {
      width: 52px;
      height: 52px;
      border-radius: 14px;
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
        font-size: 28px;
        color: var(--alic-color-gold-main);
      }
    }

    .store-name-details {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .store-name {
        font-size: 18px;
        font-weight: 800;
        color: #ffffff;
        margin: 0;
      }

      .offer-date {
        font-size: 11px;
        color: rgba(235, 217, 182, 0.6);
      }
    }

    .price-action-group {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .price-value-container {
      display: flex;
      align-items: baseline;
      gap: 4px;

      .price-symbol {
        font-size: 16px;
        font-weight: 700;
        color: rgba(235, 217, 182, 0.7);
      }

      .big-price {
        font-size: 28px;
        font-weight: 800;
        color: #10b981;
        text-shadow: 0 0 12px rgba(16, 185, 129, 0.3);
      }
    }

    .btn-go-store {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 10px 16px;
      border-radius: 12px;
      background: var(--alic-color-gold-gradient, linear-gradient(135deg, #c9a74e 0%, #a88432 100%));
      color: #2b0b10;
      font-size: 13px;
      font-weight: 800;
      text-decoration: none;
      box-shadow: 0 0 12px rgba(201, 167, 78, 0.4);
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 0 18px rgba(201, 167, 78, 0.6);
      }

      .icon { font-size: 16px; }
    }

    .hero-footer-economy {
      border-top: 1px dashed rgba(201, 167, 78, 0.25);
      padding-top: 10px;
    }

    .economy-box {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;

      .icon { font-size: 18px; }

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

    /* Section Component */
    .section-container {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      border-radius: 18px;
      background: rgba(31, 26, 27, 0.7);
      border: 1px solid rgba(216, 184, 126, 0.2);
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 10px;

      &.space-between {
        justify-content: space-between;
      }
    }

    .section-title-group {
      display: flex;
      align-items: center;
      gap: 10px;

      .section-icon {
        font-size: 22px;
        color: var(--alic-color-gold-main);
      }

      h3 {
        font-size: 15px;
        font-weight: 700;
        color: #ffffff;
        margin: 0;
      }

      .subtitle {
        font-size: 11px;
        color: rgba(235, 217, 182, 0.6);
        margin: 0;
      }
    }

    .chart-wrapper {
      min-height: 250px;
    }

    .empty-chart, .empty-cotacoes {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      gap: 8px;
      color: rgba(235, 217, 182, 0.6);
      text-align: center;

      span { font-size: 32px; color: var(--alic-color-gold-main); }
      p { font-size: 12px; margin: 0; }
    }

    /* Cotacoes List */
    .cotacoes-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .cotacao-item-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(216, 184, 126, 0.15);
      border-radius: 12px;
      padding: 10px 14px;
    }

    .cot-store-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .store-name-line {
      display: flex;
      align-items: center;
      gap: 6px;

      .store-ic { font-size: 18px; color: var(--alic-color-gold-main); }
      .store-name { font-size: 14px; font-weight: 700; color: #ffffff; }
    }

    .cot-obs {
      font-size: 11px;
      color: rgba(235, 217, 182, 0.8);
      margin: 0;
    }

    .cot-date {
      font-size: 10px;
      color: rgba(235, 217, 182, 0.5);
    }

    .cot-price-action {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .cot-price {
      font-size: 16px;
      font-weight: 800;
      color: var(--alic-color-gold-light);
    }

    .cot-btns {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .icon-link-btn, .icon-delete-btn {
      background: none;
      border: none;
      color: rgba(235, 217, 182, 0.6);
      padding: 4px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover { color: #ffffff; background: rgba(255, 255, 255, 0.1); }
    }

    .icon-delete-btn:hover {
      color: #f44336;
      background: rgba(244, 67, 54, 0.15);
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

  // Chart configuration computed from multi-series store signal
  readonly chartOptions = computed<CotacoesChartOptions>(() => {
    const seriesList = this.cotacoesStore.seriesApexCharts();

    const chartSeries: ApexAxisChartSeries = seriesList.map((s) => ({
      name: s.name,
      data: s.data.map((d) => d.y),
    }));

    // Coletar categorias temporais únicas ordenadas
    const categoriesSet = new Set<string>();
    seriesList.forEach((s) => {
      s.data.forEach((d) => categoriesSet.add(d.x));
    });
    const categories = Array.from(categoriesSet);

    return {
      series: chartSeries,
      chart: {
        type: 'line',
        height: 250,
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
          style: { colors: 'rgba(235, 217, 182, 0.7)', fontSize: '11px' },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: { colors: 'rgba(235, 217, 182, 0.7)', fontSize: '11px' },
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
    } | undefined;

    const itemId = data?.itemWishlist?.id || data?.produto?.id || data?.itemWishlistId || 'item-default';
    this.cotacoesStore.carregarComparador(itemId, data?.itemWishlist, data?.produto);
  }

  abrirFormularioCotacaoAvulsa(): void {
    this.haptics.impactMedium();
    this.overlayService.openBottomSheet({
      component: FormularioCotacaoAvulsaComponent,
      title: 'Cadastrar Cotação Avulsa',
      data: { itemWishlistId: this.cotacoesStore.itemWishlistId() },
    });
  }

  async removerCotacao(cot: CotacaoAvulsa): Promise<void> {
    if (confirm(`Deseja excluir a cotação da loja "${cot.lojaNome}"?`)) {
      this.haptics.impactMedium();
      await this.cotacoesStore.removerCotacaoAvulsa(cot.id);
      this.toastService.showSuccess(`Cotação da loja "${cot.lojaNome}" removida!`);
    }
  }
}
