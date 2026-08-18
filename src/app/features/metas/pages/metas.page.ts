import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MetasStore } from '../store/metas.store';
import { OverlayService } from '../../../core/services/overlay.service';
import { ToastService } from '../../../core/services/toast.service';
import { HapticsService } from '../../../core/platform/haptics.service';
import { FabActionRegistryService } from '../../../core/services/fab-action-registry.service';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { FormularioMetaComponent } from '../components/formulario-meta.component';
import { FormularioAporteComponent } from '../components/formulario-aporte.component';
import { Meta, StatusMeta } from '../../../core/models/meta.models';

@Component({
  selector: 'app-metas-page',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, CardComponent, ButtonComponent, BadgeComponent],
  template: `
    <div class="metas-page animate-fade-in">
      <!-- Header da Página -->
      <div class="page-header">
        <div class="header-titles">
          <h1 class="page-title">Metas Financeiras</h1>
          <p class="page-subtitle">Planeje, acompanhe o ritmo e conquiste seus maiores objetivos</p>
        </div>

        <app-button
          variant="primary-gold"
          size="sm"
          icon="add"
          (btnClick)="abrirFormularioMeta()">
          Nova Meta
        </app-button>
      </div>

      <!-- Card Consolidado Geral de Metas -->
      <app-card [glow]="true">
        <div class="global-summary">
          <div class="summary-top">
            <div class="summary-info">
              <span class="summary-label">CONSOLIDADO EM METAS</span>
              <div class="summary-values">
                <span class="spent-value">{{ metasStore.totalAcumuladoConsolidado() | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
                <span class="limit-value"> de {{ metasStore.totalAlvoConsolidado() | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
              </div>
            </div>

            <app-badge variant="gold">
              {{ metasStore.percentualGlobalMetas() }}% Concluído
            </app-badge>
          </div>

          <!-- Barra de Progresso Consolidada -->
          <div class="progress-bar-container">
            <div
              class="progress-bar-fill"
              [style.width.%]="mathMin(metasStore.percentualGlobalMetas(), 100)">
            </div>
          </div>

          <div class="summary-bottom">
            <span class="remaining-text">
              Restante total a conquistar: {{ metasStore.restanteConsolidado() | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
            </span>
          </div>

          <!-- Pílulas de Estatísticas de Metas -->
          <div class="stats-pills-row">
            <div class="stat-pill">
              <span class="pill-value gold">{{ metasStore.metasEmAndamento().length }}</span>
              <span class="pill-label">Em andamento</span>
            </div>

            <div class="stat-pill">
              <span class="pill-value green">{{ metasStore.metasConcluidas().length }}</span>
              <span class="pill-label">Concluídas</span>
            </div>

            <div class="stat-pill">
              <span class="pill-value positive">{{ metasStore.metasNoPrazo() }}</span>
              <span class="pill-label">No prazo</span>
            </div>

            @if (metasStore.metasAtrasadas() > 0) {
              <div class="stat-pill">
                <span class="pill-value red">{{ metasStore.metasAtrasadas() }}</span>
                <span class="pill-label">Atrasadas</span>
              </div>
            }
          </div>
        </div>
      </app-card>

      <!-- Seção Principal de Metas -->
      <div class="metas-section">
        <div class="section-title">
          <h2>Seus Objetivos ({{ metasStore.metas().length }})</h2>
        </div>

        @if (metasStore.carregando()) {
          <div class="loading-state">
            <span class="spinner"></span>
            <p>Carregando metas financeiras...</p>
          </div>
        } @else if (metasStore.metas().length === 0) {
          <div class="empty-state glass-card">
            <span class="material-symbols-rounded empty-icon">flag</span>
            <h3>Nenhuma meta cadastrada</h3>
            <p>Defina objetivos financeiros como viagem, reserva de emergência ou compras futuras para planejar seu ritmo.</p>
            <app-button variant="primary-gold" (btnClick)="abrirFormularioMeta()">
              Criar Primeira Meta
            </app-button>
          </div>
        } @else {
          <div class="metas-cards-grid">
            @for (meta of metasStore.metas(); track meta.id) {
              <div class="meta-card glass-card animate-slide-up" [class.concluida]="meta.status === 'CONCLUIDA'">
                <!-- Topo do Card de Meta -->
                <div class="meta-card-header">
                  <div class="meta-title-group">
                    <div
                      class="meta-icon-box"
                      [style.background-color]="meta.cor || '#C9A74E'">
                      <span class="material-symbols-rounded">{{ meta.icone || 'flag' }}</span>
                    </div>

                    <div class="meta-name-wrap">
                      <h3 class="meta-name">{{ meta.nome }}</h3>
                      @if (meta.descricao) {
                        <p class="meta-desc">{{ meta.descricao }}</p>
                      }
                    </div>
                  </div>

                  <div class="meta-header-actions">
                    <app-badge [variant]="obterStatusBadgeVariant(meta.status)">
                      {{ obterStatusLabel(meta.status) }}
                    </app-badge>

                    <div class="dropdown-actions">
                      <button class="icon-action-btn" (click)="editarMeta(meta)" title="Editar Meta">
                        <span class="material-symbols-rounded">edit</span>
                      </button>
                      <button class="icon-action-btn delete" (click)="excluirMeta(meta)" title="Excluir Meta">
                        <span class="material-symbols-rounded">delete</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Progresso e Valores -->
                <div class="meta-progress-section">
                  <div class="progress-labels">
                    <span class="acumulado-text">
                      Acumulado: <strong>{{ meta.valorAtual | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</strong>
                    </span>
                    <span class="alvo-text">
                      Alvo: <strong>{{ meta.valorAlvo | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</strong>
                    </span>
                  </div>

                  <!-- Visual Progress Bar / Target vs Acumulado 100% derivado -->
                  <div class="meta-bar-wrapper">
                    <div
                      class="meta-bar-fill"
                      [style.width.%]="mathMin(meta.percentualConcluido, 100)"
                      [style.background-color]="meta.cor || '#C9A74E'">
                    </div>
                  </div>

                  <div class="progress-sub-info">
                    <span class="pct-badge">{{ meta.percentualConcluido }}% concluído</span>
                    <span class="restante-badge">Faltam {{ (meta.valorAlvo - meta.valorAtual) | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
                  </div>
                </div>

                <!-- Painel de Ritmo & Projeção de Alcance -->
                @if (meta.status !== 'CONCLUIDA') {
                  <div class="ritmo-panel">
                    <div class="ritmo-item">
                      <span class="material-symbols-rounded ritmo-icon">schedule</span>
                      <div class="ritmo-text">
                        <span class="ritmo-label">Prazo</span>
                        <span class="ritmo-val">{{ meta.prazo | date:'dd/MM/yyyy' }} ({{ meta.diasRestantes }} dias)</span>
                      </div>
                    </div>

                    <div class="ritmo-item">
                      <span class="material-symbols-rounded ritmo-icon">trending_up</span>
                      <div class="ritmo-text">
                        <span class="ritmo-label">Ritmo Mensal Recomendado</span>
                        <span class="ritmo-val gold">{{ meta.ritmoMensalEstimado | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}/mês</span>
                      </div>
                    </div>

                    <div class="ritmo-item indicator">
                      @if (meta.projetadoPrazo !== false && meta.status !== 'ATRASADA') {
                        <span class="indicator-tag positive">
                          <span class="material-symbols-rounded">check_circle</span>
                          No prazo
                        </span>
                      } @else {
                        <span class="indicator-tag negative">
                          <span class="material-symbols-rounded">warning</span>
                          Atrasado
                        </span>
                      }
                    </div>
                  </div>
                }

                <!-- Botões de Ação do Card -->
                <div class="meta-card-footer">
                  @if (meta.status !== 'CONCLUIDA') {
                    <app-button
                      variant="primary-gold"
                      size="sm"
                      icon="payments"
                      (btnClick)="abrirFormularioAporte(meta)">
                      Aportar
                    </app-button>
                  }

                  <button
                    class="history-toggle-btn"
                    (click)="toggleHistorico(meta.id)">
                    <span class="material-symbols-rounded">history</span>
                    <span>{{ isHistoricoAberto(meta.id) ? 'Ocultar Histórico' : 'Ver Detalhes (' + (meta.aportes?.length || 0) + ')' }}</span>
                    <span class="material-symbols-rounded arrow">{{ isHistoricoAberto(meta.id) ? 'expand_less' : 'expand_more' }}</span>
                  </button>
                </div>

                <!-- Accordion do Histórico de Aportes -->
                @if (isHistoricoAberto(meta.id)) {
                  <div class="historico-drawer animate-slide-up">
                    <h4 class="historico-title">Histórico de Aportes</h4>

                    @if (!meta.aportes || meta.aportes.length === 0) {
                      <p class="no-aportes-text">Nenhum aporte registrado nesta meta.</p>
                    } @else {
                      <div class="aportes-list">
                        @for (ap of meta.aportes; track ap.id) {
                          <div class="aporte-item">
                            <div class="aporte-left">
                              <span class="material-symbols-rounded aporte-icon">add_circle</span>
                              <div class="aporte-details">
                                <span class="aporte-valor">+ {{ ap.valor | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
                                @if (ap.observacao) {
                                  <span class="aporte-obs">{{ ap.observacao }}</span>
                                }
                              </div>
                            </div>
                            <div class="aporte-right">
                              <span class="aporte-data">{{ ap.data | date:'dd/MM/yyyy' }}</span>
                              <button
                                class="btn-del-aporte"
                                (click)="removerAporte(meta.id, ap.id)"
                                title="Remover este aporte">
                                <span class="material-symbols-rounded">close</span>
                              </button>
                            </div>
                          </div>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .metas-page {
      padding: 16px 16px calc(60px + var(--sab)) 16px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 800px;
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

    .global-summary {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .summary-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    }

    .summary-label {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1px;
      color: rgba(235, 217, 182, 0.6);
    }

    .summary-values {
      margin-top: 4px;
    }

    .spent-value {
      font-size: 24px;
      font-weight: 800;
      color: #ffffff;
    }

    .limit-value {
      font-size: 14px;
      color: rgba(235, 217, 182, 0.65);
    }

    .progress-bar-container {
      width: 100%;
      height: 10px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 6px;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      background: var(--alic-color-gold-gradient, linear-gradient(135deg, #d8b87e 0%, #c19b56 100%));
      border-radius: 6px;
      box-shadow: 0 0 12px rgba(216, 184, 126, 0.4);
      transition: width 0.4s ease;
    }

    .summary-bottom {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      font-weight: 600;
      color: rgba(235, 217, 182, 0.8);
    }

    .stats-pills-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
      gap: 8px;
      border-top: 1px dashed rgba(216, 184, 126, 0.2);
      padding-top: 12px;
      margin-top: 4px;
    }

    .stat-pill {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: rgba(255, 255, 255, 0.03);
      padding: 6px 8px;
      border-radius: 10px;
      border: 1px solid rgba(216, 184, 126, 0.15);
    }

    .pill-value {
      font-size: 16px;
      font-weight: 800;

      &.gold { color: var(--alic-color-gold-main, #d8b87e); }
      &.green { color: #4caf50; }
      &.positive { color: #10b981; }
      &.red { color: #f44336; }
    }

    .pill-label {
      font-size: 10px;
      color: rgba(235, 217, 182, 0.6);
      white-space: nowrap;
    }

    .metas-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .section-title h2 {
      font-size: 16px;
      font-weight: 700;
      color: #ebd9b6;
      margin: 0;
    }

    .metas-cards-grid {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .meta-card {
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      border-radius: 20px;
      background: rgba(31, 26, 27, 0.7);
      border: 1px solid rgba(216, 184, 126, 0.25);
      position: relative;

      &.concluida {
        border-color: rgba(76, 175, 80, 0.4);
      }
    }

    .meta-card-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    }

    .meta-title-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .meta-icon-box {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

      span { font-size: 24px; }
    }

    .meta-name {
      font-size: 16px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }

    .meta-desc {
      font-size: 12px;
      color: rgba(235, 217, 182, 0.6);
      margin: 2px 0 0 0;
    }

    .meta-header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .dropdown-actions {
      display: flex;
      align-items: center;
      gap: 2px;
    }

    .icon-action-btn {
      background: none;
      border: none;
      color: rgba(235, 217, 182, 0.5);
      cursor: pointer;
      padding: 4px;
      border-radius: 6px;

      &:hover {
        color: var(--alic-color-gold-light);
        background: rgba(216, 184, 126, 0.15);
      }

      &.delete:hover {
        color: #f44336;
        background: rgba(244, 67, 54, 0.15);
      }

      span { font-size: 18px; }
    }

    .meta-progress-section {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .progress-labels {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      color: rgba(235, 217, 182, 0.7);

      strong { color: #ffffff; }
    }

    .meta-bar-wrapper {
      width: 100%;
      height: 10px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 5px;
      overflow: hidden;
    }

    .meta-bar-fill {
      height: 100%;
      border-radius: 5px;
      transition: width 0.4s ease;
    }

    .progress-sub-info {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: rgba(235, 217, 182, 0.6);
    }

    .ritmo-panel {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(216, 184, 126, 0.15);
      border-radius: 12px;
      padding: 10px 12px;
      align-items: center;
    }

    .ritmo-item {
      display: flex;
      align-items: center;
      gap: 6px;

      &.indicator {
        justify-content: flex-end;
      }
    }

    .ritmo-icon {
      font-size: 18px;
      color: var(--alic-color-gold-main, #d8b87e);
    }

    .ritmo-text {
      display: flex;
      flex-direction: column;
    }

    .ritmo-label {
      font-size: 10px;
      color: rgba(235, 217, 182, 0.5);
    }

    .ritmo-val {
      font-size: 11px;
      font-weight: 700;
      color: #ffffff;

      &.gold { color: var(--alic-color-gold-light, #ebd9b6); }
    }

    .indicator-tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;

      span { font-size: 14px; }

      &.positive {
        background: rgba(46, 125, 50, 0.2);
        color: #4caf50;
        border: 1px solid rgba(76, 175, 80, 0.3);
      }

      &.negative {
        background: rgba(244, 67, 54, 0.2);
        color: #f44336;
        border: 1px solid rgba(244, 67, 54, 0.3);
      }
    }

    .meta-card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      border-top: 1px solid rgba(216, 184, 126, 0.15);
      padding-top: 12px;
    }

    .history-toggle-btn {
      background: none;
      border: none;
      color: rgba(235, 217, 182, 0.7);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 10px;
      border-radius: 8px;
      transition: background 0.2s ease;

      &:hover {
        background: rgba(216, 184, 126, 0.1);
        color: #ffffff;
      }

      span { font-size: 16px; }
      .arrow { font-size: 18px; }
    }

    .historico-drawer {
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid rgba(216, 184, 126, 0.15);
      border-radius: 12px;
      padding: 12px;
      margin-top: 4px;
    }

    .historico-title {
      font-size: 12px;
      font-weight: 700;
      color: var(--alic-color-gold-light, #ebd9b6);
      margin: 0;
    }

    .no-aportes-text {
      font-size: 12px;
      color: rgba(235, 217, 182, 0.5);
      margin: 0;
    }

    .aportes-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .aporte-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 10px;
      background: rgba(255, 255, 255, 0.04);
      border-radius: 8px;
    }

    .aporte-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .aporte-icon {
      font-size: 18px;
      color: #4caf50;
    }

    .aporte-details {
      display: flex;
      flex-direction: column;
    }

    .aporte-valor {
      font-size: 13px;
      font-weight: 700;
      color: #ffffff;
    }

    .aporte-obs {
      font-size: 10px;
      color: rgba(235, 217, 182, 0.6);
    }

    .aporte-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .aporte-data {
      font-size: 11px;
      color: rgba(235, 217, 182, 0.5);
    }

    .btn-del-aporte {
      background: none;
      border: none;
      color: rgba(235, 217, 182, 0.4);
      cursor: pointer;
      padding: 2px;
      display: flex;
      align-items: center;

      &:hover { color: #f44336; }
      span { font-size: 16px; }
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
export class MetasPage implements OnInit {
  readonly metasStore = inject(MetasStore);
  private readonly overlayService = inject(OverlayService);
  private readonly toastService = inject(ToastService);
  private readonly haptics = inject(HapticsService);
  private readonly fabRegistry = inject(FabActionRegistryService);

  readonly historicosAbertos = signal<Set<string>>(new Set());

  ngOnInit(): void {
    this.metasStore.carregarMetas();

    this.fabRegistry.registerAction({
      id: 'nova-meta',
      label: '+ Nova Meta',
      icon: 'flag',
      color: '#d8b87e',
      priority: 90,
      execute: () => this.abrirFormularioMeta(),
    });
  }

  abrirFormularioMeta(meta?: Meta): void {
    this.haptics.impactMedium();
    this.overlayService.openBottomSheet({
      component: FormularioMetaComponent,
      title: meta ? 'Editar Meta' : 'Nova Meta Financeira',
      data: { meta },
    });
  }

  editarMeta(meta: Meta): void {
    this.abrirFormularioMeta(meta);
  }

  async excluirMeta(meta: Meta): Promise<void> {
    this.haptics.impactMedium();
    if (confirm(`Deseja remover a meta "${meta.nome}"?`)) {
      const ok = await this.metasStore.removerMeta(meta.id);
      if (ok) {
        this.toastService.showSuccess(`Meta "${meta.nome}" removida.`);
      }
    }
  }

  abrirFormularioAporte(meta: Meta): void {
    this.haptics.impactMedium();
    this.overlayService.openBottomSheet({
      component: FormularioAporteComponent,
      title: 'Realizar Aporte',
      data: { meta },
    });
  }

  toggleHistorico(metaId: string): void {
    this.haptics.impactLight();
    this.historicosAbertos.update((set) => {
      const novoSet = new Set(set);
      if (novoSet.has(metaId)) {
        novoSet.delete(metaId);
      } else {
        novoSet.add(metaId);
      }
      return novoSet;
    });
  }

  isHistoricoAberto(metaId: string): boolean {
    return this.historicosAbertos().has(metaId);
  }

  async removerAporte(metaId: string, aporteId: string): Promise<void> {
    this.haptics.impactMedium();
    if (confirm('Deseja cancelar/remover este aporte?')) {
      const ok = await this.metasStore.removerAporte(metaId, aporteId);
      if (ok) {
        this.toastService.showSuccess('Aporte removido com sucesso.');
      }
    }
  }

  mathMin(val: number, max: number): number {
    return Math.min(val, max);
  }

  obterStatusBadgeVariant(status: StatusMeta): 'positive' | 'negative' | 'gold' | 'neutral' {
    switch (status) {
      case 'CONCLUIDA':
        return 'positive';
      case 'EM_ANDAMENTO':
        return 'gold';
      case 'ATRASADA':
        return 'negative';
      case 'CANCELADA':
        return 'neutral';
      default:
        return 'gold';
    }
  }

  obterStatusLabel(status: StatusMeta): string {
    switch (status) {
      case 'CONCLUIDA':
        return 'Concluída';
      case 'EM_ANDAMENTO':
        return 'Em andamento';
      case 'ATRASADA':
        return 'Atrasada';
      case 'CANCELADA':
        return 'Cancelada';
      default:
        return 'Em andamento';
    }
  }
}
