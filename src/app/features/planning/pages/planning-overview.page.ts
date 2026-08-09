import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PlanningStore } from '../store/planning.store';
import { CalendarioVencimentosComponent } from '../components/calendario-vencimentos.component';
import { RadarProjetosComponent } from '../components/radar-projetos.component';
import { SaudeOrcamentosMetasComponent } from '../components/saude-orcamentos-metas.component';

@Component({
  selector: 'app-planning-overview-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CalendarioVencimentosComponent,
    RadarProjetosComponent,
    SaudeOrcamentosMetasComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="overview-page-container animate-fade-in">
      <!-- 1. Executive Hero Banner -->
      <section class="hero-overview-banner glass-card">
        <div class="banner-top">
          <div class="banner-title-group">
            <div class="planning-badge">
              <span class="pulse-ring"></span>
              <span>SPRINT 5.2 • PLANNING OVERVIEW & VISÃO UNIFICADA</span>
            </div>
            <h1 class="main-title">Visão Unificada do Planejamento 🛡️</h1>
            <p class="main-subtitle">
              Cockpit executivo consolidando calendário de vencimentos (30 dias), radar de projetos em caminho crítico e saúde de metas e orçamentos.
            </p>
          </div>

          <div class="banner-actions">
            <button class="action-btn secondary" (click)="store.carregarOverview()">
              <span class="material-symbols-rounded">sync</span>
              <span>Atualizar Dados</span>
            </button>
          </div>
        </div>

        <!-- Sub-Navigation Bar (Overview vs Forecast 12M) -->
        <div class="subnav-tabs-bar">
          <a routerLink="/planning/overview" routerLinkActive="active" class="subnav-tab">
            <span class="material-symbols-rounded">dashboard</span>
            <span>Visão Unificada (Overview)</span>
          </a>
          <a routerLink="/planning" [routerLinkActiveOptions]="{ exact: true }" routerLinkActive="active" class="subnav-tab">
            <span class="material-symbols-rounded">show_chart</span>
            <span>Projeção 12 Meses (Timeline)</span>
          </a>
        </div>

        <!-- Metric Cards Grid (Executive Triad + Health Score) -->
        <div class="synthetic-metrics-grid">
          <!-- Card 1: Saldo Disponível -->
          <div class="metric-box gold-box">
            <div class="box-header">
              <span class="box-label">Saldo Disponível</span>
              <span class="material-symbols-rounded box-icon">account_balance</span>
            </div>
            <div class="box-value text-gold" *ngIf="store.resumoFinanceiroOverview() as rf">
              R$ {{ rf.saldoDisponivelTotal | number : '1.2-2' }}
            </div>
            <div class="box-footer">
              <span>Soma de carteiras & contas correntes</span>
            </div>
          </div>

          <!-- Card 2: Compromissos 30d -->
          <div class="metric-box bordo-box">
            <div class="box-header">
              <span class="box-label">Compromissos (30 dias)</span>
              <span class="material-symbols-rounded box-icon">calendar_today</span>
            </div>
            <div class="box-value text-bordo" *ngIf="store.resumoFinanceiroOverview() as rf">
              R$ {{ rf.compromissosProximos30Dias | number : '1.2-2' }}
            </div>
            <div class="box-footer" *ngIf="store.totalVencidosAtrasados() > 0">
              <span class="highlight-pill bordo">{{ store.totalVencidosAtrasados() }} contas em atraso</span>
            </div>
            <div class="box-footer" *ngIf="store.totalVencidosAtrasados() === 0">
              <span>{{ store.totalVencimentos30Dias() }} lançamentos mapeados</span>
            </div>
          </div>

          <!-- Card 3: Capacidade Aporte -->
          <div class="metric-box green-box">
            <div class="box-header">
              <span class="box-label">Capacidade Aporte Mensal</span>
              <span class="material-symbols-rounded box-icon">savings</span>
            </div>
            <div class="box-value text-green" *ngIf="store.resumoFinanceiroOverview() as rf">
              R$ {{ rf.capacidadeAporteMensal | number : '1.2-2' }}
            </div>
            <div class="box-footer">
              <span>Superávit estimado livre para metas</span>
            </div>
          </div>

          <!-- Card 4: Health Score Overall -->
          <div class="metric-box health-box">
            <div class="box-header">
              <span class="box-label">Health Score Geral</span>
              <span class="material-symbols-rounded box-icon text-gold">vital_signs</span>
            </div>
            <div class="health-score-content">
              <div class="score-number font-mono" [ngClass]="getHealthScoreCssClass(store.healthScoreGeral())">
                {{ store.healthScoreGeral() }}<span class="scale">/100</span>
              </div>
              <span class="health-status-badge" [ngClass]="getHealthScoreCssClass(store.healthScoreGeral())">
                {{ getHealthScoreLabel(store.healthScoreGeral()) }}
              </span>
            </div>
            <div class="box-footer">
              <span>Pontuação de saúde e resiliência</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. Calendário de Vencimentos (Próximos 30 Dias) -->
      <section class="overview-section">
        <app-calendario-vencimentos></app-calendario-vencimentos>
      </section>

      <!-- 3. Radar de Projetos & Caminho Crítico -->
      <section class="overview-section">
        <app-radar-projetos></app-radar-projetos>
      </section>

      <!-- 4. Saúde de Orçamentos & Metas Prioritárias -->
      <section class="overview-section">
        <app-saude-orcamentos-metas></app-saude-orcamentos-metas>
      </section>
    </div>
  `,
  styles: [`
    .overview-page-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
      padding: 20px;
      max-width: 1280px;
      margin: 0 auto;
    }

    /* Hero Overview Banner */
    .hero-overview-banner {
      background: linear-gradient(135deg, rgba(74, 18, 26, 0.95) 0%, rgba(25, 8, 12, 0.98) 100%),
                  radial-gradient(circle at 90% 10%, rgba(201, 167, 78, 0.25) 0%, transparent 60%);
      border: 1px solid rgba(216, 184, 126, 0.35);
      border-radius: 20px;
      padding: 28px;
      box-shadow: 0 10px 40px rgba(161, 61, 99, 0.25);
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .banner-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 20px;
      flex-wrap: wrap;
    }

    .planning-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 4px 14px;
      border-radius: 9999px;
      background: rgba(201, 167, 78, 0.15);
      border: 1px solid rgba(201, 167, 78, 0.3);
      color: #ebd9b6;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }

    .pulse-ring {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #C9A74E;
      box-shadow: 0 0 10px #C9A74E;
    }

    .main-title {
      font-family: var(--font-primary, 'Outfit', sans-serif);
      font-size: 32px;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 6px 0;
    }

    .main-subtitle {
      color: #9c8e7c;
      font-size: 14px;
      margin: 0;
      max-width: 700px;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;

      &.secondary {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(216, 184, 126, 0.25);
        color: #ebd9b6;

        &:hover {
          background: rgba(201, 167, 78, 0.2);
        }
      }

      span { font-size: 18px; }
    }

    /* Subnav Tabs */
    .subnav-tabs-bar {
      display: flex;
      gap: 12px;
      border-bottom: 1px solid rgba(216, 184, 126, 0.2);
      padding-bottom: 12px;
      flex-wrap: wrap;
    }

    .subnav-tab {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 700;
      color: #9c8e7c;
      text-decoration: none;
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.05);
      transition: all 0.2s ease;

      span { font-size: 18px; }

      &:hover {
        background: rgba(201, 167, 78, 0.15);
        color: #ebd9b6;
      }

      &.active {
        background: var(--color-gold-gradient, linear-gradient(135deg, #d8b87e 0%, #c9a74e 100%));
        color: #2b0b10;
        border-color: #C9A74E;
        box-shadow: 0 4px 14px rgba(201, 167, 78, 0.3);
      }
    }

    /* Metric Cards Grid */
    .synthetic-metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
    }

    .metric-box {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(216, 184, 126, 0.2);
      border-radius: 14px;
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      transition: transform 0.2s ease;

      &:hover {
        transform: translateY(-2px);
      }

      &.gold-box { border-color: rgba(201, 167, 78, 0.4); }
      &.green-box { border-color: rgba(16, 185, 129, 0.4); }
      &.bordo-box { border-color: rgba(161, 61, 99, 0.4); }
      &.health-box { border-color: rgba(201, 167, 78, 0.4); background: rgba(201, 167, 78, 0.05); }
    }

    .box-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .box-label {
      font-size: 11px;
      font-weight: 700;
      color: #9c8e7c;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .box-icon {
      font-size: 20px;
      color: #C9A74E;
    }

    .box-value {
      font-family: var(--font-mono, 'Space Grotesk', monospace);
      font-size: 24px;
      font-weight: 800;

      &.text-gold { color: #C9A74E; }
      &.text-green { color: #34d399; }
      &.text-bordo { color: #f87171; }
    }

    .health-score-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .score-number {
      font-size: 26px;
      font-weight: 800;

      .scale {
        font-size: 14px;
        color: #9c8e7c;
      }
    }

    .health-status-badge {
      font-size: 10px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 6px;
      text-transform: uppercase;

      &.sc-high { background: rgba(16, 185, 129, 0.2); color: #34d399; }
      &.sc-med { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
      &.sc-low { background: rgba(239, 68, 68, 0.2); color: #f87171; }
    }

    .box-footer {
      font-size: 11px;
      color: #9c8e7c;
    }

    .highlight-pill {
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 6px;

      &.bordo { background: rgba(161, 61, 99, 0.25); color: #f87171; }
    }

    .overview-section {
      width: 100%;
    }
  `],
})
export class PlanningOverviewPage implements OnInit {
  readonly store = inject(PlanningStore);

  ngOnInit(): void {
    this.store.carregarOverview();
  }

  getHealthScoreCssClass(score: number): string {
    if (score >= 75) return 'sc-high';
    if (score >= 50) return 'sc-med';
    return 'sc-low';
  }

  getHealthScoreLabel(score: number): string {
    if (score >= 85) return 'Excelente';
    if (score >= 70) return 'Bom & Estável';
    if (score >= 50) return 'Atenção';
    return 'Risco Crítico';
  }
}
