import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ProjetosStore } from '../store/projetos.store';
import { OverlayService } from '../../../core/services/overlay.service';
import { ToastService } from '../../../core/services/toast.service';
import { HapticsService } from '../../../core/platform/haptics.service';
import { FabActionRegistryService } from '../../../core/services/fab-action-registry.service';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { FormularioProjetoComponent } from '../components/formulario-projeto.component';
import { ProjetoReadModel, StatusProjeto } from '../../../core/models/projeto.models';

@Component({
  selector: 'app-projetos-page',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, CardComponent, ButtonComponent, BadgeComponent],
  template: `
    <div class="projetos-page animate-fade-in">
      <!-- Header da Página -->
      <div class="page-header">
        <div class="header-titles">
          <h1 class="page-title">Projetos de Longo Prazo</h1>
          <p class="page-subtitle">Estruture grandes realizações, planeje etapas e monitore a viabilidade financeira</p>
        </div>

        <app-button
          variant="primary-gold"
          size="sm"
          icon="add"
          (btnClick)="abrirFormularioProjeto()">
          Novo Projeto
        </app-button>
      </div>

      <!-- Hero Card Consolidado de Projetos -->
      <app-card [glow]="true">
        <div class="global-summary">
          <div class="summary-top">
            <div class="summary-info">
              <span class="summary-label">TOTAL CONSOLIDADO EM PROJETOS</span>
              <div class="summary-values">
                <span class="spent-value">{{ projetosStore.totalFinanciadoConsolidado() | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
                <span class="limit-value"> de {{ projetosStore.totalOrcamentoConsolidado() | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
              </div>
            </div>

            <div class="hero-badges">
              <app-badge variant="gold">
                {{ projetosStore.coberturaFinanceiraGlobal() }}% Cobertura
              </app-badge>
              <span class="readiness-chip" [class]="obterReadinessClass(projetosStore.readinessScoreGlobal())">
                Score {{ projetosStore.readinessScoreGlobal() }}/100
              </span>
            </div>
          </div>

          <!-- Barra Tríplice de Cobertura Global -->
          <div class="progress-bar-container">
            <div
              class="progress-bar-fill gold"
              [style.width.%]="projetosStore.coberturaFinanceiraGlobal()">
            </div>
          </div>

          <!-- Estatísticas dos Projetos -->
          <div class="stats-pills-row">
            <div class="stat-pill">
              <span class="pill-value gold">{{ projetosStore.projetosEmAndamento().length }}</span>
              <span class="pill-label">Em Andamento</span>
            </div>

            <div class="stat-pill">
              <span class="pill-value purple">{{ projetosStore.projetosEmPlanejamento().length }}</span>
              <span class="pill-label">Em Planejamento</span>
            </div>

            <div class="stat-pill">
              <span class="pill-value green">{{ projetosStore.projetosConcluidos().length }}</span>
              <span class="pill-label">Concluídos</span>
            </div>

            <div class="stat-pill">
              <span class="pill-value positive">{{ projetosStore.totalCustoEstimadoConsolidado() | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}</span>
              <span class="pill-label">Custo Estimado</span>
            </div>
          </div>
        </div>
      </app-card>

      <!-- Seção Principal com Filtros -->
      <div class="projetos-section">
        <div class="section-header">
          <h2>Seus Projetos ({{ projetosStore.projetosFiltrados().length }})</h2>

          <!-- Filtros de Status -->
          <div class="filter-pills">
            <button
              class="filter-btn"
              [class.active]="projetosStore.filtroStatus() === 'TODOS'"
              (click)="filtrar('TODOS')">
              Todos
            </button>
            <button
              class="filter-btn"
              [class.active]="projetosStore.filtroStatus() === 'PLANEJAMENTO'"
              (click)="filtrar('PLANEJAMENTO')">
              Planejamento
            </button>
            <button
              class="filter-btn"
              [class.active]="projetosStore.filtroStatus() === 'EM_ANDAMENTO'"
              (click)="filtrar('EM_ANDAMENTO')">
              Em Andamento
            </button>
            <button
              class="filter-btn"
              [class.active]="projetosStore.filtroStatus() === 'CONCLUIDO'"
              (click)="filtrar('CONCLUIDO')">
              Concluídos
            </button>
          </div>
        </div>

        @if (projetosStore.carregando()) {
          <div class="loading-state">
            <span class="spinner"></span>
            <p>Carregando projetos de longo prazo...</p>
          </div>
        } @else if (projetosStore.projetosFiltrados().length === 0) {
          <div class="empty-state glass-card">
            <span class="material-symbols-rounded empty-icon">rocket_launch</span>
            <h3>Nenhum projeto encontrado</h3>
            <p>Cadastre reformas, aquisição de bens ou viagens para estruturar em etapas com acompanhamento de metas e desejos.</p>
            <app-button variant="primary-gold" (btnClick)="abrirFormularioProjeto()">
              Criar Primeiro Projeto
            </app-button>
          </div>
        } @else {
          <div class="projetos-cards-grid">
            @for (proj of projetosStore.projetosFiltrados(); track proj.id) {
              <div
                class="projeto-card glass-card animate-slide-up"
                [class.concluido]="proj.status === 'CONCLUIDO'"
                (click)="abrirDetalheProjeto(proj.id)">
                <!-- Cabeçalho do Card -->
                <div class="projeto-card-header">
                  <div class="proj-title-group">
                    <div
                      class="proj-icon-box"
                      [style.background-color]="proj.cor || '#C9A74E'">
                      <span class="material-symbols-rounded">{{ proj.icone || 'rocket_launch' }}</span>
                    </div>

                    <div class="proj-name-wrap">
                      <h3 class="proj-name">{{ proj.nome }}</h3>
                      @if (proj.descricao) {
                        <p class="proj-desc">{{ proj.descricao }}</p>
                      }
                    </div>
                  </div>

                  <div class="proj-header-actions" (click)="$event.stopPropagation()">
                    <app-badge [variant]="obterStatusBadgeVariant(proj.status)">
                      {{ obterStatusLabel(proj.status) }}
                    </app-badge>

                    <div class="dropdown-actions">
                      <button class="icon-action-btn" (click)="editarProjeto(proj, $event)" title="Editar Projeto">
                        <span class="material-symbols-rounded">edit</span>
                      </button>
                      <button class="icon-action-btn delete" (click)="excluirProjeto(proj, $event)" title="Excluir Projeto">
                        <span class="material-symbols-rounded">delete</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Painel de Barras de Progresso Tricolores -->
                <div class="tricolor-progress-section">
                  <!-- Bar 1: Cobertura Financeira (Gold) -->
                  <div class="bar-group">
                    <div class="bar-label-row">
                      <span class="bar-name">
                        <span class="material-symbols-rounded bar-icon gold">payments</span>
                        Cobertura Financeira
                      </span>
                      <span class="bar-val gold">{{ proj.coberturaFinanceira }}%</span>
                    </div>
                    <div class="bar-track">
                      <div class="bar-fill gold" [style.width.%]="proj.coberturaFinanceira"></div>
                    </div>
                  </div>

                  <!-- Bar 2: Progresso Físico (Bordô) -->
                  <div class="bar-group">
                    <div class="bar-label-row">
                      <span class="bar-name">
                        <span class="material-symbols-rounded bar-icon bordeaux">checklist</span>
                        Progresso Físico (Etapas)
                      </span>
                      <span class="bar-val bordeaux">{{ proj.progressoFisico }}%</span>
                    </div>
                    <div class="bar-track">
                      <div class="bar-fill bordeaux" [style.width.%]="proj.progressoFisico"></div>
                    </div>
                  </div>

                  <!-- Bar 3: Readiness Score (Verde/Champagne) -->
                  <div class="bar-group">
                    <div class="bar-label-row">
                      <span class="bar-name">
                        <span class="material-symbols-rounded bar-icon readiness">speed</span>
                        Readiness Score
                      </span>
                      <span class="bar-val readiness">{{ proj.readinessScore }}/100</span>
                    </div>
                    <div class="bar-track">
                      <div
                        class="bar-fill readiness"
                        [class]="obterReadinessClass(proj.readinessScore)"
                        [style.width.%]="proj.readinessScore">
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Resumo dos Valores & Prazos -->
                <div class="projeto-card-footer">
                  <div class="footer-info-item">
                    <span class="info-label">Orçamento</span>
                    <span class="info-val">{{ proj.orcamentoEstimado | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}</span>
                  </div>

                  <div class="footer-info-item">
                    <span class="info-label">Financiado</span>
                    <span class="info-val gold">{{ proj.valorFinanciado | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}</span>
                  </div>

                  <div class="footer-info-item">
                    <span class="info-label">Etapas</span>
                    <span class="info-val">{{ proj.etapasConcluidas }}/{{ proj.totalEtapas }}</span>
                  </div>

                  @if (proj.prazoEstimado) {
                    <div class="footer-info-item">
                      <span class="info-label">Prazo</span>
                      <span class="info-val">{{ proj.prazoEstimado | date:'dd/MM/yyyy' }}</span>
                    </div>
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
    .projetos-page {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 850px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
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
      flex-wrap: wrap;
      gap: 10px;
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

    .hero-badges {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .readiness-chip {
      display: inline-flex;
      align-items: center;
      padding: 3px 8px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;

      &.high {
        background: rgba(46, 125, 50, 0.2);
        color: #4caf50;
        border: 1px solid rgba(76, 175, 80, 0.3);
      }

      &.medium {
        background: rgba(216, 184, 126, 0.2);
        color: #d8b87e;
        border: 1px solid rgba(216, 184, 126, 0.3);
      }

      &.low {
        background: rgba(244, 67, 54, 0.2);
        color: #f44336;
        border: 1px solid rgba(244, 67, 54, 0.3);
      }
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
      border-radius: 6px;
      transition: width 0.4s ease;

      &.gold {
        background: var(--alic-color-gold-gradient, linear-gradient(135deg, #d8b87e 0%, #c19b56 100%));
        box-shadow: 0 0 12px rgba(216, 184, 126, 0.4);
      }
    }

    .stats-pills-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
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
      font-size: 15px;
      font-weight: 800;

      &.gold { color: var(--alic-color-gold-main, #d8b87e); }
      &.purple { color: #ab47bc; }
      &.green { color: #4caf50; }
      &.positive { color: #10b981; }
    }

    .pill-label {
      font-size: 10px;
      color: rgba(235, 217, 182, 0.6);
      white-space: nowrap;
    }

    .projetos-section {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 10px;

      h2 {
        font-size: 16px;
        font-weight: 700;
        color: #ebd9b6;
        margin: 0;
      }
    }

    .filter-pills {
      display: flex;
      gap: 6px;
      background: rgba(0, 0, 0, 0.2);
      padding: 3px;
      border-radius: 10px;
      border: 1px solid rgba(216, 184, 126, 0.15);
    }

    .filter-btn {
      background: none;
      border: none;
      color: rgba(235, 217, 182, 0.6);
      font-size: 11px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;

      &.active {
        background: rgba(216, 184, 126, 0.2);
        color: #d8b87e;
        font-weight: 700;
      }
    }

    .projetos-cards-grid {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .projeto-card {
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      border-radius: 20px;
      background: rgba(31, 26, 27, 0.7);
      border: 1px solid rgba(216, 184, 126, 0.25);
      cursor: pointer;
      transition: transform 0.2s ease, border-color 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        border-color: rgba(216, 184, 126, 0.45);
      }

      &.concluido {
        border-color: rgba(76, 175, 80, 0.4);
      }
    }

    .projeto-card-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    }

    .proj-title-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .proj-icon-box {
      width: 46px;
      height: 46px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

      span { font-size: 24px; }
    }

    .proj-name {
      font-size: 16px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }

    .proj-desc {
      font-size: 12px;
      color: rgba(235, 217, 182, 0.6);
      margin: 2px 0 0 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .proj-header-actions {
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

    .tricolor-progress-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
      background: rgba(0, 0, 0, 0.2);
      padding: 12px;
      border-radius: 14px;
      border: 1px solid rgba(216, 184, 126, 0.12);
    }

    .bar-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .bar-label-row {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      font-weight: 600;
      color: rgba(235, 217, 182, 0.7);
    }

    .bar-name {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .bar-icon {
      font-size: 14px;

      &.gold { color: #d8b87e; }
      &.bordeaux { color: #A13D63; }
      &.readiness { color: #10b981; }
    }

    .bar-val {
      font-weight: 700;

      &.gold { color: #d8b87e; }
      &.bordeaux { color: #e91e63; }
      &.readiness { color: #ffffff; }
    }

    .bar-track {
      width: 100%;
      height: 7px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 4px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.4s ease;

      &.gold { background: linear-gradient(90deg, #d8b87e, #c19b56); }
      &.bordeaux { background: linear-gradient(90deg, #A13D63, #e91e63); }
      &.readiness {
        &.high { background: linear-gradient(90deg, #2e7d32, #4caf50); }
        &.medium { background: linear-gradient(90deg, #d8b87e, #c19b56); }
        &.low { background: linear-gradient(90deg, #c62828, #f44336); }
      }
    }

    .projeto-card-footer {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      border-top: 1px solid rgba(216, 184, 126, 0.15);
      padding-top: 12px;

      @media (max-width: 580px) {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .footer-info-item {
      display: flex;
      flex-direction: column;
    }

    .info-label {
      font-size: 10px;
      color: rgba(235, 217, 182, 0.5);
    }

    .info-val {
      font-size: 12px;
      font-weight: 700;
      color: #ffffff;

      &.gold { color: #d8b87e; }
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
      p { font-size: 13px; color: rgba(235, 217, 182, 0.6); margin: 0; max-width: 340px; }
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
export class ProjetosPage implements OnInit {
  readonly projetosStore = inject(ProjetosStore);
  private readonly overlayService = inject(OverlayService);
  private readonly toastService = inject(ToastService);
  private readonly haptics = inject(HapticsService);
  private readonly router = inject(Router);
  private readonly fabRegistry = inject(FabActionRegistryService);

  ngOnInit(): void {
    this.projetosStore.carregarProjetos();

    this.fabRegistry.registerAction({
      id: 'novo-projeto',
      label: '+ Novo Projeto',
      icon: 'rocket_launch',
      color: '#d8b87e',
      priority: 95,
      execute: () => this.abrirFormularioProjeto(),
    });
  }

  filtrar(status: 'TODOS' | StatusProjeto): void {
    this.haptics.impactLight();
    this.projetosStore.setFiltroStatus(status);
  }

  abrirFormularioProjeto(projeto?: ProjetoReadModel): void {
    this.haptics.impactMedium();
    this.overlayService.openBottomSheet({
      component: FormularioProjetoComponent,
      title: projeto ? 'Editar Projeto' : 'Novo Projeto de Longo Prazo',
      data: { projeto },
    });
  }

  editarProjeto(projeto: ProjetoReadModel, event: MouseEvent): void {
    event.stopPropagation();
    this.abrirFormularioProjeto(projeto);
  }

  async excluirProjeto(projeto: ProjetoReadModel, event: MouseEvent): Promise<void> {
    event.stopPropagation();
    this.haptics.impactMedium();
    if (confirm(`Tem certeza que deseja excluir o projeto "${projeto.nome}"?`)) {
      const ok = await this.projetosStore.removerProjeto(projeto.id);
      if (ok) {
        this.toastService.showSuccess(`Projeto "${projeto.nome}" removido.`);
      }
    }
  }

  abrirDetalheProjeto(id: string): void {
    this.haptics.impactLight();
    this.router.navigate(['/projects', id]);
  }

  obterStatusBadgeVariant(status: StatusProjeto): 'gold' | 'bordo' | 'positive' | 'negative' | 'neutral' {
    switch (status) {
      case 'CONCLUIDO': return 'positive';
      case 'EM_ANDAMENTO': return 'gold';
      case 'PLANEJAMENTO': return 'bordo';
      case 'CANCELADO': return 'negative';
      default: return 'gold';
    }
  }

  obterStatusLabel(status: StatusProjeto): string {
    switch (status) {
      case 'CONCLUIDO': return 'Concluído';
      case 'EM_ANDAMENTO': return 'Em Andamento';
      case 'PLANEJAMENTO': return 'Planejamento';
      case 'CANCELADO': return 'Cancelado';
      default: return status;
    }
  }

  obterReadinessClass(score: number): 'high' | 'medium' | 'low' {
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }
}
