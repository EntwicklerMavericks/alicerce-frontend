import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexStroke,
  ApexTooltip,
  ApexDataLabels,
  ApexYAxis,
  ApexFill,
  ApexGrid,
} from 'ng-apexcharts';
import { ProdutosStore } from '../store/produtos.store';
import { OverlayService } from '../../../core/services/overlay.service';
import { ToastService } from '../../../core/services/toast.service';
import { HapticsService } from '../../../core/platform/haptics.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { FormularioProdutoComponent } from '../components/formulario-produto.component';
import { FormularioLinkComponent } from '../components/formulario-link.component';
import { DrawerCotacoesComponent } from '../../cotacoes/components/drawer-cotacoes.component';
import { LinkProduto, ImagemProduto } from '../../../core/models/produto.models';

export type ChartOptions = {
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
};

@Component({
  selector: 'app-produto-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    NgApexchartsModule,
    ButtonComponent,
    BadgeComponent,
    SkeletonComponent,
  ],
  template: `
    <div class="detail-page-container animate-fade-in">
      <!-- Top Navigation & Back Header -->
      <div class="top-nav-bar">
        <button class="back-btn" (click)="voltar()">
          <span class="material-symbols-rounded">arrow_back</span>
          <span>Catálogo</span>
        </button>

        <div class="action-buttons">
          <button class="icon-action-btn" (click)="editarProduto()" title="Editar Produto">
            <span class="material-symbols-rounded">edit</span>
          </button>
          <button class="icon-action-btn danger" (click)="removerProduto()" title="Excluir Produto">
            <span class="material-symbols-rounded">delete</span>
          </button>
        </div>
      </div>

      @if (produtosStore.carregando() && !produtosStore.produtoSelecionado()) {
        <div class="skeleton-box">
          <app-skeleton type="card"></app-skeleton>
          <app-skeleton type="card"></app-skeleton>
        </div>
      }

      @if (produtosStore.produtoSelecionadoEnriquecido(); as produto) {
        <!-- Main Product Header Banner -->
        <div class="product-header-card glass-card">
          <div class="header-main-info">
            <div class="title-meta-row">
              <div>
                <span class="category-pill">{{ produto.categoria?.nome || 'Sem Categoria' }}</span>
                <h1 class="product-title">{{ produto.nome }}</h1>
              </div>

              @if (produto.marca) {
                <app-badge variant="gold">{{ produto.marca }}</app-badge>
              }
            </div>

            @if (produto.descricao) {
              <p class="product-description">{{ produto.descricao }}</p>
            }

            @if (produto.observacoes) {
              <div class="obs-box">
                <span class="material-symbols-rounded obs-icon">info</span>
                <span>{{ produto.observacoes }}</span>
              </div>
            }

            <div class="lowest-price-hero">
              <div class="price-hero-label">MENOR OFERTA REGISTRADA</div>
              <div class="price-hero-value">
                @if (produto.menorPreco !== null && produto.menorPreco !== undefined) {
                  {{ produto.menorPreco | currency:'BRL':'symbol':'1.2-2' }}
                  <span class="store-hero-name">em {{ produto.lojaMenorPreco }}</span>
                } @else {
                  Nenhuma cotação cadastrada
                }
              </div>
            </div>
          </div>
        </div>

        <!-- Section: Galeria de Fotos & Seleção de Foto Principal -->
        <div class="section-card glass-card">
          <div class="section-header">
            <h3>Galeria de Fotos 📸</h3>
            <button class="add-photo-btn" (click)="adicionarNovaFoto()">
              + Adicionar Foto (URL)
            </button>
          </div>

          <div class="gallery-wrapper">
            <!-- Foto Principal Destaque -->
            <div class="main-photo-stage">
              @if (imagemSelecionadaUrl || produto.imagemPrincipalUrl) {
                <img
                  [src]="imagemSelecionadaUrl || produto.imagemPrincipalUrl"
                  [alt]="produto.nome"
                  class="main-photo-img" />
              } @else {
                <div class="main-photo-placeholder">
                  <span class="material-symbols-rounded">inventory_2</span>
                  <span>Sem Imagem Cadastrada</span>
                </div>
              }
            </div>

            <!-- Carousel Thumbnails -->
            @if (produto.imagens && produto.imagens.length > 0) {
              <div class="thumbnails-list">
                @for (img of produto.imagens; track img.id) {
                  <div
                    class="thumb-item"
                    [class.active]="img.url === (imagemSelecionadaUrl || produto.imagemPrincipalUrl)"
                    [class.is-principal]="img.principal"
                    (click)="selecionarFotoPreview(img.url)">
                    <img [src]="img.url" alt="Thumb" />

                    @if (img.principal) {
                      <span class="principal-star-badge">★ Principal</span>
                    } @else {
                      <button
                        class="set-principal-btn"
                        (click)="definirFotoPrincipal(img); $event.stopPropagation()"
                        title="Definir como Principal">
                        Tornar Principal
                      </button>
                    }
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <!-- Section: Comparador de Ofertas por Loja -->
        <div class="section-card glass-card">
          <div class="section-header">
            <div>
              <h3>Comparador de Ofertas 🛍️</h3>
              <p class="section-subtitle">Acompanhe preços das lojas parceiras e redirecione</p>
            </div>

            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <app-button
                variant="secondary-glass"
                size="sm"
                icon="price_change"
                (btnClick)="abrirMotorCotacoes()">
                Motor de Cotações
              </app-button>

              <app-button
                variant="primary-gold"
                size="sm"
                icon="add_link"
                (btnClick)="abrirVincularOferta()">
                + Vincular Oferta
              </app-button>
            </div>
          </div>

          <div class="offers-list">
            @for (link of produto.links; track link.id) {
              <div class="offer-card glass-card">
                <div class="offer-left">
                  <div class="store-logo-box">
                    @if (link.loja?.urlLogo) {
                      <img [src]="link.loja?.urlLogo!" [alt]="link.loja?.nome" class="store-logo" />
                    } @else {
                      <span class="material-symbols-rounded store-icon">storefront</span>
                    }
                  </div>

                  <div class="store-info">
                    <div class="store-name-row">
                      <h4 class="store-name">{{ link.loja?.nome || 'Loja Parceira' }}</h4>
                      @if (link.preco === produto.menorPreco) {
                        <span class="best-offer-tag">MENOR PREÇO</span>
                      }
                    </div>

                    @if (link.ultimaVerificacao) {
                      <span class="verif-date">
                        Atualizado em {{ link.ultimaVerificacao | date:'dd/MM/yyyy HH:mm' }}
                      </span>
                    }
                  </div>
                </div>

                <div class="offer-right">
                  <div class="price-display">
                    <span class="current-price">{{ link.preco | currency:'BRL':'symbol':'1.2-2' }}</span>
                  </div>

                  <div class="offer-actions">
                    <button class="update-price-btn" (click)="atualizarPrecoOferta(link)">
                      <span class="material-symbols-rounded">history</span>
                      <span>Atualizar Preço</span>
                    </button>

                    <button class="external-link-btn" (click)="redirecionarParaLoja(link.url)">
                      <span>Ir para Loja</span>
                      <span class="material-symbols-rounded">open_in_new</span>
                    </button>
                  </div>
                </div>
              </div>
            } @empty {
              <div class="empty-offers glass-card">
                <span class="material-symbols-rounded empty-icon">link_off</span>
                <p>Nenhuma oferta de loja vinculada a este produto.</p>
                <app-button variant="primary-gold" icon="add" (btnClick)="abrirVincularOferta()">
                  Vincular Primeira Loja
                </app-button>
              </div>
            }
          </div>
        </div>

        <!-- Section: Gráfico ApexCharts de Histórico e Oscilação de Preços -->
        <div class="section-card glass-card">
          <div class="section-header">
            <div>
              <h3>Histórico de Oscilação de Preço 📈</h3>
              <p class="section-subtitle">Variação do menor preço e cotações registradas</p>
            </div>
          </div>

          <div class="chart-container">
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
                [colors]="chartOptions().colors">
              </apx-chart>
            } @else {
              <div class="empty-chart">
                <span class="material-symbols-rounded empty-icon">show_chart</span>
                <p>Histórico insuficiente para gerar o gráfico. Atualize ou vincule mais ofertas para registrar o histórico de variação.</p>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .detail-page-container {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      min-height: 100%;
    }

    .top-nav-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .back-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(216, 184, 126, 0.3);
      padding: 8px 14px;
      border-radius: var(--alic-radius-md);
      color: var(--alic-color-gold-light);
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;

      span { font-size: 18px; }
    }

    .action-buttons {
      display: flex;
      gap: 8px;
    }

    .icon-action-btn {
      width: 36px;
      height: 36px;
      border-radius: var(--alic-radius-md);
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(216, 184, 126, 0.25);
      color: var(--alic-color-gold-light);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      &.danger {
        color: #f43f5e;
        border-color: rgba(244, 63, 94, 0.3);
      }

      span { font-size: 18px; }
    }

    .skeleton-box {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .product-header-card {
      padding: 24px 20px;
      background: linear-gradient(135deg, rgba(28, 12, 16, 0.95) 0%, rgba(74, 18, 26, 0.85) 100%);
      border: 1px solid rgba(216, 184, 126, 0.35);
    }

    .header-main-info {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .title-meta-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;

      .category-pill {
        display: inline-block;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 1px;
        color: var(--alic-color-gold-light);
        background: rgba(216, 184, 126, 0.15);
        padding: 3px 10px;
        border-radius: 9999px;
        margin-bottom: 6px;
      }

      .product-title {
        font-size: 24px;
        font-weight: 800;
        color: #ffffff;
        margin: 0;
      }
    }

    .product-description {
      font-size: 13px;
      color: rgba(235, 217, 182, 0.7);
      margin: 0;
    }

    .obs-box {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(0, 0, 0, 0.3);
      padding: 8px 12px;
      border-radius: var(--alic-radius-sm);
      border-left: 3px solid var(--alic-color-gold-main);
      font-size: 12px;
      color: rgba(235, 217, 182, 0.8);

      .obs-icon { font-size: 18px; color: var(--alic-color-gold-main); }
    }

    .lowest-price-hero {
      margin-top: 6px;
      padding-top: 12px;
      border-top: 1px solid rgba(216, 184, 126, 0.2);

      .price-hero-label {
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 1px;
        color: #34d399;
      }

      .price-hero-value {
        font-family: var(--alic-font-family-mono);
        font-size: 28px;
        font-weight: 800;
        color: var(--alic-color-gold-light);

        .store-hero-name {
          font-family: var(--alic-font-family-base);
          font-size: 14px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.7);
          margin-left: 6px;
        }
      }
    }

    /* Section Cards General */
    .section-card {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .section-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;

      h3 { font-size: 18px; font-weight: 700; margin: 0; color: #ffffff; }
      .section-subtitle { font-size: 12px; color: var(--color-text-tertiary); margin: 2px 0 0 0; }
    }

    .add-photo-btn {
      background: none;
      border: 1px dashed rgba(216, 184, 126, 0.4);
      color: var(--alic-color-gold-light);
      padding: 6px 12px;
      border-radius: var(--alic-radius-sm);
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
    }

    /* Gallery */
    .gallery-wrapper {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .main-photo-stage {
      width: 100%;
      height: 240px;
      border-radius: var(--alic-radius-md);
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(216, 184, 126, 0.2);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;

      .main-photo-img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .main-photo-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        color: rgba(235, 217, 182, 0.5);

        span { font-size: 40px; }
      }
    }

    .thumbnails-list {
      display: flex;
      gap: 10px;
      overflow-x: auto;
      padding-bottom: 4px;
    }

    .thumb-item {
      width: 80px;
      height: 80px;
      border-radius: var(--alic-radius-sm);
      border: 2px solid transparent;
      background: rgba(0, 0, 0, 0.4);
      position: relative;
      overflow: hidden;
      cursor: pointer;
      flex-shrink: 0;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      &.active {
        border-color: var(--alic-color-gold-main);
      }

      &.is-principal {
        border-color: #34d399;
      }

      .principal-star-badge {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(16, 185, 129, 0.85);
        color: #fff;
        font-size: 8px;
        font-weight: 800;
        text-align: center;
        padding: 2px 0;
      }

      .set-principal-btn {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.8);
        color: var(--alic-color-gold-light);
        border: none;
        font-size: 8px;
        font-weight: 700;
        padding: 3px 0;
        cursor: pointer;
      }
    }

    /* Offers List */
    .offers-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .offer-card {
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      background: rgba(255, 255, 255, 0.03);
    }

    .offer-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .store-logo-box {
      width: 48px;
      height: 48px;
      border-radius: var(--alic-radius-md);
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(216, 184, 126, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;

      .store-logo {
        width: 100%;
        height: 100%;
        object-fit: contain;
        border-radius: var(--alic-radius-md);
      }

      .store-icon {
        font-size: 24px;
        color: var(--alic-color-gold-main);
      }
    }

    .store-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .store-name-row {
      display: flex;
      align-items: center;
      gap: 8px;

      .store-name {
        font-size: 15px;
        font-weight: 700;
        color: #ffffff;
        margin: 0;
      }

      .best-offer-tag {
        font-size: 9px;
        font-weight: 800;
        background: rgba(16, 185, 129, 0.2);
        color: #34d399;
        padding: 2px 6px;
        border-radius: 4px;
      }
    }

    .verif-date {
      font-size: 11px;
      color: rgba(235, 217, 182, 0.5);
    }

    .offer-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
    }

    .current-price {
      font-family: var(--alic-font-family-mono);
      font-size: 18px;
      font-weight: 800;
      color: var(--alic-color-gold-light);
    }

    .offer-actions {
      display: flex;
      gap: 8px;
    }

    .update-price-btn, .external-link-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 10px;
      border-radius: var(--alic-radius-sm);
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      border: none;

      span { font-size: 14px; }
    }

    .update-price-btn {
      background: rgba(216, 184, 126, 0.15);
      color: var(--alic-color-gold-light);
      border: 1px solid rgba(216, 184, 126, 0.3);
    }

    .external-link-btn {
      background: var(--alic-color-gold-gradient);
      color: #2b0b10;
      box-shadow: var(--alic-shadow-gold-glow);
    }

    .empty-offers, .empty-chart {
      padding: 30px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 10px;
      color: rgba(235, 217, 182, 0.6);

      .empty-icon { font-size: 36px; color: var(--alic-color-gold-main); }
      p { margin: 0; font-size: 12px; }
    }

    .chart-container {
      margin-top: 8px;
    }

    @media (max-width: 640px) {
      .offer-card {
        flex-direction: column;
        align-items: flex-start;
      }
      .offer-right {
        width: 100%;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }
    }
  `],
})
export class ProdutoDetailPage implements OnInit {
  readonly produtosStore = inject(ProdutosStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly overlayService = inject(OverlayService);
  private readonly toastService = inject(ToastService);
  private readonly haptics = inject(HapticsService);

  produtoId!: string;
  imagemSelecionadaUrl: string | null = null;

  // Chart configuration computed from price history
  readonly chartOptions = computed<ChartOptions>(() => {
    const hist = this.produtosStore.historicoPrecos();
    const prod = this.produtosStore.produtoSelecionado();

    let series: ApexAxisChartSeries = [];
    let categories: string[] = [];

    if (hist && hist.length > 0) {
      // Sort history by date ascending
      const sorted = [...hist].sort(
        (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
      );

      categories = sorted.map((h) => {
        const d = new Date(h.data);
        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
          .toString()
          .padStart(2, '0')}`;
      });

      const prices = sorted.map((h) => Number(h.preco));

      series = [
        {
          name: 'Variação de Preço (R$)',
          data: prices,
        },
      ];
    } else if (prod && prod.links && prod.links.length > 0) {
      // Fallback build artificial history curve from links
      categories = prod.links.map((l) => l.loja?.nome || 'Oferta');
      series = [
        {
          name: 'Preço Atual Por Loja (R$)',
          data: prod.links.map((l) => Number(l.preco)),
        },
      ];
    }

    return {
      series,
      chart: {
        type: 'area',
        height: 250,
        toolbar: { show: false },
        background: 'transparent',
      },
      colors: ['#C9A74E'],
      stroke: {
        curve: 'smooth',
        width: 3,
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          type: 'vertical',
          shadeIntensity: 0.5,
          gradientToColors: ['#A13D63'],
          opacityFrom: 0.7,
          opacityTo: 0.1,
        },
      },
      xaxis: {
        categories,
        labels: {
          style: { colors: 'rgba(235, 217, 182, 0.7)', fontSize: '11px' },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: { colors: 'rgba(235, 217, 182, 0.7)', fontSize: '11px' },
          formatter: (val: number) => `R$ ${val.toFixed(2)}`,
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
        borderColor: 'rgba(216, 184, 126, 0.1)',
        strokeDashArray: 4,
      },
    };
  });

  ngOnInit(): void {
    this.produtoId = this.route.snapshot.paramMap.get('id') || '';
    if (this.produtoId) {
      this.produtosStore.carregarProdutoPorId(this.produtoId);
    }
  }

  voltar(): void {
    this.haptics.impactLight();
    this.router.navigate(['/products']);
  }

  selecionarFotoPreview(url: string): void {
    this.haptics.impactLight();
    this.imagemSelecionadaUrl = url;
  }

  async definirFotoPrincipal(img: ImagemProduto): Promise<void> {
    this.haptics.impactMedium();
    const ok = await this.produtosStore.definirImagemPrincipal(this.produtoId, img.id);
    if (ok) {
      this.imagemSelecionadaUrl = img.url;
      this.toastService.showSuccess('Foto definida como principal!');
    }
  }

  async adicionarNovaFoto(): Promise<void> {
    const url = prompt('Informe a URL da imagem do produto:');
    if (url && url.trim().length > 0) {
      this.haptics.impactMedium();
      const ok = await this.produtosStore.adicionarImagem(this.produtoId, url.trim());
      if (ok) {
        this.toastService.showSuccess('Foto adicionada à galeria!');
      }
    }
  }

  abrirVincularOferta(): void {
    this.haptics.impactLight();
    const prod = this.produtosStore.produtoSelecionado();
    this.overlayService.openBottomSheet({
      component: FormularioLinkComponent,
      title: 'Vincular Oferta de Loja',
      data: {
        produtoId: this.produtoId,
        produtoNome: prod?.nome,
      },
    });
  }

  atualizarPrecoOferta(link: LinkProduto): void {
    this.haptics.impactLight();
    const prod = this.produtosStore.produtoSelecionado();
    this.overlayService.openBottomSheet({
      component: FormularioLinkComponent,
      title: 'Atualizar Preço da Oferta',
      data: {
        produtoId: this.produtoId,
        produtoNome: prod?.nome,
        linkId: link.id,
        precoAtual: Number(link.preco),
        urlAtual: link.url,
      },
    });
  }

  redirecionarParaLoja(url: string): void {
    this.haptics.impactLight();
    if (url) {
      const fullUrl = url.startsWith('http') ? url : `https://${url}`;
      window.open(fullUrl, '_blank', 'noopener,noreferrer');
    }
  }

  editarProduto(): void {
    this.haptics.impactLight();
    const prod = this.produtosStore.produtoSelecionado();
    if (prod) {
      this.overlayService.openBottomSheet({
        component: FormularioProdutoComponent,
        title: 'Editar Produto',
        data: { produto: prod },
      });
    }
  }

  async removerProduto(): Promise<void> {
    const prod = this.produtosStore.produtoSelecionado();
    if (prod && confirm(`Tem certeza que deseja excluir o produto "${prod.nome}"?`)) {
      this.haptics.impactMedium();
      const ok = await this.produtosStore.removerProduto(prod.id);
      if (ok) {
        this.toastService.showSuccess(`Produto "${prod.nome}" removido.`);
        this.router.navigate(['/products']);
      }
    }
  }

  abrirMotorCotacoes(): void {
    this.haptics.impactMedium();
    const prod = this.produtosStore.produtoSelecionado();
    this.overlayService.openBottomSheet({
      component: DrawerCotacoesComponent,
      title: 'Motor de Cotações & Comparador de Preços',
      data: { produto: prod },
    });
  }
}
