import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProdutosStore } from '../store/produtos.store';
import { OverlayService } from '../../../core/services/overlay.service';
import { ToastService } from '../../../core/services/toast.service';
import { HapticsService } from '../../../core/platform/haptics.service';
import { PullToRefreshDirective } from '../../../shared/directives/pull-to-refresh.directive';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { FormularioProdutoComponent } from '../components/formulario-produto.component';
import { FormularioLojaComponent } from '../components/formulario-loja.component';
import { Produto } from '../../../core/models/produto.models';

@Component({
  selector: 'app-produtos-page',
  standalone: true,
  imports: [
    CommonModule,
    PullToRefreshDirective,
    SkeletonComponent,
    ButtonComponent,
  ],
  template: `
    <div class="page-container" appPullToRefresh (refresh)="onRefresh()">
      <!-- Hero Banner Catálogo & Cotações -->
      <div class="catalog-hero-card glass-card gold-border animate-fade-in">
        <div class="hero-top">
          <span class="hero-label">CATÁLOGO & HISTÓRICO DE PREÇOS</span>
          <span class="material-symbols-rounded hero-icon">local_offer</span>
        </div>

        <div class="hero-metrics-row">
          <div class="metric-item">
            <span class="metric-val">{{ produtosStore.estatisticas().totalProdutos }}</span>
            <span class="metric-lbl">Itens no Catálogo</span>
          </div>
          <div class="metric-divider"></div>
          <div class="metric-item">
            <span class="metric-val">{{ produtosStore.estatisticas().produtosComOfertas }}</span>
            <span class="metric-lbl">Com Ofertas Ativas</span>
          </div>
          <div class="metric-divider"></div>
          <div class="metric-item">
            <span class="metric-val gold-text">
              @if (produtosStore.estatisticas().menorPrecoAbsoluto !== null) {
                {{ produtosStore.estatisticas().menorPrecoAbsoluto | currency:'BRL':'symbol':'1.2-2' }}
              } @else {
                --
              }
            </span>
            <span class="metric-lbl">Menor Cotação Encontrada</span>
          </div>
        </div>

        <div class="hero-actions">
          <app-button
            variant="primary-gold"
            size="sm"
            icon="add"
            (btnClick)="abrirNovoProduto()">
            + Novo Produto
          </app-button>

          <app-button
            variant="secondary-glass"
            size="sm"
            icon="storefront"
            (btnClick)="abrirGerenciarLoja()">
            + Cadastrar Loja
          </app-button>
        </div>
      </div>

      <!-- Barra de Pesquisa e Filtros de Categoria -->
      <div class="search-filter-section">
        <div class="search-input-wrapper glass-card">
          <span class="material-symbols-rounded search-icon">search</span>
          <input
            type="text"
            placeholder="Buscar por nome do produto ou marca..."
            [value]="produtosStore.termoBusca()"
            (input)="onSearchChange($event)"
            class="search-input" />
          @if (produtosStore.termoBusca()) {
            <button class="clear-search-btn" (click)="limparBusca()">
              <span class="material-symbols-rounded">close</span>
            </button>
          }
        </div>

        <!-- Horizontal Scroll Category Selector Pills -->
        @if (produtosStore.categoriasDisponiveis().length > 0) {
          <div class="category-pills-row">
            <button
              class="category-pill"
              [class.active]="produtosStore.categoriaFiltro() === null"
              (click)="selecionarCategoria(null)">
              Todos os Itens
            </button>
            @for (cat of produtosStore.categoriasDisponiveis(); track cat.id) {
              <button
                class="category-pill"
                [class.active]="produtosStore.categoriaFiltro() === cat.id"
                (click)="selecionarCategoria(cat.id)">
                {{ cat.nome }}
              </button>
            }
          </div>
        }
      </div>

      <!-- Header da Lista -->
      <div class="list-header">
        <div class="header-left">
          <h2>Catálogo de Produtos</h2>
          <span class="subtext">
            Exibindo {{ produtosStore.produtosFiltrados().length }} de {{ produtosStore.produtos().length }} itens
          </span>
        </div>
      </div>

      <!-- Skeleton Loading State -->
      @if (produtosStore.carregando() && produtosStore.produtos().length === 0) {
        <div class="skeleton-grid">
          <app-skeleton type="card"></app-skeleton>
          <app-skeleton type="card"></app-skeleton>
          <app-skeleton type="card"></app-skeleton>
        </div>
      }

      <!-- Grid de Cards de Produtos Glassmorphism -->
      <div class="produtos-grid">
        @for (produto of produtosStore.produtosFiltrados(); track produto.id) {
          <div
            class="produto-card glass-card touch-active animate-fade-in"
            (click)="abrirDetalheProduto(produto)">
            
            <div class="card-image-box">
              @if (produto.imagemPrincipalUrl) {
                <img [src]="produto.imagemPrincipalUrl" [alt]="produto.nome" class="product-thumb" />
              } @else {
                <div class="placeholder-thumb">
                  <span class="material-symbols-rounded">inventory_2</span>
                </div>
              }

              @if (produto.marca) {
                <span class="brand-badge-overlay">{{ produto.marca }}</span>
              }
            </div>

            <div class="card-content">
              <div class="title-category-group">
                <h3 class="product-name">{{ produto.nome }}</h3>
                @if (produto.categoria?.nome) {
                  <span class="category-tag">{{ produto.categoria?.nome }}</span>
                }
              </div>

              @if (produto.descricao) {
                <p class="product-desc">{{ produto.descricao }}</p>
              }

              <div class="card-footer-price">
                @if (produto.menorPreco !== null && produto.menorPreco !== undefined) {
                  <div class="best-price-pill">
                    <span class="price-label">MENOR PREÇO</span>
                    <span class="price-value">{{ produto.menorPreco | currency:'BRL':'symbol':'1.2-2' }}</span>
                    @if (produto.lojaMenorPreco) {
                      <span class="store-label">em {{ produto.lojaMenorPreco }}</span>
                    }
                  </div>
                } @else {
                  <div class="no-price-pill">
                    <span class="material-symbols-rounded icon-mini">info</span>
                    <span>Sem ofertas vinculadas</span>
                  </div>
                }

                <div class="offers-count">
                  <span class="material-symbols-rounded icon-small">store</span>
                  <span>{{ produto.links?.length || 0 }} {{ (produto.links?.length === 1) ? 'oferta' : 'ofertas' }}</span>
                </div>
              </div>
            </div>

            <div class="arrow-forward-icon">
              <span class="material-symbols-rounded">chevron_right</span>
            </div>
          </div>
        } @empty {
          @if (!produtosStore.carregando()) {
            <div class="empty-state glass-card animate-fade-in">
              <span class="material-symbols-rounded empty-icon">shopping_bag</span>
              <h3>Nenhum produto encontrado</h3>
              <p>
                @if (produtosStore.termoBusca() || produtosStore.categoriaFiltro()) {
                  Tente alterar os termos de busca ou remover o filtro de categoria.
                } @else {
                  Seu catálogo de produtos está vazio. Cadastre seu primeiro item para comparar preços.
                }
              </p>
              <app-button variant="primary-gold" icon="add" (btnClick)="abrirNovoProduto()">
                Cadastrar Primeiro Produto
              </app-button>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 18px;
      min-height: 100%;
    }

    .catalog-hero-card {
      padding: 22px 20px;
      background: linear-gradient(135deg, rgba(28, 12, 16, 0.95) 0%, rgba(74, 18, 26, 0.82) 100%);
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .hero-top {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .hero-label {
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 1.5px;
        color: rgba(235, 217, 182, 0.7);
      }

      .hero-icon {
        color: var(--alic-color-gold-light);
        font-size: 24px;
      }
    }

    .hero-metrics-row {
      display: flex;
      align-items: center;
      justify-content: space-around;
      background: rgba(0, 0, 0, 0.25);
      border-radius: var(--alic-radius-md);
      padding: 12px 10px;
      border: 1px solid rgba(216, 184, 126, 0.15);
    }

    .metric-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .metric-val {
      font-family: var(--alic-font-family-mono);
      font-size: 18px;
      font-weight: 800;
      color: #ffffff;

      &.gold-text {
        color: var(--alic-color-gold-light);
      }
    }

    .metric-lbl {
      font-size: 10px;
      color: rgba(235, 217, 182, 0.6);
      margin-top: 2px;
    }

    .metric-divider {
      width: 1px;
      height: 28px;
      background: rgba(216, 184, 126, 0.2);
    }

    .hero-actions {
      display: flex;
      gap: 10px;
    }

    .search-filter-section {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .search-input-wrapper {
      display: flex;
      align-items: center;
      padding: 4px 14px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(216, 184, 126, 0.25);

      .search-icon {
        color: var(--alic-color-gold-main);
        font-size: 20px;
        margin-right: 10px;
      }

      .search-input {
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        color: #ffffff;
        font-family: inherit;
        font-size: 14px;
        padding: 10px 0;

        &::placeholder {
          color: rgba(235, 217, 182, 0.45);
        }
      }

      .clear-search-btn {
        background: none;
        border: none;
        color: rgba(235, 217, 182, 0.6);
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;

        span { font-size: 18px; }
      }
    }

    .category-pills-row {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 4px;

      &::-webkit-scrollbar { display: none; }
    }

    .category-pill {
      white-space: nowrap;
      padding: 6px 14px;
      border-radius: 9999px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(216, 184, 126, 0.2);
      color: rgba(235, 217, 182, 0.7);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;

      &.active {
        background: var(--alic-color-gold-gradient);
        color: #2b0b10;
        border-color: var(--alic-color-gold-main);
        font-weight: 700;
        box-shadow: var(--alic-shadow-gold-glow);
      }
    }

    .list-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      h2 { font-size: 18px; font-weight: 700; margin: 0; color: #ffffff; }
      .subtext { font-size: 12px; color: var(--color-text-tertiary); display: block; }
    }

    .skeleton-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .produtos-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .produto-card {
      padding: 14px;
      display: flex;
      align-items: center;
      gap: 14px;
      cursor: pointer;
      position: relative;
      transition: transform 0.2s ease, border-color 0.2s ease;

      &:hover {
        border-color: rgba(216, 184, 126, 0.4);
      }
    }

    .card-image-box {
      width: 72px;
      height: 72px;
      border-radius: var(--alic-radius-md);
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(216, 184, 126, 0.2);
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      .product-thumb {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .placeholder-thumb {
        color: var(--alic-color-gold-main);
        span { font-size: 32px; }
      }

      .brand-badge-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.75);
        color: var(--alic-color-gold-light);
        font-size: 9px;
        font-weight: 700;
        text-align: center;
        padding: 2px 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .card-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 0;
    }

    .title-category-group {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;

      .product-name {
        font-size: 15px;
        font-weight: 700;
        color: #ffffff;
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .category-tag {
        font-size: 10px;
        font-weight: 700;
        color: var(--alic-color-gold-light);
        background: rgba(216, 184, 126, 0.12);
        padding: 2px 8px;
        border-radius: 4px;
        flex-shrink: 0;
      }
    }

    .product-desc {
      font-size: 11px;
      color: rgba(235, 217, 182, 0.6);
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .card-footer-price {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-top: 2px;
    }

    .best-price-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 3px 8px;
      border-radius: var(--alic-radius-sm);

      .price-label {
        font-size: 8px;
        font-weight: 800;
        letter-spacing: 0.5px;
        color: #34d399;
      }

      .price-value {
        font-family: var(--alic-font-family-mono);
        font-size: 13px;
        font-weight: 800;
        color: #ffffff;
      }

      .store-label {
        font-size: 10px;
        color: rgba(255, 255, 255, 0.7);
      }
    }

    .no-price-pill {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      color: rgba(235, 217, 182, 0.5);

      .icon-mini { font-size: 14px; }
    }

    .offers-count {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      color: var(--alic-color-gold-light);
      font-weight: 600;

      .icon-small { font-size: 15px; }
    }

    .arrow-forward-icon {
      color: rgba(235, 217, 182, 0.4);
      span { font-size: 22px; }
    }

    .empty-state {
      padding: 40px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 12px;

      .empty-icon { font-size: 48px; color: var(--alic-color-gold-main); }
      h3 { margin: 0; font-size: 18px; color: #ffffff; }
      p { margin: 0; font-size: 13px; color: var(--color-text-tertiary); max-width: 320px; }
    }
  `],
})
export class ProdutosPage implements OnInit {
  readonly produtosStore = inject(ProdutosStore);
  private readonly router = inject(Router);
  private readonly overlayService = inject(OverlayService);
  private readonly haptics = inject(HapticsService);

  ngOnInit(): void {
    this.produtosStore.carregarProdutos();
    this.produtosStore.carregarLojas();
  }

  onRefresh(): void {
    this.produtosStore.carregarProdutos();
    this.produtosStore.carregarLojas();
  }

  onSearchChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.produtosStore.setTermoBusca(val);
  }

  limparBusca(): void {
    this.haptics.impactLight();
    this.produtosStore.setTermoBusca('');
  }

  selecionarCategoria(catId: string | null): void {
    this.haptics.impactLight();
    this.produtosStore.setCategoriaFiltro(catId);
  }

  abrirNovoProduto(): void {
    this.haptics.impactLight();
    this.overlayService.openBottomSheet({
      component: FormularioProdutoComponent,
      title: 'Cadastrar Novo Produto',
    });
  }

  abrirGerenciarLoja(): void {
    this.haptics.impactLight();
    this.overlayService.openBottomSheet({
      component: FormularioLojaComponent,
      title: 'Cadastrar Loja Parceira',
    });
  }

  abrirDetalheProduto(produto: Produto): void {
    this.haptics.impactLight();
    this.router.navigate(['/products', produto.id]);
  }
}
