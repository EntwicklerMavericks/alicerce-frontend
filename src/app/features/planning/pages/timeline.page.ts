import { Component, inject, OnInit, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
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
} from 'ng-apexcharts';
import { PlanningStore } from '../store/planning.store';
import { ExplanationBreakdownComponent } from '../components/explanation-breakdown.component';
import { ZonaSaudeFinanceira, ProjectedEvent } from '../../../core/models/planning.models';

export type ApexChartOptions = {
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
  selector: 'app-timeline-page',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, ExplanationBreakdownComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="timeline-container animate-fade-in">
      <!-- 1. Hero Banner com Estatísticas Sintéticas -->
      <section class="hero-planning-banner glass-card">
        <div class="banner-top-bar">
          <div class="banner-title-group">
            <div class="planning-badge">
              <span class="pulse-ring"></span>
              <span>SPRINT 5.1 • TIMELINE & FORECAST</span>
            </div>
            <h1 class="main-title">Projeção Financeira de 12 Meses 📈</h1>
            <p class="main-subtitle">
              Visão preditiva contínua combinando saldos atuais, contas recorrentes, metas e aportes futuros.
            </p>
          </div>

          <div class="banner-actions">
            <button class="action-btn secondary" (click)="store.carregarForecast()">
              <span class="material-symbols-rounded">refresh</span>
              <span>Recalcular</span>
            </button>
          </div>
        </div>

        <!-- Metric Cards Bar (4 Sintéticas) -->
        <div class="synthetic-metrics-grid">
          <!-- Card 1: Saldo Projetado 12M -->
          <div class="metric-box gold-box">
            <div class="box-header">
              <span class="box-label">Saldo Projetado (12M)</span>
              <span class="material-symbols-rounded box-icon">account_balance_wallet</span>
            </div>
            <div class="box-value text-gold">
              R$ {{ store.saldoProjetado12Meses() | number : '1.2-2' }}
            </div>
            <div class="box-footer">
              <span>Saldo Inicial: R$ {{ store.saldoAtual() | number : '1.2-2' }}</span>
            </div>
          </div>

          <!-- Card 2: Mês de Maior Saldo -->
          <div class="metric-box green-box">
            <div class="box-header">
              <span class="box-label">Mês de Maior Saldo</span>
              <span class="material-symbols-rounded box-icon">trending_up</span>
            </div>
            <div class="box-value text-green" *ngIf="store.mesMaiorSaldo() as pico">
              R$ {{ pico.valor | number : '1.2-2' }}
            </div>
            <div class="box-footer" *ngIf="store.mesMaiorSaldo() as pico">
              <span class="highlight-pill green">Pico em {{ pico.mesRotulo }}</span>
            </div>
          </div>

          <!-- Card 3: Mês de Maior Aperto -->
          <div class="metric-box bordo-box">
            <div class="box-header">
              <span class="box-label">Mês de Maior Aperto</span>
              <span class="material-symbols-rounded box-icon">warning</span>
            </div>
            <div class="box-value text-bordo" *ngIf="store.mesMaiorAperto() as aperto">
              R$ {{ aperto.valor | number : '1.2-2' }}
            </div>
            <div class="box-footer" *ngIf="store.mesMaiorAperto() as aperto">
              <span class="highlight-pill bordo">Maior impacto em {{ aperto.mesRotulo }}</span>
            </div>
          </div>

          <!-- Card 4: Zona de Saúde Financeira -->
          <div class="metric-box health-box" [ngClass]="getHealthCssClass(store.zonaGlobal())">
            <div class="box-header">
              <span class="box-label">Zona de Saúde</span>
              <span class="material-symbols-rounded box-icon">health_metrics</span>
            </div>
            <div class="box-value health-text">
              {{ getHealthLabel(store.zonaGlobal()) }}
            </div>
            <div class="box-footer">
              <span class="health-desc">{{ getHealthDescription(store.zonaGlobal()) }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. Barra de Controle e Alternância de Visões -->
      <section class="controls-bar glass-card">
        <div class="view-toggle-group">
          <button
            class="toggle-btn"
            [class.active]="store.viewMode() === 'CUMULATIVO'"
            (click)="store.setViewMode('CUMULATIVO')"
          >
            <span class="material-symbols-rounded">show_chart</span>
            <span>Saldo Cumulativo (12 Meses)</span>
          </button>
          <button
            class="toggle-btn"
            [class.active]="store.viewMode() === 'ENTRADAS_SAIDAS'"
            (click)="store.setViewMode('ENTRADAS_SAIDAS')"
          >
            <span class="material-symbols-rounded">bar_chart</span>
            <span>Entradas vs Saídas Mensais</span>
          </button>
        </div>

        <div class="summary-pills-bar">
          <div class="summary-pill">
            <span class="pill-title">Total Receitas 12M:</span>
            <span class="pill-val green">+R$ {{ store.totalEntradas12Meses() | number : '1.2-2' }}</span>
          </div>
          <div class="summary-pill">
            <span class="pill-title">Total Despesas 12M:</span>
            <span class="pill-val bordo">-R$ {{ store.totalSaidas12Meses() | number : '1.2-2' }}</span>
          </div>
          <div class="summary-pill">
            <span class="pill-title">Média Mensal:</span>
            <span class="pill-val gold">R$ {{ store.mediaResultadoMensal() | number : '1.2-2' }}/mês</span>
          </div>
        </div>
      </section>

      <!-- 3. Gráfico de Área Contínuo ApexCharts -->
      <section class="chart-section glass-card">
        <div class="chart-header">
          <div>
            <h3 class="section-title">
              {{ store.viewMode() === 'CUMULATIVO' ? 'Curva da Projeção de Saldo Acumulado' : 'Comparativo Mensal de Entradas x Saídas' }}
            </h3>
            <p class="section-subtitle">
              {{ store.viewMode() === 'CUMULATIVO' ? 'Acompanhe a trajetória de caixa projetada mês a mês' : 'Visualize a proporção entre receitas e despesas em cada competência' }}
            </p>
          </div>

          <div class="health-legend-triade" *ngIf="store.viewMode() === 'CUMULATIVO'">
            <div class="legend-item green">
              <span class="dot"></span>
              <span>Saudável (&gt; R$ 15k)</span>
            </div>
            <div class="legend-item yellow">
              <span class="dot"></span>
              <span>Atenção (R$ 5k - R$ 15k)</span>
            </div>
            <div class="legend-item red">
              <span class="dot"></span>
              <span>Crítico (&lt; R$ 5k)</span>
            </div>
          </div>
        </div>

        <div class="chart-wrapper">
          <apx-chart
            *ngIf="store.competencias().length > 0"
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

      <!-- 4. Explanation Breakdown Component (Categoria & Fonte) -->
      <section class="breakdown-section">
        <app-explanation-breakdown></app-explanation-breakdown>
      </section>

      <!-- 5. Tabela Detalhada Mês a Mês com Accordion Expansível -->
      <section class="table-section glass-card">
        <div class="table-header">
          <div>
            <h3 class="section-title">
              <span class="material-symbols-rounded header-icon">table_chart</span>
              Detalhamento Mensal & Eventos Projetados
            </h3>
            <p class="section-subtitle">
              Clique em qualquer linha para expandir e auditar todos os lançamentos da competência
            </p>
          </div>

          <span class="table-counter-badge">{{ store.competencias().length }} Meses em Exibição</span>
        </div>

        <div class="forecast-cards-container">
          <div
            *ngFor="let item of store.competencias()"
            class="month-card glass-card"
            [class.expanded]="store.isAccordionExpanded(item.competencia)"
            [class.selected-card]="store.selectedCompetencia() === item.competencia"
          >
            <!-- Header do Card do Mês -->
            <div class="month-card-header" (click)="store.toggleAccordion(item.competencia)">
              <div class="month-identity">
                <div class="month-badge-box">
                  <span class="month-title">{{ item.mesRotulo }}</span>
                  <span class="month-sub">{{ item.competencia }}</span>
                </div>
                <span class="status-badge" [ngClass]="getHealthCssClass(item.zonaSaude)">
                  <span class="badge-dot"></span>
                  {{ getHealthLabel(item.zonaSaude) }}
                </span>
              </div>

              <div class="month-final-summary">
                <div class="amount-wrap">
                  <span class="amount-label">Saldo Acumulado</span>
                  <span class="amount-val text-gold font-mono">R$ {{ item.saldoProjetado | number : '1.2-2' }}</span>
                </div>
                <button class="expand-circle-btn" [class.rotated]="store.isAccordionExpanded(item.competencia)">
                  <span class="material-symbols-rounded">expand_more</span>
                </button>
              </div>
            </div>

            <!-- Grid de Resumo Financeiro do Mês (4 Pílulas Sintéticas em Grid 2x2) -->
            <div class="month-metrics-grid">
              <div class="metric-pill">
                <span class="pill-lbl">Saldo Inicial</span>
                <span class="pill-num font-mono">R$ {{ item.saldoInicial | number : '1.2-2' }}</span>
              </div>
              <div class="metric-pill green">
                <span class="pill-lbl">Entradas (+)</span>
                <span class="pill-num font-mono">+R$ {{ item.totalEntradas | number : '1.2-2' }}</span>
              </div>
              <div class="metric-pill bordo">
                <span class="pill-lbl">Saídas (-)</span>
                <span class="pill-num font-mono">-R$ {{ item.totalSaidas | number : '1.2-2' }}</span>
              </div>
              <div class="metric-pill" [class.green]="item.resultadoMes >= 0" [class.bordo]="item.resultadoMes < 0">
                <span class="pill-lbl">Resultado Mês</span>
                <span class="pill-num font-mono">{{ item.resultadoMes >= 0 ? '+' : '' }}R$ {{ item.resultadoMes | number : '1.2-2' }}</span>
              </div>
            </div>

            <!-- Accordion Expansível de Lançamentos -->
            <div *ngIf="store.isAccordionExpanded(item.competencia)" class="month-accordion-body">
              <div class="accordion-sub-header">
                <h4>Eventos & Lançamentos Projetados de {{ item.mesRotulo }} ({{ item.eventos.length }})</h4>
                <button
                  class="select-comp-btn"
                  (click)="store.selecionarCompetencia(item.competencia); $event.stopPropagation()"
                >
                  {{ store.selectedCompetencia() === item.competencia ? 'Desfiltrar Categoria' : 'Filtrar Categorias Deste Mês' }}
                </button>
              </div>

              <div class="events-cards-list">
                <div *ngFor="let ev of item.eventos" class="event-mini-card">
                  <div class="event-left">
                    <span class="type-icon-badge" [ngClass]="ev.tipo.toLowerCase()">
                      <span class="material-symbols-rounded">{{ getEventTypeIcon(ev.tipo) }}</span>
                    </span>
                    <div class="event-details">
                      <span class="event-desc">{{ ev.descricao }}</span>
                      <div class="event-tags">
                        <span class="tag-cat">{{ ev.categoria }}</span>
                        <span class="tag-src">{{ ev.fonte }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="event-right">
                    <span class="event-val font-mono" [class.text-green]="ev.tipo === 'RECEITA'" [class.text-bordo]="ev.tipo !== 'RECEITA'">
                      {{ ev.tipo === 'RECEITA' ? '+' : '-' }} R$ {{ ev.valor | number : '1.2-2' }}
                    </span>
                    <span class="confirm-badge" [class.confirmed]="ev.confirmado">
                      {{ ev.confirmado ? 'Confirmado' : 'Projetado' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .timeline-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
      padding: 20px;
      max-width: 1280px;
      margin: 0 auto;
    }

    /* Hero Banner */
    .hero-planning-banner {
      background: linear-gradient(135deg, rgba(74, 18, 26, 0.9) 0%, rgba(30, 10, 14, 0.98) 100%),
                  radial-gradient(circle at 95% 5%, rgba(201, 167, 78, 0.25) 0%, transparent 60%);
      border: 1px solid rgba(216, 184, 126, 0.35);
      border-radius: 20px;
      padding: 28px;
      box-shadow: 0 10px 40px rgba(161, 61, 99, 0.2);
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .banner-top-bar {
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
      max-width: 650px;
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

    /* Metric Box Grid */
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

    .box-footer {
      font-size: 11px;
      color: #9c8e7c;
    }

    .highlight-pill {
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 6px;

      &.green { background: rgba(16, 185, 129, 0.15); color: #34d399; }
      &.bordo { background: rgba(161, 61, 99, 0.2); color: #f87171; }
    }

    /* Controls Bar */
    .controls-bar {
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .view-toggle-group {
      display: flex;
      gap: 8px;
      background: rgba(0, 0, 0, 0.3);
      padding: 4px;
      border-radius: 12px;
      border: 1px solid rgba(216, 184, 126, 0.2);
    }

    .toggle-btn {
      background: transparent;
      border: none;
      color: #9c8e7c;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      transition: all 0.2s ease;

      span { font-size: 18px; }

      &.active {
        background: var(--color-gold-gradient, linear-gradient(135deg, #d8b87e 0%, #c9a74e 100%));
        color: #2b0b10;
        box-shadow: 0 4px 14px rgba(201, 167, 78, 0.35);
      }
    }

    .summary-pills-bar {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .summary-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;

      .pill-title { color: #9c8e7c; }
      .pill-val {
        font-family: var(--font-mono, 'Space Grotesk', monospace);
        font-weight: 700;
        &.green { color: #34d399; }
        &.bordo { color: #f87171; }
        &.gold { color: #C9A74E; }
      }
    }

    /* Chart Section */
    .chart-section {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      flex-wrap: wrap;
    }

    .section-title {
      font-family: var(--font-primary, 'Outfit', sans-serif);
      font-size: 20px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;

      .header-icon { color: #C9A74E; }
    }

    .section-subtitle {
      font-size: 12px;
      color: #9c8e7c;
      margin: 4px 0 0 0;
    }

    .health-legend-triade {
      display: flex;
      gap: 12px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: #9c8e7c;

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }

      &.green .dot { background: #10b981; box-shadow: 0 0 8px #10b981; }
      &.yellow .dot { background: #f59e0b; box-shadow: 0 0 8px #f59e0b; }
      &.red .dot { background: #ef4444; box-shadow: 0 0 8px #ef4444; }
    }

    .chart-wrapper {
      margin-top: 8px;
      min-height: 320px;
    }

    /* Table Section */
    .table-section {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .table-counter-badge {
      background: rgba(201, 167, 78, 0.12);
      border: 1px solid rgba(201, 167, 78, 0.3);
      color: #ebd9b6;
      font-size: 12px;
      font-weight: 700;
      padding: 6px 12px;
      border-radius: 9999px;
    }

    .responsive-table-container {
      overflow-x: auto;
    }

    .forecast-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0 6px;

      th {
        padding: 12px 14px;
        font-size: 11px;
        font-weight: 700;
        color: #9c8e7c;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        text-align: left;
        border-bottom: 1px solid rgba(216, 184, 126, 0.15);
      }

      .text-right { text-align: right; }
    }

    .main-row {
      background: rgba(255, 255, 255, 0.03);
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;

      td {
        padding: 14px;
        font-size: 13px;
        color: #ffffff;

        &:first-child { border-radius: 10px 0 0 10px; }
        &:last-child { border-radius: 0 10px 10px 0; }
      }

      &:hover {
        background: rgba(255, 255, 255, 0.07);
      }

      &.selected-row {
        background: rgba(201, 167, 78, 0.1);
      }

      &.expanded {
        background: rgba(161, 61, 99, 0.15);
      }
    }

    .cell-month {
      display: flex;
      flex-direction: column;

      .month-label { font-weight: 800; font-size: 14px; color: #C9A74E; }
      .month-sub { font-size: 10px; color: #9c8e7c; }
    }

    .cell-mono {
      font-family: var(--font-mono, 'Space Grotesk', monospace);
      font-weight: 600;
    }

    .bold-val { font-weight: 800; }
    .text-green { color: #34d399 !important; }
    .text-bordo { color: #f87171 !important; }
    .text-gold { color: #C9A74E !important; }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 800;

      .badge-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
      }

      &.saude-verde {
        background: rgba(16, 185, 129, 0.15);
        color: #34d399;
        .badge-dot { background: #34d399; }
      }

      &.saude-amarelo {
        background: rgba(245, 158, 11, 0.15);
        color: #fbbf24;
        .badge-dot { background: #fbbf24; }
      }

      &.saude-vermelho {
        background: rgba(239, 68, 68, 0.15);
        color: #f87171;
        .badge-dot { background: #f87171; }
      }
    }

    .expand-btn {
      background: transparent;
      border: none;
      color: #C9A74E;
      cursor: pointer;
      transition: transform 0.2s ease;

      &.rotated {
        transform: rotate(180deg);
      }
    }

    .forecast-cards-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 100%;
    }

    .month-card {
      padding: 14px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(216, 184, 126, 0.15);
      transition: all 0.2s ease;
      box-sizing: border-box;

      &.selected-card {
        border-color: #C9A74E;
        background: rgba(201, 167, 78, 0.08);
      }
    }

    .month-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      gap: 10px;
    }

    .month-identity {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .month-badge-box {
      display: flex;
      flex-direction: column;
    }

    .month-title {
      font-size: 15px;
      font-weight: 800;
      color: #ffffff;
    }

    .month-sub {
      font-size: 10px;
      color: rgba(255, 255, 255, 0.5);
    }

    .month-final-summary {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .amount-wrap {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .amount-label {
      font-size: 9px;
      color: rgba(255, 255, 255, 0.5);
      text-transform: uppercase;
    }

    .amount-val {
      font-size: 14px;
      font-weight: 800;
    }

    .expand-circle-btn {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.06);
      border: none;
      color: #C9A74E;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.2s ease;

      &.rotated {
        transform: rotate(180deg);
      }
    }

    .month-metrics-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }

    .metric-pill {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 8px;
      padding: 6px 10px;
      display: flex;
      flex-direction: column;

      .pill-lbl {
        font-size: 9px;
        color: rgba(255, 255, 255, 0.5);
      }

      .pill-num {
        font-size: 12px;
        font-weight: 700;
        color: #ffffff;
      }

      &.green .pill-num { color: #34d399; }
      &.bordo .pill-num { color: #f87171; }
    }

    .month-accordion-body {
      margin-top: 14px;
      padding-top: 14px;
      border-top: 1px dashed rgba(201, 167, 78, 0.25);
    }

    .accordion-sub-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;

      h4 {
        margin: 0;
        font-size: 13px;
        font-weight: 700;
        color: #C9A74E;
      }
    }

    .select-comp-btn {
      background: rgba(201, 167, 78, 0.15);
      border: 1px solid rgba(201, 167, 78, 0.3);
      color: #ebd9b6;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 700;
      cursor: pointer;
    }

    .events-cards-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .event-mini-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 10px;
      padding: 8px 10px;
      gap: 8px;
    }

    .event-left {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }

    .event-details {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .event-desc {
      font-size: 12px;
      font-weight: 700;
      color: #ffffff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .event-tags {
      display: flex;
      gap: 4px;
      font-size: 9px;
      color: rgba(255, 255, 255, 0.5);

      .tag-cat { background: rgba(255, 255, 255, 0.05); padding: 1px 4px; border-radius: 4px; }
      .tag-src { color: rgba(201, 167, 78, 0.8); }
    }

    .event-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      flex-shrink: 0;
    }

    .event-val {
      font-size: 12px;
      font-weight: 700;

      &.text-green { color: #34d399; }
      &.text-bordo { color: #f87171; }
    }

    .type-icon-badge {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      span { font-size: 16px; }

      &.receita { background: rgba(16, 185, 129, 0.2); color: #34d399; }
      &.despesa { background: rgba(239, 68, 68, 0.2); color: #f87171; }
      &.meta { background: rgba(201, 167, 78, 0.2); color: #C9A74E; }
      &.projeto { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
      &.recorrencia { background: rgba(161, 61, 99, 0.25); color: #f472b6; }
      &.fatura { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
    }

    .confirm-badge {
      font-size: 9px;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.06);
      color: #9c8e7c;

      &.confirmed {
        background: rgba(16, 185, 129, 0.15);
        color: #34d399;
      }
    }

    .font-bold { font-weight: 700; color: #ffffff; }

    @media (max-width: 768px) {
      .events-grid-header, .event-grid-row {
        grid-template-columns: 1fr 1fr;
      }
    }
  `],
})
export class TimelinePage implements OnInit {
  readonly store = inject(PlanningStore);

  ngOnInit(): void {
    this.store.carregarForecast();
  }

  readonly chartOptions = computed<ApexChartOptions>(() => {
    const competencias = this.store.competencias();
    const viewMode = this.store.viewMode();
    const categories = competencias.map((c) => c.mesRotulo);

    if (viewMode === 'ENTRADAS_SAIDAS') {
      const entradas = competencias.map((c) => c.totalEntradas);
      const saidas = competencias.map((c) => c.totalSaidas);

      return {
        series: [
          { name: 'Entradas (+)', data: entradas },
          { name: 'Saídas (-)', data: saidas },
        ],
        chart: {
          type: 'bar',
          height: 320,
          toolbar: { show: false },
          background: 'transparent',
        },
        colors: ['#10b981', '#A13D63'],
        stroke: { width: 0 },
        fill: { opacity: 0.9 },
        dataLabels: { enabled: false },
        xaxis: {
          categories,
          labels: { style: { colors: '#9c8e7c', fontSize: '11px', fontFamily: 'Outfit' } },
          axisBorder: { show: false },
          axisTicks: { show: false },
        },
        yaxis: {
          labels: {
            style: { colors: '#9c8e7c', fontSize: '11px', fontFamily: 'Space Grotesk' },
            formatter: (val) => `R$ ${val.toLocaleString('pt-BR')}`,
          },
        },
        grid: { borderColor: 'rgba(216, 184, 126, 0.1)', strokeDashArray: 4 },
        tooltip: { theme: 'dark' },
      };
    }

    // CUMULATIVO Area Chart
    const acumulado = competencias.map((c) => c.saldoProjetado);

    return {
      series: [
        { name: 'Saldo Acumulado Projetado', data: acumulado },
      ],
      chart: {
        type: 'area',
        height: 320,
        toolbar: { show: false },
        background: 'transparent',
      },
      colors: ['#C9A74E'],
      stroke: { curve: 'smooth', width: 3 },
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
        labels: { style: { colors: '#9c8e7c', fontSize: '11px', fontFamily: 'Outfit' } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: { colors: '#9c8e7c', fontSize: '11px', fontFamily: 'Space Grotesk' },
          formatter: (val) => `R$ ${val.toLocaleString('pt-BR')}`,
        },
      },
      grid: { borderColor: 'rgba(216, 184, 126, 0.1)', strokeDashArray: 4 },
      tooltip: { theme: 'dark' },
    };
  });

  getHealthCssClass(zona: ZonaSaudeFinanceira): string {
    switch (zona) {
      case 'VERDE':
        return 'saude-verde';
      case 'AMARELO':
        return 'saude-amarelo';
      case 'VERMELHO':
        return 'saude-vermelho';
      default:
        return 'saude-verde';
    }
  }

  getHealthLabel(zona: ZonaSaudeFinanceira): string {
    switch (zona) {
      case 'VERDE':
        return 'Verde (Saudável)';
      case 'AMARELO':
        return 'Amarelo (Atenção)';
      case 'VERMELHO':
        return 'Vermelho (Crítico)';
      default:
        return 'Saudável';
    }
  }

  getHealthDescription(zona: ZonaSaudeFinanceira): string {
    switch (zona) {
      case 'VERDE':
        return 'Margem de caixa confortável mantida nos 12 meses';
      case 'AMARELO':
        return 'Compromisso elevado ou meses de forte oscilação';
      case 'VERMELHO':
        return 'Risco de saldo negativo exigindo contenção urgente';
      default:
        return '';
    }
  }

  getEventTypeIcon(tipo: string): string {
    switch (tipo) {
      case 'RECEITA':
        return 'arrow_upward';
      case 'DESPESA':
        return 'arrow_downward';
      case 'META':
        return 'flag';
      case 'PROJETO':
        return 'construction';
      case 'RECORRENCIA':
        return 'autorenew';
      case 'FATURA':
        return 'credit_card';
      default:
        return 'sell';
    }
  }
}
