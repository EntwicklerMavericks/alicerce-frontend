import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import {
  NgApexchartsModule,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexStroke,
  ApexTooltip,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
} from 'ng-apexcharts';
import { DashboardStore } from '../store/dashboard.store';
import { SeveridadeAlerta } from '../../../core/models/dashboard.models';

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
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, NgApexchartsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dashboard-container animate-fade-in">
      <!-- 1. Header Executivo -->
      <header class="executive-header">
        <div class="header-main-info">
          <div class="competence-badge">
            <span class="pulse-dot"></span>
            <span>PLANEJAMENTO ATIVO • {{ store.competenciaSelecionada() }}</span>
          </div>
          <h1 class="welcome-title">
            Olá, {{ store.dashboardData()?.usuarioNome || 'Eduardo' }} 👋
          </h1>
          <p class="welcome-subtitle">
            {{ store.dashboardData()?.resumoExecutivo }}
          </p>
        </div>

        <div class="header-actions">
          <button
            class="executive-btn eye-btn"
            (click)="store.toggleOlhoMagico()"
            [title]="store.saldoVisivel() ? 'Ocultar Saldos' : 'Exibir Saldos'"
          >
            <span class="material-symbols-rounded">
              {{ store.saldoVisivel() ? 'visibility' : 'visibility_off' }}
            </span>
            <span>{{ store.saldoVisivel() ? 'Ocultar Saldos' : 'Exibir Saldos' }}</span>
          </button>

          <button class="executive-btn refresh-btn" (click)="atualizarDashboard()" [disabled]="store.carregando()">
            <span class="material-symbols-rounded" [class.spin]="store.carregando()">refresh</span>
            <span>Atualizar</span>
          </button>

          <a routerLink="/transactions" class="executive-btn primary-bordo-btn">
            <span class="material-symbols-rounded">add</span>
            <span>Novo Lançamento</span>
          </a>
        </div>
      </header>

      <!-- 2. Widget Saldo Global -->
      <section class="widget-section">
        <div class="widget-section-header">
          <div class="section-title-group">
            <span class="material-symbols-rounded title-icon">account_balance_wallet</span>
            <h2>Saldo Global & Indicadores Financeiros</h2>
          </div>
          <span class="updated-time">Atualizado em tempo real</span>
        </div>

        <div class="metrics-grid">
          <!-- Saldo Atual -->
          <div class="metric-card glass-card gold-accent-border">
            <div class="card-top">
              <span class="card-label">Saldo Real Atual</span>
              <div class="icon-bubble gold-bubble"><span class="material-symbols-rounded">account_balance</span></div>
            </div>
            <div class="card-main">
              <span class="card-value gold-text">{{ formatarValor(store.saldoAtual()) }}</span>
              <span class="trend-badge positive">+{{ store.dashboardData()?.variacaoSaldoMesAnterior ?? 12.5 }}% vs mês anterior</span>
            </div>
            <div class="card-footer"><span class="footer-note">Consolidado em contas bancárias</span></div>
          </div>

          <!-- Saldo Projetado -->
          <div class="metric-card glass-card">
            <div class="card-top">
              <span class="card-label">Saldo Projetado (Fim do Mês)</span>
              <div class="icon-bubble champagne-bubble"><span class="material-symbols-rounded">insights</span></div>
            </div>
            <div class="card-main">
              <span class="card-value champagne-text">{{ formatarValor(store.saldoProjetado()) }}</span>
              <span class="sub-note">Considera receitas e despesas pendentes</span>
            </div>
            <div class="card-footer"><span class="footer-note">Forecast automatizado</span></div>
          </div>

          <!-- Receitas -->
          <div class="metric-card glass-card">
            <div class="card-top">
              <span class="card-label">Receitas (Mês)</span>
              <div class="icon-bubble positive-bubble"><span class="material-symbols-rounded">trending_up</span></div>
            </div>
            <div class="card-main">
              <span class="card-value positive-text">{{ formatarValor(store.receitasLiquidadasMes() || store.receitasPendentes()) }}</span>
              <span class="sub-note">Pendente: {{ formatarValor(store.receitasPendentes()) }}</span>
            </div>
            <div class="card-footer"><span class="footer-note">Entradas confirmadas no mês</span></div>
          </div>

          <!-- Despesas -->
          <div class="metric-card glass-card">
            <div class="card-top">
              <span class="card-label">Despesas (Mês)</span>
              <div class="icon-bubble negative-bubble"><span class="material-symbols-rounded">trending_down</span></div>
            </div>
            <div class="card-main">
              <span class="card-value negative-text">{{ formatarValor(store.despesasLiquidadasMes() || store.despesasPendentes()) }}</span>
              <span class="sub-note">Pendente: {{ formatarValor(store.despesasPendentes()) }}</span>
            </div>
            <div class="card-footer"><span class="footer-note">Saídas e compromissos fixos</span></div>
          </div>
        </div>
      </section>

      <!-- 3. Main Grid: Faturas Abertas + Alertas Críticos -->
      <section class="main-widgets-grid">
        <!-- Widget Faturas Abertas -->
        <div class="widget-card glass-card">
          <div class="widget-header">
            <div class="widget-title-group">
              <div class="icon-bubble bordo-bubble"><span class="material-symbols-rounded">credit_card</span></div>
              <div>
                <h3>Faturas Abertas (Cartões)</h3>
                <p class="widget-subtitle">Limites e vencimentos das faturas ativas</p>
              </div>
            </div>
            <a routerLink="/cards" class="action-link">
              <span>Gerenciar Cartões</span>
              <span class="material-symbols-rounded">chevron_right</span>
            </a>
          </div>

          <div class="cards-list">
            <div
              *ngFor="let fatura of store.faturasAbertas()"
              class="card-item"
              [style.border-left-color]="fatura.cor || '#C9A74E'"
            >
              <div class="card-item-info">
                <div class="card-name-row">
                  <span class="card-name">{{ fatura.nomeCartao }}</span>
                  <span class="brand-badge">{{ fatura.bandeira }}</span>
                </div>
                <div class="card-vencimento">
                  Vencimento: <strong>{{ fatura.dataVencimento | date: 'dd/MM/yyyy' }}</strong>
                </div>
                <div class="limit-bar-track">
                  <div
                    class="limit-bar-fill"
                    [style.width.%]="calcularPercentualLimite(fatura.limiteComprometido, fatura.limiteTotal)"
                    [style.background-color]="fatura.cor || '#C9A74E'"
                  ></div>
                </div>
                <div class="limit-labels">
                  <span>Livre: {{ formatarValor(fatura.limiteDisponivel) }}</span>
                  <span>Total: {{ formatarValor(fatura.limiteTotal) }}</span>
                </div>
              </div>

              <div class="card-item-value">
                <span class="fatura-amount">{{ formatarValor(fatura.valorFatura) }}</span>
                <span class="fatura-status-pill" [ngClass]="fatura.status.toLowerCase()">
                  {{ fatura.status }}
                </span>
              </div>
            </div>

            <div *ngIf="store.faturasAbertas().length === 0" class="empty-state">
              <span class="material-symbols-rounded">check_circle</span>
              <p>Nenhuma fatura aberta no momento.</p>
            </div>
          </div>
        </div>

        <!-- Widget Alertas Críticos -->
        <div class="widget-card glass-card">
          <div class="widget-header">
            <div class="widget-title-group">
              <div class="icon-bubble critical-bubble"><span class="material-symbols-rounded">notifications_active</span></div>
              <div>
                <h3>Alertas & Notificações</h3>
                <p class="widget-subtitle">Pílulas de severidade (CRITICO, ALTO, MEDIO)</p>
              </div>
            </div>
            <div class="alerts-count-pills">
              <span *ngIf="store.alertasCriticosCount() > 0" class="pill-badge critico">{{ store.alertasCriticosCount() }} CRÍTICO</span>
              <span *ngIf="store.alertasAltosCount() > 0" class="pill-badge alto">{{ store.alertasAltosCount() }} ALTO</span>
              <span *ngIf="store.alertasMediosCount() > 0" class="pill-badge medio">{{ store.alertasMediosCount() }} MÉDIO</span>
            </div>
          </div>

          <div class="alerts-list">
            <div
              *ngFor="let alerta of store.alertas()"
              class="alert-item"
              [ngClass]="'severity-' + alerta.severidade.toLowerCase()"
            >
              <div class="alert-header-row">
                <span class="severity-pill" [ngClass]="'pill-' + alerta.severidade.toLowerCase()">
                  <span class="material-symbols-rounded severity-icon">{{ getIconeSeveridade(alerta.severidade) }}</span>
                  {{ alerta.severidade }}
                </span>
                <span class="alert-type">{{ formatarTipoAlerta(alerta.tipo) }}</span>
              </div>

              <h4 class="alert-title">{{ alerta.titulo }}</h4>
              <p class="alert-message">{{ alerta.mensagem }}</p>

              <div class="alert-footer">
                <span class="alert-date">{{ alerta.data | date: 'dd/MM/yyyy' }}</span>
                <a *ngIf="alerta.link" [routerLink]="alerta.link" class="alert-action-btn">
                  <span>Resolver</span>
                  <span class="material-symbols-rounded">arrow_forward</span>
                </a>
              </div>
            </div>

            <div *ngIf="store.alertas().length === 0" class="empty-state">
              <span class="material-symbols-rounded">verified</span>
              <p>Nenhum alerta crítico ativo. Seu planejamento está em dia!</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. Secondary Grid: Orçado vs Realizado + Metas Prioritárias -->
      <section class="secondary-widgets-grid">
        <!-- Widget Orçado vs Realizado -->
        <div class="widget-card glass-card">
          <div class="widget-header">
            <div class="widget-title-group">
              <div class="icon-bubble gold-bubble"><span class="material-symbols-rounded">pie_chart</span></div>
              <div>
                <h3>Orçado vs Realizado</h3>
                <p class="widget-subtitle">Controle de teto de gastos por categoria</p>
              </div>
            </div>
            <a routerLink="/orcamentos" class="action-link">
              <span>Ver Orçamentos</span>
              <span class="material-symbols-rounded">chevron_right</span>
            </a>
          </div>

          <div class="budgets-list">
            <div *ngFor="let orc of store.orcamentos()" class="budget-item">
              <div class="budget-top-info">
                <div class="cat-group">
                  <div class="cat-icon" [style.background-color]="(orc.cor || '#C9A74E') + '22'" [style.color]="orc.cor || '#C9A74E'">
                    <span class="material-symbols-rounded">{{ orc.icone || 'category' }}</span>
                  </div>
                  <span class="cat-name">{{ orc.categoria }}</span>
                </div>
                <div class="budget-status-pill" [ngClass]="orc.status.toLowerCase()">{{ orc.status }}</div>
              </div>

              <div class="budget-progress-track">
                <div
                  class="budget-progress-fill"
                  [style.width.%]="orc.percentualConsumido > 100 ? 100 : orc.percentualConsumido"
                  [ngClass]="{
                    'fill-excedido': orc.status === 'EXCEDIDO',
                    'fill-alerta': orc.status === 'ALERTA' || orc.status === 'ATENCAO',
                    'fill-normal': orc.status === 'NORMAL'
                  }"
                ></div>
              </div>

              <div class="budget-values-row">
                <span>Gasto: <strong>{{ formatarValor(orc.valorGasto) }}</strong></span>
                <span class="pct-text" [class.danger]="orc.percentualConsumido >= 100">{{ orc.percentualConsumido }}%</span>
                <span>Teto: {{ formatarValor(orc.valorTeto) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Widget Metas Prioritárias -->
        <div class="widget-card glass-card">
          <div class="widget-header">
            <div class="widget-title-group">
              <div class="icon-bubble champagne-bubble"><span class="material-symbols-rounded">flag</span></div>
              <div>
                <h3>Metas Prioritárias (Máx 3)</h3>
                <p class="widget-subtitle">Acompanhamento dos maiores objetivos</p>
              </div>
            </div>
            <a routerLink="/goals" class="action-link">
              <span>Todas as Metas</span>
              <span class="material-symbols-rounded">chevron_right</span>
            </a>
          </div>

          <div class="goals-list">
            <div *ngFor="let meta of store.metasPrioritarias()" class="goal-item glass-inner-card">
              <div class="goal-header">
                <div class="goal-title-row">
                  <span class="goal-name">{{ meta.nome }}</span>
                  <span class="goal-pct-pill">{{ meta.percentualConcluido }}%</span>
                </div>
                <div class="goal-amounts">
                  <span class="current-val">{{ formatarValor(meta.valorAtual) }}</span>
                  <span class="target-val">de {{ formatarValor(meta.valorAlvo) }}</span>
                </div>
              </div>

              <div class="goal-progress-track">
                <div
                  class="goal-progress-fill"
                  [style.width.%]="meta.percentualConcluido > 100 ? 100 : meta.percentualConcluido"
                  [style.background-color]="meta.cor || '#C9A74E'"
                ></div>
              </div>

              <div class="goal-footer">
                <span *ngIf="meta.ritmoMensalEstimado && meta.ritmoMensalEstimado > 0">
                  Aporte recomendado: <strong>{{ formatarValor(meta.ritmoMensalEstimado) }}/mês</strong>
                </span>
                <span *ngIf="meta.diasRestantes !== undefined">{{ meta.diasRestantes }} dias restantes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 5. Chart Projeção & Fluxo de Caixa -->
      <section class="chart-section glass-card">
        <div class="widget-header">
          <div class="widget-title-group">
            <div class="icon-bubble gold-bubble"><span class="material-symbols-rounded">monitoring</span></div>
            <div>
              <h3>Projeção de Saldo & Fluxo de Caixa 📊</h3>
              <p class="widget-subtitle">Comportamento diário e estimativa do período</p>
            </div>
          </div>
          <div class="chart-legends">
            <span class="legend-chip gold-chip"><span class="chip-dot gold"></span> Saldo Projetado</span>
            <span class="legend-chip bordo-chip"><span class="chip-dot bordo"></span> Saídas & Despesas</span>
          </div>
        </div>

        <div class="chart-wrapper">
          <apx-chart
            *ngIf="chartOptions()"
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
          ></apx-chart>
        </div>
      </section>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
    .dashboard-container { display: flex; flex-direction: column; gap: 20px; padding: 16px; max-width: 1440px; margin: 0 auto; }
    .executive-header {
      background: linear-gradient(135deg, #4A121A 0%, #1F1A1B 100%);
      border: 1px solid rgba(201, 167, 78, 0.35); border-radius: 16px; padding: 24px; display: flex;
      justify-content: space-between; align-items: center; box-shadow: 0 10px 30px rgba(161, 61, 99, 0.25);
    }
    .competence-badge {
      display: inline-flex; align-items: center; gap: 8px; padding: 4px 12px; border-radius: 99px;
      background: rgba(201, 167, 78, 0.15); border: 1px solid rgba(201, 167, 78, 0.35); color: #E8D39E; font-size: 11px; font-weight: 700; margin-bottom: 8px;
    }
    .pulse-dot { width: 8px; height: 8px; border-radius: 50%; background: #C9A74E; box-shadow: 0 0 10px #C9A74E; }
    .welcome-title { font-size: 28px; font-weight: 800; color: #FFF; margin: 0 0 4px 0; }
    .welcome-subtitle { color: rgba(255, 255, 255, 0.75); font-size: 13px; margin: 0; max-width: 650px; }
    .header-actions { display: flex; align-items: center; gap: 10px; }
    .executive-btn {
      display: flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; border: 1px solid transparent; text-decoration: none;
      &.eye-btn { background: rgba(255, 255, 255, 0.08); border-color: rgba(201, 167, 78, 0.3); color: #E8D39E; }
      &.refresh-btn { background: rgba(255, 255, 255, 0.05); border-color: rgba(255, 255, 255, 0.15); color: #FFF; }
      &.primary-bordo-btn { background: linear-gradient(135deg, #A13D63 0%, #7A2846 100%); color: #FFF; border-color: rgba(201, 167, 78, 0.4); }
    }
    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .widget-section { display: flex; flex-direction: column; gap: 12px; }
    .widget-section-header {
      display: flex; justify-content: space-between; align-items: center;
      .section-title-group { display: flex; align-items: center; gap: 8px; .title-icon { color: #C9A74E; font-size: 22px; } h2 { font-size: 17px; font-weight: 700; color: #FFF; margin: 0; } }
      .updated-time { font-size: 11px; color: rgba(255, 255, 255, 0.45); }
    }
    .glass-card { background: rgba(31, 26, 27, 0.85); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 18px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3); &.gold-accent-border { border-color: rgba(201, 167, 78, 0.4); } }
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; }
    .metric-card { display: flex; flex-direction: column; justify-content: space-between; gap: 10px; }
    .card-top { display: flex; justify-content: space-between; align-items: center; }
    .card-label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: rgba(255, 255, 255, 0.6); }
    .icon-bubble {
      width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; span { font-size: 18px; }
      &.gold-bubble { background: rgba(201, 167, 78, 0.15); color: #C9A74E; }
      &.champagne-bubble { background: rgba(232, 211, 158, 0.15); color: #E8D39E; }
      &.positive-bubble { background: rgba(16, 185, 129, 0.15); color: #34D399; }
      &.negative-bubble { background: rgba(239, 68, 68, 0.15); color: #F87171; }
      &.bordo-bubble { background: rgba(161, 61, 99, 0.2); color: #E07A9E; }
      &.critical-bubble { background: rgba(239, 68, 68, 0.2); color: #EF4444; }
    }
    .card-main { display: flex; flex-direction: column; gap: 2px; }
    .card-value { font-family: monospace; font-size: 22px; font-weight: 800; color: #FFF; &.gold-text { color: #C9A74E; } &.champagne-text { color: #E8D39E; } &.positive-text { color: #34D399; } &.negative-text { color: #F87171; } }
    .trend-badge { font-size: 10px; font-weight: 700; &.positive { color: #34D399; } }
    .sub-note, .footer-note { font-size: 10px; color: rgba(255, 255, 255, 0.45); }
    .card-footer { border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 6px; }

    .main-widgets-grid, .secondary-widgets-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .widget-card { display: flex; flex-direction: column; gap: 14px; }
    .widget-header { display: flex; justify-content: space-between; align-items: center; h3 { font-size: 16px; font-weight: 700; color: #FFF; margin: 0; } }
    .widget-title-group { display: flex; align-items: center; gap: 10px; }
    .widget-subtitle { margin: 2px 0 0 0; font-size: 11px; color: rgba(255, 255, 255, 0.5); }
    .action-link { display: flex; align-items: center; gap: 2px; font-size: 11px; font-weight: 700; color: #C9A74E; text-decoration: none; }

    .cards-list, .alerts-list, .budgets-list, .goals-list { display: flex; flex-direction: column; gap: 10px; }
    .card-item { display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.03); border-left: 4px solid #C9A74E; border-radius: 10px; padding: 12px; }
    .card-item-info { display: flex; flex-direction: column; gap: 4px; flex: 1; margin-right: 12px; }
    .card-name-row { display: flex; align-items: center; gap: 6px; }
    .card-name { font-size: 13px; font-weight: 700; color: #FFF; }
    .brand-badge { font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; background: rgba(201, 167, 78, 0.2); color: #C9A74E; }
    .card-vencimento { font-size: 10px; color: rgba(255, 255, 255, 0.6); }
    .limit-bar-track { height: 5px; background: rgba(255, 255, 255, 0.1); border-radius: 3px; overflow: hidden; }
    .limit-bar-fill { height: 100%; border-radius: 3px; }
    .limit-labels { display: flex; justify-content: space-between; font-size: 9px; color: rgba(255, 255, 255, 0.4); }
    .card-item-value { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
    .fatura-amount { font-family: monospace; font-size: 15px; font-weight: 800; color: #FFF; }
    .fatura-status-pill { font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 99px; &.aberta { background: rgba(201, 167, 78, 0.2); color: #C9A74E; } &.atrasada { background: rgba(239, 68, 68, 0.2); color: #F87171; } &.paga { background: rgba(16, 185, 129, 0.2); color: #34D399; } }

    .alerts-count-pills { display: flex; gap: 4px; }
    .pill-badge { font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; &.critico { background: rgba(239, 68, 68, 0.25); color: #F87171; } &.alto { background: rgba(245, 158, 11, 0.25); color: #FBBF24; } &.medio { background: rgba(201, 167, 78, 0.25); color: #E8D39E; } }
    .alert-item { padding: 12px; border-radius: 10px; background: rgba(255, 255, 255, 0.02); &.severity-critico { border-left: 4px solid #EF4444; } &.severity-alto { border-left: 4px solid #F59E0B; } &.severity-medio { border-left: 4px solid #C9A74E; } }
    .alert-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
    .severity-pill { display: inline-flex; align-items: center; gap: 3px; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; &.pill-critico { background: #EF4444; color: #FFF; } &.pill-alto { background: #F59E0B; color: #1F1A1B; } &.pill-medio { background: #C9A74E; color: #1F1A1B; } .severity-icon { font-size: 11px; } }
    .alert-type { font-size: 9px; color: rgba(255, 255, 255, 0.4); text-transform: uppercase; }
    .alert-title { font-size: 13px; font-weight: 700; color: #FFF; margin: 0 0 2px 0; }
    .alert-message { font-size: 11px; color: rgba(255, 255, 255, 0.7); margin: 0 0 6px 0; }
    .alert-footer { display: flex; justify-content: space-between; align-items: center; }
    .alert-date { font-size: 10px; color: rgba(255, 255, 255, 0.4); }
    .alert-action-btn { display: flex; align-items: center; gap: 2px; font-size: 10px; font-weight: 700; color: #C9A74E; text-decoration: none; }

    .budget-item { display: flex; flex-direction: column; gap: 4px; background: rgba(255, 255, 255, 0.02); border-radius: 10px; padding: 10px; }
    .budget-top-info { display: flex; justify-content: space-between; align-items: center; }
    .cat-group { display: flex; align-items: center; gap: 8px; }
    .cat-icon { width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; span { font-size: 16px; } }
    .cat-name { font-size: 12px; font-weight: 700; color: #FFF; }
    .budget-status-pill { font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; &.excedido { background: rgba(239, 68, 68, 0.2); color: #F87171; } &.alerta, &.atencao { background: rgba(201, 167, 78, 0.2); color: #C9A74E; } &.normal { background: rgba(16, 185, 129, 0.2); color: #34D399; } }
    .budget-progress-track { height: 6px; background: rgba(255, 255, 255, 0.1); border-radius: 3px; overflow: hidden; }
    .budget-progress-fill { height: 100%; border-radius: 3px; &.fill-excedido { background: #EF4444; } &.fill-alerta { background: #C9A74E; } &.fill-normal { background: #10B981; } }
    .budget-values-row { display: flex; justify-content: space-between; font-size: 10px; color: rgba(255, 255, 255, 0.6); }
    .pct-text { font-weight: 700; &.danger { color: #F87171; } }

    .glass-inner-card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 12px; display: flex; flex-direction: column; gap: 8px; }
    .goal-header { display: flex; justify-content: space-between; align-items: flex-start; }
    .goal-title-row { display: flex; align-items: center; gap: 6px; }
    .goal-name { font-size: 13px; font-weight: 700; color: #FFF; }
    .goal-pct-pill { font-size: 10px; font-weight: 800; color: #C9A74E; background: rgba(201, 167, 78, 0.15); padding: 2px 6px; border-radius: 4px; }
    .goal-amounts { display: flex; flex-direction: column; align-items: flex-end; }
    .current-val { font-family: monospace; font-size: 14px; font-weight: 800; color: #C9A74E; }
    .target-val { font-size: 10px; color: rgba(255, 255, 255, 0.4); }
    .goal-progress-track { height: 8px; background: rgba(255, 255, 255, 0.1); border-radius: 4px; overflow: hidden; }
    .goal-progress-fill { height: 100%; border-radius: 4px; }
    .goal-footer { display: flex; justify-content: space-between; font-size: 10px; color: rgba(255, 255, 255, 0.6); }

    .chart-section { display: flex; flex-direction: column; gap: 14px; }
    .chart-legends { display: flex; gap: 10px; }
    .legend-chip { display: flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 6px; &.gold-chip { background: rgba(201, 167, 78, 0.15); color: #C9A74E; } &.bordo-chip { background: rgba(161, 61, 99, 0.15); color: #E07A9E; } }
    .chip-dot { width: 6px; height: 6px; border-radius: 50%; &.gold { background: #C9A74E; } &.bordo { background: #A13D63; } }
    .chart-wrapper { width: 100%; min-height: 240px; }
    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; color: rgba(255, 255, 255, 0.4); gap: 6px; span { font-size: 28px; color: #10B981; } p { margin: 0; font-size: 12px; } }

    @media (max-width: 1024px) {
      .executive-header { flex-direction: column; align-items: flex-start; gap: 14px; .header-actions { width: 100%; flex-wrap: wrap; .executive-btn { flex: 1; justify-content: center; } } }
      .main-widgets-grid, .secondary-widgets-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class DashboardPage {
  public readonly store = inject(DashboardStore);

  public readonly chartOptions = computed<ChartOptions>(() => {
    const dash = this.store.dashboardData();
    const saldoAtual = Number(dash?.saldoAtual || 0);
    const saldoProjetado = Number(dash?.saldoProjetado || 0);
    const despesas = Number(dash?.despesasPendentes || 0);

    const diffSaldo = (saldoProjetado - saldoAtual) / 6;
    const seriesSaldo = Array.from({ length: 7 }, (_, i) => Math.round(saldoAtual + diffSaldo * i));
    const seriesDespesas = Array.from({ length: 7 }, () => despesas);

    const hoje = new Date();
    const mesNome = hoje.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');
    const categories = ['01', '05', '10', '15', '20', '25', '30'].map((dia) => `${dia} ${mesNome}`);

    return {
      series: [
        {
          name: 'Saldo Projetado',
          data: seriesSaldo,
        },
        {
          name: 'Saídas & Despesas',
          data: seriesDespesas,
        },
      ],
      chart: {
        type: 'area',
        height: 250,
        toolbar: { show: false },
        background: 'transparent',
      },
      colors: ['#C9A74E', '#A13D63'],
      stroke: {
        curve: 'smooth',
        width: 3,
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.45,
          opacityTo: 0.05,
          stops: [0, 90, 100],
        },
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories,
        labels: {
          style: { colors: 'rgba(255, 255, 255, 0.5)', fontSize: '11px', fontFamily: 'Outfit' },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: { colors: 'rgba(255, 255, 255, 0.5)', fontSize: '11px', fontFamily: 'Space Grotesk' },
          formatter: (val) => `R$ ${val ? val.toLocaleString('pt-BR') : '0'}`,
        },
      },
      grid: {
        borderColor: 'rgba(201, 167, 78, 0.1)',
        strokeDashArray: 4,
      },
      tooltip: {
        theme: 'dark',
      },
    };
  });

  atualizarDashboard(): void {
    this.store.carregarDashboard();
  }

  formatarValor(valor: number): string {
    if (!this.store.saldoVisivel()) {
      return 'R$ •••••,••';
    }
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  calcularPercentualLimite(comprometido: number, total: number): number {
    if (!total || total <= 0) return 0;
    const pct = (comprometido / total) * 100;
    return Math.min(100, Math.round(pct));
  }

  getIconeSeveridade(severidade: SeveridadeAlerta): string {
    switch (severidade) {
      case 'CRITICO':
        return 'error';
      case 'ALTO':
        return 'warning';
      case 'MEDIO':
        return 'info';
      default:
        return 'notifications';
    }
  }

  formatarTipoAlerta(tipo: string): string {
    switch (tipo) {
      case 'ORCAMENTO_EXCEDIDO':
        return 'Orçamento Estourado';
      case 'FATURA_VENCIMENTO':
      case 'FATURA_VENCIDA':
        return 'Fatura de Cartão';
      case 'META_ATRASADA':
        return 'Meta Prioritária';
      case 'SALDO_BAIXO':
      case 'DEFICIT_PROJETADO':
        return 'Projeção de Saldo';
      case 'LANCAMENTO_ATRASADO':
        return 'Lançamento Pendente';
      default:
        return 'Notificação';
    }
  }
}
