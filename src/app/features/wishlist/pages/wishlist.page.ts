import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { WishlistStore } from '../store/wishlist.store';
import { OverlayService } from '../../../core/services/overlay.service';
import { ToastService } from '../../../core/services/toast.service';
import { HapticsService } from '../../../core/platform/haptics.service';
import { FabActionRegistryService } from '../../../core/services/fab-action-registry.service';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { FormularioWishlistComponent } from '../components/formulario-wishlist.component';
import { ModalQuebraDesafioComponent } from '../components/modal-quebra-desafio.component';
import { DrawerCotacoesComponent } from '../../cotacoes/components/drawer-cotacoes.component';
import { ItemWishlist, PrioridadeWishlist } from '../../../core/models/wishlist.models';

@Component({
  selector: 'app-wishlist-page',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, FormsModule, CardComponent, ButtonComponent],
  template: `
    <div class="wishlist-page animate-fade-in">
      <!-- Overlay de Animação Festiva de Celebração de Economia -->
      @if (celebracaoAtiva()) {
        <div class="celebration-overlay animate-fade-in">
          <div class="celebration-card animate-bounce-in">
            <div class="sparkles-container">
              <span class="sparkle s1">✨</span>
              <span class="sparkle s2">🎉</span>
              <span class="sparkle s3">⭐</span>
              <span class="sparkle s4">🏆</span>
            </div>
            <div class="piggy-icon-box">
              <span class="material-symbols-rounded piggy-icon">savings</span>
            </div>
            <h2 class="celebration-title">Economia Consciente Garantida!</h2>
            <p class="celebration-sub">
              Você desistiu da compra impulsiva de <strong>{{ itemCelebracao()?.nome }}</strong> e economizou
              <span class="gold-amount">{{ itemCelebracao()?.precoEstimado | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>!
            </p>
            <span class="porquinho-badge">🐷 Salvo com sucesso no Porquinho</span>
          </div>
        </div>
      }

      <!-- Header da Página -->
      <div class="page-header">
        <div class="header-titles">
          <h1 class="page-title">Wishlist & Consumo Consciente</h1>
          <p class="page-subtitle">Gerencie o ciclo de vida dos seus desejos e vença as compras por impulso</p>
        </div>

        <app-button
          variant="primary-gold"
          size="sm"
          icon="add"
          (btnClick)="abrirFormularioWishlist()">
          Novo Desejo
        </app-button>
      </div>

      <!-- Banner Hero com Estatísticas em Vidro (Glassmorphic Hero Card) -->
      <app-card [glow]="true">
        <div class="hero-stats-container">
          <div class="hero-main-stat">
            <span class="stat-label">ECONOMIA EVITADA ACUMULADA</span>
            <div class="stat-value-group">
              <span class="stat-big-value">{{ wishlistStore.economiaEvitadaAcumulada() | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
              <span class="stat-subtext">salvos ao desistir de compras por impulso</span>
            </div>
          </div>

          <!-- Métricas de Consumo Consciente vs Impulsivo -->
          <div class="hero-pills-grid">
            <div class="hero-stat-pill green">
              <div class="pill-header">
                <span class="material-symbols-rounded icon">psychology</span>
                <span class="val">{{ wishlistStore.taxaConclusaoConsciente() }}%</span>
              </div>
              <span class="lbl">Decisões Conscientes</span>
            </div>

            <div class="hero-stat-pill red">
              <div class="pill-header">
                <span class="material-symbols-rounded icon">bolt</span>
                <span class="val">{{ wishlistStore.taxaCompraImpulsiva() }}%</span>
              </div>
              <span class="lbl">Compras Impulsivas</span>
            </div>

            <div class="hero-stat-pill gold">
              <div class="pill-header">
                <span class="material-symbols-rounded icon">hourglass_top</span>
                <span class="val">{{ wishlistStore.itensEmEsfriamento().length }}</span>
              </div>
              <span class="lbl">Em Esfriamento</span>
            </div>

            <div class="hero-stat-pill blue">
              <div class="pill-header">
                <span class="material-symbols-rounded icon">event_available</span>
                <span class="val">{{ wishlistStore.valorTotalPlanejado() | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}</span>
              </div>
              <span class="lbl">Total Planejado</span>
            </div>
          </div>
        </div>
      </app-card>

      <!-- Abas de Navegação de Status -->
      <div class="nav-tabs-wrapper">
        <button
          class="tab-btn"
          [class.active]="wishlistStore.abaAtiva() === 'ESFRIAMENTO'"
          (click)="selecionarAba('ESFRIAMENTO')">
          <span class="material-symbols-rounded tab-icon">ac_unit</span>
          <span>Em Esfriamento (Análise)</span>
          <span class="tab-badge gold">{{ wishlistStore.itensEmEsfriamento().length }}</span>
        </button>

        <button
          class="tab-btn"
          [class.active]="wishlistStore.abaAtiva() === 'PLANEJADO'"
          (click)="selecionarAba('PLANEJADO')">
          <span class="material-symbols-rounded tab-icon">calendar_month</span>
          <span>Planejados</span>
          <span class="tab-badge blue">{{ wishlistStore.itensPlanejados().length }}</span>
        </button>

        <button
          class="tab-btn"
          [class.active]="wishlistStore.abaAtiva() === 'CONCLUIDO_DESISTIDO'"
          (click)="selecionarAba('CONCLUIDO_DESISTIDO')">
          <span class="material-symbols-rounded tab-icon">task_alt</span>
          <span>Concluídos / Desistidos</span>
          <span class="tab-badge green">{{ wishlistStore.itensConcluidosEDesistidos().length }}</span>
        </button>
      </div>

      <!-- Barra de Filtros e Busca -->
      <div class="filters-bar">
        <div class="search-input-box">
          <span class="material-symbols-rounded search-icon">search</span>
          <input
            type="text"
            placeholder="Buscar por nome, marca ou categoria..."
            [ngModel]="wishlistStore.termoBusca()"
            (ngModelChange)="wishlistStore.setTermoBusca($event)"
            class="search-input" />
        </div>

        <div class="prio-filter-pills">
          @for (p of prioridadesFiltro; track p.valor) {
            <button
              class="filter-pill"
              [class.active]="wishlistStore.filtroPrioridade() === p.valor"
              (click)="wishlistStore.setFiltroPrioridade(p.valor)">
              {{ p.label }}
            </button>
          }
        </div>
      </div>

      <!-- Seção Principal de Cards -->
      <div class="wishlist-cards-section">
        @if (wishlistStore.carregando()) {
          <div class="loading-state">
            <span class="spinner"></span>
            <p>Carregando desejos da wishlist...</p>
          </div>
        } @else if (wishlistStore.itensFiltrados().length === 0) {
          <div class="empty-state glass-card">
            <span class="material-symbols-rounded empty-icon">shopping_cart_checkout</span>
            <h3>Nenhum desejo encontrado</h3>
            <p>Adicione novos produtos para iniciar o ciclo de reflexão de consumo consciente.</p>
            <app-button variant="primary-gold" (btnClick)="abrirFormularioWishlist()">
              Cadastrar Primeiro Desejo
            </app-button>
          </div>
        } @else {
          <div class="cards-grid">
            @for (item of wishlistStore.itensFiltrados(); track item.id) {
              <div
                class="wish-card glass-card animate-slide-up"
                [class.esfriamento]="item.status === 'ESFRIAMENTO'"
                [class.planejado]="item.status === 'PLANEJADO'"
                [class.comprado]="item.status === 'COMPRADO'"
                [class.desistido]="item.status === 'DESISTIDO'">
                
                <!-- Topo do Card -->
                <div class="card-header">
                  <div class="prio-tag-box">
                    <span
                      class="prioridade-badge"
                      [style.background-color]="obterCorPrioridade(item.prioridade)">
                      <span class="material-symbols-rounded prio-icon">{{ obterIconePrioridade(item.prioridade) }}</span>
                      {{ item.prioridade }}
                    </span>

                    @if (item.categoria) {
                      <span class="categoria-badge">
                        <span class="material-symbols-rounded">{{ item.categoria.icone || 'category' }}</span>
                        {{ item.categoria.nome }}
                      </span>
                    }
                  </div>

                  <div class="card-menu-actions">
                    <button class="icon-btn-action" (click)="editarItem(item)" title="Editar">
                      <span class="material-symbols-rounded">edit</span>
                    </button>
                    <button class="icon-btn-action delete" (click)="excluirItem(item)" title="Excluir">
                      <span class="material-symbols-rounded">delete</span>
                    </button>
                  </div>
                </div>

                <!-- Conteúdo do Card -->
                <div class="card-body">
                  <div class="item-media-row">
                    <div class="media-box">
                      @if (item.imagemUrl) {
                        <img [src]="item.imagemUrl" [alt]="item.nome" class="item-img" />
                      } @else {
                        <span class="material-symbols-rounded placeholder-img">shopping_bag</span>
                      }
                    </div>

                    <div class="item-main-info">
                      <h3 class="item-title">{{ item.nome }}</h3>
                      @if (item.descricao) {
                        <p class="item-desc">{{ item.descricao }}</p>
                      }

                      <div class="item-price-box">
                        <span class="price-label">Preço Estimado:</span>
                        <span class="price-val">{{ item.precoEstimado | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Se vinculado a Meta -->
                  @if (item.meta) {
                    <div class="linked-meta-pill">
                      <span class="material-symbols-rounded icon">flag</span>
                      <span>Meta vinculada: <strong>{{ item.meta.nome }}</strong></span>
                    </div>
                  }

                  <!-- Barra de Contagem Regressiva de Esfriamento (Se em ESFRIAMENTO) -->
                  @if (item.status === 'ESFRIAMENTO') {
                    <div class="cooldown-section">
                      <div class="cooldown-header">
                        <span class="cooldown-title">
                          <span class="material-symbols-rounded icon">ac_unit</span>
                          Período de Reflexão ({{ item.diasEsfriamento }} dias)
                        </span>

                        @if (item.diasRestantesEsfriamento && item.diasRestantesEsfriamento > 0) {
                          <span class="cooldown-days-badge active">
                            Faltam {{ item.diasRestantesEsfriamento }} dia(s)
                          </span>
                        } @else {
                          <span class="cooldown-days-badge ready">
                            <span class="material-symbols-rounded">check_circle</span>
                            Esfriamento Concluído!
                          </span>
                        }
                      </div>

                      <div class="cooldown-progress-bar">
                        <div
                          class="cooldown-progress-fill"
                          [style.width.%]="calcularProgressoEsfriamento(item)"
                          [class.completed]="item.esfriamentoConcluido">
                        </div>
                      </div>
                    </div>
                  }

                  <!-- Detalhes de Conclusão / Desistência (Se COMPRADO ou DESISTIDO) -->
                  @if (item.status === 'COMPRADO') {
                    <div class="purchased-info-box" [class.impulsive]="item.quebrouDesafio">
                      <span class="material-symbols-rounded icon">
                        {{ item.quebrouDesafio ? 'bolt' : 'verified' }}
                      </span>
                      <span>
                        {{ item.quebrouDesafio ? 'Comprado antes do fim do esfriamento (Impulso)' : 'Compra Consciente efetuada' }}
                        por <strong>{{ (item.precoPago || item.precoEstimado) | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</strong>
                      </span>
                    </div>
                  }

                  @if (item.status === 'DESISTIDO') {
                    <div class="desistido-info-box">
                      <span class="material-symbols-rounded icon">savings</span>
                      <div class="desistido-text">
                        <strong>Economia de {{ (item.economiaEvitada || item.precoEstimado) | currency:'BRL':'symbol':'1.2-2':'pt-BR' }} evitada!</strong>
                        @if (item.motivoDesistencia) {
                          <p>{{ item.motivoDesistencia }}</p>
                        }
                      </div>
                    </div>
                  }
                </div>

                <!-- Botões de Ações Rápidas -->
                <div class="card-footer-actions">
                  @if (item.status === 'ESFRIAMENTO' || item.status === 'PLANEJADO') {
                    <app-button
                      variant="primary-gold"
                      size="sm"
                      icon="shopping_cart"
                      (btnClick)="iniciarCompra(item)">
                      Comprar
                    </app-button>

                    <app-button
                      variant="secondary-glass"
                      size="sm"
                      icon="price_change"
                      (btnClick)="abrirComparadorCotacoes(item)">
                      Cotações
                    </app-button>

                    @if (item.status === 'ESFRIAMENTO') {
                      <app-button
                        variant="secondary-glass"
                        size="sm"
                        icon="calendar_month"
                        (btnClick)="planejarItem(item)">
                        Planejar
                      </app-button>
                    }

                    <button
                      type="button"
                      class="btn-action-desistir"
                      (click)="desistirItem(item)">
                      <span class="material-symbols-rounded">savings</span>
                      Salvar no Porquinho
                    </button>
                  } @else {
                    <app-button
                      variant="secondary-glass"
                      size="sm"
                      icon="price_change"
                      (btnClick)="abrirComparadorCotacoes(item)">
                      Cotações
                    </app-button>
                    <span class="concluded-date-text">
                      Finalizado em: {{ item.dataConclusao | date:'dd/MM/yyyy' }}
                    </span>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .wishlist-page {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 840px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .page-title {
      font-size: 22px;
      font-weight: 800;
      color: var(--alic-color-gold-light, #ebd9b6);
      margin: 0;
    }

    .page-subtitle {
      font-size: 13px;
      color: rgba(235, 217, 182, 0.6);
      margin: 4px 0 0 0;
    }

    .hero-stats-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .hero-main-stat {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .stat-label {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1px;
      color: rgba(235, 217, 182, 0.6);
    }

    .stat-value-group {
      display: flex;
      align-items: baseline;
      gap: 12px;
      flex-wrap: wrap;
    }

    .stat-big-value {
      font-size: 28px;
      font-weight: 800;
      color: #10b981;
      text-shadow: 0 0 12px rgba(16, 185, 129, 0.3);
    }

    .stat-subtext {
      font-size: 12px;
      color: rgba(235, 217, 182, 0.7);
    }

    .hero-pills-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      border-top: 1px dashed rgba(216, 184, 126, 0.2);
      padding-top: 14px;
    }

    .hero-stat-pill {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.03);
      padding: 8px 6px;
      border-radius: 12px;
      border: 1px solid rgba(216, 184, 126, 0.15);

      .pill-header {
        display: flex;
        align-items: center;
        gap: 4px;

        .icon { font-size: 16px; }
        .val { font-size: 15px; font-weight: 800; }
      }

      .lbl {
        font-size: 10px;
        color: rgba(235, 217, 182, 0.6);
        margin-top: 2px;
        white-space: nowrap;
      }

      &.green { .pill-header { color: #10b981; } }
      &.red { .pill-header { color: #f44336; } }
      &.gold { .pill-header { color: #d8b87e; } }
      &.blue { .pill-header { color: #0288d1; } }
    }

    .nav-tabs-wrapper {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 4px;
    }

    .tab-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(216, 184, 126, 0.15);
      color: rgba(235, 217, 182, 0.7);
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s ease;

      .tab-icon { font-size: 18px; }

      &:hover {
        background: rgba(216, 184, 126, 0.12);
        color: #ffffff;
      }

      &.active {
        background: var(--alic-color-gold-gradient, linear-gradient(135deg, #d8b87e 0%, #c19b56 100%));
        color: #2b0b10;
        border-color: #d8b87e;
        box-shadow: 0 0 12px rgba(216, 184, 126, 0.3);

        .tab-badge {
          background: rgba(43, 11, 16, 0.2);
          color: #2b0b10;
        }
      }
    }

    .tab-badge {
      padding: 2px 7px;
      border-radius: 999px;
      font-size: 10px;
      font-weight: 800;
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
    }

    .filters-bar {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .search-input-box {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(216, 184, 126, 0.2);
      border-radius: 12px;
      padding: 0 12px;
      height: 42px;

      .search-icon { font-size: 20px; color: rgba(235, 217, 182, 0.5); }
    }

    .search-input {
      flex: 1;
      background: transparent;
      border: none;
      color: #ffffff;
      font-size: 13px;
      outline: none;

      &::placeholder {
        color: rgba(235, 217, 182, 0.4);
      }
    }

    .prio-filter-pills {
      display: flex;
      gap: 6px;
      overflow-x: auto;
    }

    .filter-pill {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(216, 184, 126, 0.15);
      border-radius: 999px;
      color: rgba(235, 217, 182, 0.6);
      padding: 4px 12px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;

      &.active {
        background: rgba(216, 184, 126, 0.2);
        color: var(--alic-color-gold-light);
        border-color: var(--alic-color-gold-main);
      }
    }

    .cards-grid {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .wish-card {
      padding: 16px;
      border-radius: 20px;
      background: rgba(31, 26, 27, 0.75);
      border: 1px solid rgba(216, 184, 126, 0.25);
      display: flex;
      flex-direction: column;
      gap: 14px;

      &.comprado { border-color: rgba(16, 185, 129, 0.4); }
      &.desistido { border-color: rgba(201, 167, 78, 0.4); }
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .prio-tag-box {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .prioridade-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px;
      border-radius: 8px;
      color: #ffffff;
      font-size: 10px;
      font-weight: 800;

      .prio-icon { font-size: 14px; }
    }

    .categoria-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      color: rgba(235, 217, 182, 0.6);

      span { font-size: 14px; }
    }

    .card-menu-actions {
      display: flex;
      gap: 4px;
    }

    .icon-btn-action {
      background: none;
      border: none;
      color: rgba(235, 217, 182, 0.5);
      cursor: pointer;
      padding: 4px;
      border-radius: 6px;

      &:hover { color: #ffffff; background: rgba(255, 255, 255, 0.1); }
      &.delete:hover { color: #f44336; background: rgba(244, 67, 54, 0.15); }
      span { font-size: 18px; }
    }

    .card-body {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .item-media-row {
      display: flex;
      gap: 14px;
      align-items: center;
    }

    .media-box {
      width: 64px;
      height: 64px;
      border-radius: 14px;
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(216, 184, 126, 0.2);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      .item-img { width: 100%; height: 100%; object-fit: cover; }
      .placeholder-img { font-size: 28px; color: var(--alic-color-gold-main); }
    }

    .item-main-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .item-title {
      font-size: 16px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }

    .item-desc {
      font-size: 12px;
      color: rgba(235, 217, 182, 0.6);
      margin: 2px 0 4px 0;
    }

    .item-price-box {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .price-label {
      font-size: 11px;
      color: rgba(235, 217, 182, 0.5);
    }

    .price-val {
      font-size: 16px;
      font-weight: 800;
      color: var(--alic-color-gold-light);
    }

    .linked-meta-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(201, 167, 78, 0.1);
      border: 1px solid rgba(201, 167, 78, 0.25);
      border-radius: 10px;
      padding: 6px 10px;
      font-size: 11px;
      color: var(--alic-color-gold-light);

      .icon { font-size: 16px; color: var(--alic-color-gold-main); }
      strong { color: #ffffff; }
    }

    .cooldown-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid rgba(216, 184, 126, 0.2);
      border-radius: 12px;
      padding: 10px 12px;
    }

    .cooldown-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .cooldown-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 700;
      color: rgba(235, 217, 182, 0.8);

      .icon { font-size: 16px; color: #0288d1; }
    }

    .cooldown-days-badge {
      font-size: 10px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 999px;

      &.active {
        background: rgba(2, 136, 209, 0.2);
        color: #0288d1;
        border: 1px solid rgba(2, 136, 209, 0.3);
      }

      &.ready {
        background: rgba(16, 185, 129, 0.2);
        color: #10b981;
        border: 1px solid rgba(16, 185, 129, 0.3);
        display: inline-flex;
        align-items: center;
        gap: 3px;

        span { font-size: 12px; }
      }
    }

    .cooldown-progress-bar {
      width: 100%;
      height: 8px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 4px;
      overflow: hidden;
    }

    .cooldown-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #0288d1 0%, #c9a74e 100%);
      border-radius: 4px;
      transition: width 0.4s ease;

      &.completed {
        background: linear-gradient(90deg, #10b981 0%, #059669 100%);
      }
    }

    .purchased-info-box {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 10px;
      padding: 8px 12px;
      font-size: 12px;
      color: #10b981;

      .icon { font-size: 18px; }
      strong { color: #ffffff; }

      &.impulsive {
        background: rgba(244, 67, 54, 0.1);
        border-color: rgba(244, 67, 54, 0.3);
        color: #f44336;
      }
    }

    .desistido-info-box {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      background: rgba(201, 167, 78, 0.12);
      border: 1px solid rgba(201, 167, 78, 0.3);
      border-radius: 12px;
      padding: 10px 12px;

      .icon { font-size: 22px; color: var(--alic-color-gold-main); flex-shrink: 0; }
    }

    .desistido-text {
      display: flex;
      flex-direction: column;
      gap: 2px;

      strong { font-size: 12px; color: var(--alic-color-gold-light); }
      p { font-size: 11px; color: rgba(235, 217, 182, 0.7); margin: 0; }
    }

    .card-footer-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      border-top: 1px solid rgba(216, 184, 126, 0.15);
      padding-top: 12px;
      flex-wrap: wrap;
    }

    .btn-action-desistir {
      background: rgba(201, 167, 78, 0.15);
      border: 1px solid rgba(201, 167, 78, 0.35);
      color: var(--alic-color-gold-light);
      border-radius: 10px;
      padding: 6px 12px;
      font-size: 11px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      transition: all 0.2s ease;

      span { font-size: 16px; }

      &:hover {
        background: rgba(201, 167, 78, 0.25);
        color: #ffffff;
      }
    }

    .concluded-date-text {
      font-size: 11px;
      color: rgba(235, 217, 182, 0.5);
    }

    /* Animação Festiva de Economia Evitada */
    .celebration-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(8px);
      z-index: 300;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .celebration-card {
      background: linear-gradient(135deg, #2b0b10 0%, #4a121a 100%);
      border: 2px solid #d8b87e;
      border-radius: 28px;
      padding: 28px 24px;
      max-width: 400px;
      width: 100%;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      box-shadow: 0 10px 50px rgba(216, 184, 126, 0.4);
      position: relative;
    }

    .piggy-icon-box {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: var(--alic-color-gold-gradient);
      color: #2b0b10;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 30px rgba(216, 184, 126, 0.6);

      .piggy-icon { font-size: 40px; }
    }

    .celebration-title {
      font-size: 20px;
      font-weight: 800;
      color: var(--alic-color-gold-light);
      margin: 0;
    }

    .celebration-sub {
      font-size: 13px;
      color: rgba(235, 217, 182, 0.8);
      margin: 0;
      line-height: 1.5;

      .gold-amount {
        color: #10b981;
        font-weight: 800;
        font-size: 16px;
      }
    }

    .porquinho-badge {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 999px;
      background: rgba(216, 184, 126, 0.2);
      border: 1px solid #d8b87e;
      color: var(--alic-color-gold-light);
      font-size: 12px;
      font-weight: 700;
    }

    .sparkles-container {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .sparkle {
      position: absolute;
      font-size: 24px;
      animation: floatSparkle 2s ease-in-out infinite alternate;

      &.s1 { top: 10px; left: 20px; }
      &.s2 { top: 15px; right: 25px; animation-delay: 0.3s; }
      &.s3 { bottom: 20px; left: 30px; animation-delay: 0.6s; }
      &.s4 { bottom: 15px; right: 20px; animation-delay: 0.9s; }
    }

    @keyframes floatSparkle {
      from { transform: translateY(0) scale(0.9); }
      to { transform: translateY(-10px) scale(1.2); }
    }

    .empty-state {
      padding: 32px 20px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      border-radius: 20px;

      .empty-icon { font-size: 48px; color: var(--alic-color-gold-main, #d8b87e); }
      h3 { font-size: 18px; color: #ebd9b6; margin: 0; }
      p { font-size: 13px; color: rgba(235, 217, 182, 0.6); margin: 0; max-width: 320px; }
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px;
      gap: 12px;
      color: var(--alic-color-gold-light);

      .spinner {
        width: 24px;
        height: 24px;
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
export class WishlistPage implements OnInit {
  readonly wishlistStore = inject(WishlistStore);
  private readonly overlayService = inject(OverlayService);
  private readonly toastService = inject(ToastService);
  private readonly haptics = inject(HapticsService);
  private readonly fabRegistry = inject(FabActionRegistryService);

  readonly celebracaoAtiva = signal<boolean>(false);
  readonly itemCelebracao = signal<ItemWishlist | null>(null);

  readonly prioridadesFiltro: Array<{ valor: PrioridadeWishlist | 'TODOS'; label: string }> = [
    { valor: 'TODOS', label: 'Todas Prioridades' },
    { valor: 'URGENTE', label: 'Urgente' },
    { valor: 'ALTA', label: 'Alta' },
    { valor: 'MEDIA', label: 'Média' },
    { valor: 'BAIXA', label: 'Baixa' },
  ];

  ngOnInit(): void {
    this.wishlistStore.carregarWishlist();

    this.fabRegistry.registerAction({
      id: 'novo-desejo-wishlist',
      label: '+ Novo Desejo',
      icon: 'shopping_bag',
      color: '#A13D63',
      priority: 95,
      execute: () => this.abrirFormularioWishlist(),
    });
  }

  selecionarAba(aba: 'ESFRIAMENTO' | 'PLANEJADO' | 'CONCLUIDO_DESISTIDO'): void {
    this.haptics.impactLight();
    this.wishlistStore.setAbaAtiva(aba);
  }

  abrirFormularioWishlist(item?: ItemWishlist): void {
    this.haptics.impactMedium();
    this.overlayService.openBottomSheet({
      component: FormularioWishlistComponent,
      title: item ? 'Editar Desejo' : 'Novo Desejo de Consumo',
      data: { item },
    });
  }

  abrirComparadorCotacoes(item: ItemWishlist): void {
    this.haptics.impactMedium();
    this.overlayService.openBottomSheet({
      component: DrawerCotacoesComponent,
      title: 'Motor de Cotações & Comparador de Preços',
      data: { itemWishlist: item },
    });
  }

  editarItem(item: ItemWishlist): void {
    this.abrirFormularioWishlist(item);
  }

  async excluirItem(item: ItemWishlist): Promise<void> {
    if (confirm(`Deseja remover "${item.nome}" da wishlist?`)) {
      this.haptics.impactMedium();
      await this.wishlistStore.removerItem(item.id);
      this.toastService.showSuccess(`Item "${item.nome}" removido!`);
    }
  }

  async iniciarCompra(item: ItemWishlist): Promise<void> {
    // Se o item está em esfriamento E ainda restam dias: Abre Modal de Quebra de Desafio de Impulso!
    if (item.status === 'ESFRIAMENTO' && item.diasRestantesEsfriamento && item.diasRestantesEsfriamento > 0) {
      this.haptics.impactMedium();
      const res = await firstValueFrom(
        this.overlayService.openBottomSheet<ModalQuebraDesafioComponent, { item: ItemWishlist }, { confirm: boolean }>({
          component: ModalQuebraDesafioComponent,
          title: 'Quebra de Desafio de Impulso',
          data: { item },
        })
      );

      if (res?.confirm) {
        // Confirmou quebra de desafio!
        await this.wishlistStore.comprarItem(item.id, { precoPago: item.precoEstimado }, true);
        this.toastService.showWarning(`Compra de "${item.nome}" efetuada com alerta de quebra de desafio.`);
      }
    } else {
      // Esfriamento concluído ou item planejado: Compra Consciente!
      this.haptics.impactMedium();
      await this.wishlistStore.comprarItem(item.id, { precoPago: item.precoEstimado }, false);
      this.toastService.showSuccess(`🎉 Parabéns! Compra consciente de "${item.nome}" registrada!`);
    }
  }

  async planejarItem(item: ItemWishlist): Promise<void> {
    this.haptics.impactMedium();
    await this.wishlistStore.planejarItem(item.id);
    this.toastService.showSuccess(`Item "${item.nome}" movido para a aba de Planejados!`);
  }

  async desistirItem(item: ItemWishlist): Promise<void> {
    this.haptics.impactMedium();
    await this.wishlistStore.desistirItem(item.id, {
      motivoDesistencia: 'Percebi que não era essencial e direcionei para economia consciente!',
    });

    // Ativa efeito festivo visual de celebração de economia evitada
    this.itemCelebracao.set(item);
    this.celebracaoAtiva.set(true);

    setTimeout(() => {
      this.celebracaoAtiva.set(false);
      this.itemCelebracao.set(null);
    }, 3200);
  }

  calcularProgressoEsfriamento(item: ItemWishlist): number {
    const total = item.diasEsfriamento || 7;
    const restantes = item.diasRestantesEsfriamento || 0;
    const decorridos = Math.max(0, total - restantes);
    const pct = (decorridos / total) * 100;
    return Math.min(100, Math.max(0, Number(pct.toFixed(1))));
  }

  obterCorPrioridade(prio: PrioridadeWishlist): string {
    switch (prio) {
      case 'URGENTE': return '#f44336';
      case 'ALTA': return '#C9A74E';
      case 'MEDIA': return '#0288d1';
      case 'BAIXA': return '#9e9e9e';
      default: return '#C9A74E';
    }
  }

  obterIconePrioridade(prio: PrioridadeWishlist): string {
    switch (prio) {
      case 'URGENTE': return 'priority_high';
      case 'ALTA': return 'arrow_upward';
      case 'MEDIA': return 'remove';
      case 'BAIXA': return 'arrow_downward';
      default: return 'flag';
    }
  }
}
