import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule, NgApexchartsModule],
  template: `
    <div class="dashboard-container animate-fade-in">
      <!-- Premium Hero Welcome Banner -->
      <section class="hero-banner">
        <div class="banner-content">
          <div class="greeting-pill">
            <span class="pulse-dot"></span>
            <span>PLANEJAMENTO ATIVO • AGOSTO 2026</span>
          </div>
          <h1 class="welcome-title">Olá, Eduardo 👋</h1>
          <p class="welcome-subtitle">
            Seu planejamento financeiro para <strong>Construção da Casa</strong> está em dia. Você economizou <span class="highlight-gold">R$ 1.250,00 a mais</span> este mês.
          </p>
        </div>
        <div class="banner-actions">
          <button class="banner-btn secondary-btn">
            <span class="material-symbols-rounded">equalizer</span>
            <span>Simular Compra</span>
          </button>
          <button class="banner-btn primary-gold-btn">
            <span class="material-symbols-rounded">add</span>
            <span>Novo Lançamento</span>
          </button>
        </div>
      </section>

      <!-- Key Metrics Row (4 Cards) -->
      <section class="metrics-grid">
        <!-- Metric 1: Saldo Previsto -->
        <div class="metric-card glass-card gold-border-glow">
          <div class="card-header">
            <span class="card-label">Saldo Previsto (Fim do Mês)</span>
            <div class="icon-bubble gold-bubble">
              <span class="material-symbols-rounded">account_balance</span>
            </div>
          </div>
          <div class="card-value-group">
            <span class="card-value text-gold">R$ 8.420,00</span>
            <span class="trend-badge positive">+15.2% vs mês anterior</span>
          </div>
          <div class="card-footer">
            <span class="footer-text">3 contas bancárias ativas</span>
          </div>
        </div>

        <!-- Metric 2: Receitas Previstas -->
        <div class="metric-card glass-card">
          <div class="card-header">
            <span class="card-label">Receitas Previstas</span>
            <div class="icon-bubble positive-bubble">
              <span class="material-symbols-rounded">trending_up</span>
            </div>
          </div>
          <div class="card-value-group">
            <span class="card-value positive-text">R$ 11.200,00</span>
            <span class="sub-pill">Salário + Horas Extras</span>
          </div>
          <div class="card-footer">
            <span class="footer-text">22 dias úteis considerados</span>
          </div>
        </div>

        <!-- Metric 3: Despesas & Contas Fixas -->
        <div class="metric-card glass-card">
          <div class="card-header">
            <span class="card-label">Despesas Previstas</span>
            <div class="icon-bubble negative-bubble">
              <span class="material-symbols-rounded">trending_down</span>
            </div>
          </div>
          <div class="card-value-group">
            <span class="card-value negative-text">R$ 4.780,00</span>
            <span class="sub-pill">8 de 14 pagas</span>
          </div>
          <div class="card-footer">
            <span class="footer-text">Próximo vencimento: Internet em 2d</span>
          </div>
        </div>

        <!-- Metric 4: Cartões & Faturas -->
        <div class="metric-card glass-card">
          <div class="card-header">
            <span class="card-label">Cartão de Crédito</span>
            <div class="icon-bubble bordo-bubble">
              <span class="material-symbols-rounded">credit_card</span>
            </div>
          </div>
          <div class="card-value-group">
            <span class="card-value">R$ 2.150,00</span>
            <span class="sub-pill">Fatura Fecha em 15/08</span>
          </div>
          <div class="card-footer">
            <span class="footer-text">Limite Disponível: R$ 9.850,00</span>
          </div>
        </div>
      </section>

      <!-- Main Section: Goal Spotlight + Cash Flow Chart -->
      <section class="main-sections-grid">
        <!-- Goal Spotlight Card: Construção da Casa -->
        <div class="goal-spotlight-card glass-card">
          <div class="spotlight-header">
            <div class="spotlight-title-group">
              <span class="spotlight-tag">OBJETIVO PRINCIPAL</span>
              <h2>Construção da Casa 🏡</h2>
            </div>
            <div class="countdown-badge">
              <span class="material-symbols-rounded">timer</span>
              <span>8 Meses Restantes</span>
            </div>
          </div>

          <div class="progress-details-group">
            <div class="amount-group">
              <span class="current-amount">R$ 145.000,00</span>
              <span class="target-amount">de R$ 300.000,00</span>
            </div>
            <div class="percentage-pill">48.3%</div>
          </div>

          <!-- Deluxe Progress Bar -->
          <div class="deluxe-progress-track">
            <div class="deluxe-progress-bar" style="width: 48.3%;">
              <div class="progress-glow"></div>
            </div>
          </div>

          <!-- Environments & Stages Breakdown -->
          <div class="environments-chips-grid">
            <div class="env-chip completed">
              <span class="material-symbols-rounded">check_circle</span>
              <span>Fundação (100%)</span>
            </div>
            <div class="env-chip in-progress">
              <span class="material-symbols-rounded">pending</span>
              <span>Alvenaria (65%)</span>
            </div>
            <div class="env-chip pending">
              <span class="material-symbols-rounded">radio_button_unchecked</span>
              <span>Acabamento (0%)</span>
            </div>
          </div>

          <div class="spotlight-footer">
            <span class="aporte-sugestao">Aporte recomendado para este mês: <strong>R$ 3.200,00</strong></span>
            <button class="btn-aporte">
              <span class="material-symbols-rounded">payments</span>
              <span>Fazer Aporte</span>
            </button>
          </div>
        </div>

        <!-- Cash Flow Chart Widget -->
        <div class="chart-widget-card glass-card">
          <div class="widget-header">
            <div>
              <h3>Fluxo de Caixa & Projeção 📊</h3>
              <p class="widget-subtitle">Comparativo diário de Saldo e Previsões</p>
            </div>
            <div class="chart-legend-pills">
              <span class="legend-pill gold-pill">Saldo Projetado</span>
              <span class="legend-pill bordo-pill">Despesas</span>
            </div>
          </div>

          <div class="chart-container">
            <apx-chart
              [series]="chartOptions.series"
              [chart]="chartOptions.chart"
              [xaxis]="chartOptions.xaxis"
              [yaxis]="chartOptions.yaxis"
              [stroke]="chartOptions.stroke"
              [tooltip]="chartOptions.tooltip"
              [dataLabels]="chartOptions.dataLabels"
              [fill]="chartOptions.fill"
              [grid]="chartOptions.grid"
              [colors]="chartOptions.colors">
            </apx-chart>
          </div>
        </div>
      </section>

      <!-- Bottom Grid: Timeline Feed & Wishlist Highlights -->
      <section class="bottom-sections-grid">
        <!-- Timeline Feed Widget -->
        <div class="timeline-widget glass-card">
          <div class="widget-header">
            <h3>Linha do Tempo Financeira ⏳</h3>
            <span class="view-all-link">Ver completa →</span>
          </div>

          <div class="timeline-items">
            <div class="timeline-node">
              <div class="node-date">01 AGO</div>
              <div class="node-icon income"><span class="material-symbols-rounded">work</span></div>
              <div class="node-details">
                <span class="node-title">Recebimento Salário</span>
                <span class="node-sub">Eduardo — 22 dias úteis</span>
              </div>
              <div class="node-value positive">+ R$ 8.800,00</div>
            </div>

            <div class="timeline-node">
              <div class="node-date">05 AGO</div>
              <div class="node-icon expense"><span class="material-symbols-rounded">wifi</span></div>
              <div class="node-details">
                <span class="node-title">Pagamento Internet Fibra</span>
                <span class="node-sub">Conta Fixa Recorrente</span>
              </div>
              <div class="node-value negative">- R$ 149,90</div>
            </div>

            <div class="timeline-node">
              <div class="node-date">08 AGO</div>
              <div class="node-icon project"><span class="material-symbols-rounded">construction</span></div>
              <div class="node-details">
                <span class="node-title">Compra de Piso Porcelanato</span>
                <span class="node-sub">Etapa: Acabamento Banheiro</span>
              </div>
              <div class="node-value negative">- R$ 1.450,00</div>
            </div>
          </div>
        </div>

        <!-- Wishlist Price Watch Widget -->
        <div class="wishlist-widget glass-card">
          <div class="widget-header">
            <h3>Desejos & Cotações 🔥</h3>
            <span class="view-all-link">Ver Wishlist →</span>
          </div>

          <div class="wishlist-cards">
            <div class="wishlist-mini-card">
              <div class="wishlist-img-placeholder">🚰</div>
              <div class="wishlist-info">
                <span class="item-name">Torneira Monocomando Docol</span>
                <span class="item-status-pill quoted">COTADO • R$ 420,00</span>
              </div>
              <div class="price-drop-badge">-18% de Desconto</div>
            </div>

            <div class="wishlist-mini-card">
              <div class="wishlist-img-placeholder">🛋️</div>
              <div class="wishlist-info">
                <span class="item-name">Sofá Retrátil Veludo Champanhe</span>
                <span class="item-status-pill desired">DESEJADO • R$ 3.890,00</span>
              </div>
              <div class="price-stable-badge">Preço Estável</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    /* Hero Banner */
    .hero-banner {
      background: linear-gradient(135deg, rgba(74, 18, 26, 0.85) 0%, rgba(30, 10, 14, 0.95) 100%),
                  radial-gradient(circle at 90% 0%, rgba(216, 184, 126, 0.3) 0%, transparent 50%);
      border: 1px solid rgba(216, 184, 126, 0.3);
      border-radius: var(--radius-lg);
      padding: 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: var(--shadow-bordo-glow);
    }

    .greeting-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 4px 14px;
      border-radius: var(--radius-full);
      background: rgba(216, 184, 126, 0.15);
      border: 1px solid rgba(216, 184, 126, 0.3);
      color: var(--color-champagne-light);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1px;
      margin-bottom: 12px;
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--color-champagne-main);
      box-shadow: 0 0 10px var(--color-champagne-main);
    }

    .welcome-title {
      font-family: var(--font-primary);
      font-size: 32px;
      font-weight: 800;
      margin: 0 0 8px 0;
      color: #ffffff;
    }

    .welcome-subtitle {
      color: var(--color-text-secondary);
      font-size: 15px;
      margin: 0;
      max-width: 600px;
    }

    .highlight-gold {
      color: var(--color-champagne-main);
      font-weight: 700;
    }

    .banner-actions {
      display: flex;
      gap: 12px;
    }

    .banner-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border-radius: var(--radius-md);
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      border: none;
      transition: all 0.25s;

      &.primary-gold-btn {
        background: var(--color-gold-gradient);
        color: #2b0b10;
        box-shadow: var(--shadow-gold-glow);

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 30px rgba(216, 184, 126, 0.45);
        }
      }

      &.secondary-btn {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(216, 184, 126, 0.25);
        color: var(--color-champagne-light);

        &:hover {
          background: rgba(216, 184, 126, 0.18);
        }
      }
    }

    /* Metrics Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
    }

    .metric-card {
      padding: 22px;
      display: flex;
      flex-direction: column;
      gap: 14px;

      &.gold-border-glow {
        border: 1px solid rgba(216, 184, 126, 0.4);
        box-shadow: var(--shadow-gold-glow);
      }
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--color-text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .icon-bubble {
      width: 36px;
      height: 36px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;

      span { font-size: 20px; }
      &.gold-bubble { background: rgba(216, 184, 126, 0.15); color: var(--color-champagne-main); }
      &.positive-bubble { background: var(--color-positive-bg); color: var(--color-positive); }
      &.negative-bubble { background: var(--color-negative-bg); color: var(--color-negative); }
      &.bordo-bubble { background: rgba(146, 38, 56, 0.2); color: var(--color-bordo-light); }
    }

    .card-value-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .card-value {
      font-family: var(--font-mono);
      font-size: 26px;
      font-weight: 700;
      color: var(--color-text-primary);

      &.text-gold {
        background: var(--color-gold-gradient);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      &.positive-text { color: var(--color-positive); }
      &.negative-text { color: var(--color-negative); }
    }

    .trend-badge {
      font-size: 11px;
      font-weight: 700;
      &.positive { color: var(--color-positive); }
    }

    .sub-pill {
      font-size: 11px;
      color: var(--color-text-tertiary);
    }

    .card-footer {
      border-top: 1px solid var(--color-border-subtle);
      padding-top: 10px;
    }

    .footer-text {
      font-size: 11px;
      color: var(--color-text-tertiary);
      font-weight: 500;
    }

    /* Main Sections Grid */
    .main-sections-grid {
      display: grid;
      grid-template-columns: 1fr 1.2fr;
      gap: 24px;
    }

    /* Goal Spotlight Card */
    .goal-spotlight-card {
      padding: 28px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .spotlight-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .spotlight-tag {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1.5px;
      color: var(--color-champagne-main);
    }

    .spotlight-header h2 {
      font-family: var(--font-primary);
      font-size: 24px;
      font-weight: 800;
      margin: 4px 0 0 0;
      color: var(--color-text-primary);
    }

    .countdown-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: var(--radius-full);
      background: rgba(216, 184, 126, 0.12);
      border: 1px solid rgba(216, 184, 126, 0.25);
      color: var(--color-champagne-light);
      font-size: 11px;
      font-weight: 700;

      span { font-size: 16px; }
    }

    .progress-details-group {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .amount-group {
      display: flex;
      flex-direction: column;
    }

    .current-amount {
      font-family: var(--font-mono);
      font-size: 28px;
      font-weight: 800;
      color: var(--color-champagne-main);
    }

    .target-amount {
      font-size: 12px;
      color: var(--color-text-tertiary);
    }

    .percentage-pill {
      font-size: 22px;
      font-weight: 800;
      color: var(--color-champagne-light);
    }

    .deluxe-progress-track {
      height: 12px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 6px;
      overflow: hidden;
      position: relative;
    }

    .deluxe-progress-bar {
      height: 100%;
      background: var(--color-gold-gradient);
      border-radius: 6px;
      position: relative;
    }

    .progress-glow {
      position: absolute;
      top: 0; right: 0; bottom: 0; left: 0;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
      animation: shimmer 2.5s infinite;
    }

    .environments-chips-grid {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .env-chip {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: var(--radius-sm);
      font-size: 12px;
      font-weight: 600;

      span { font-size: 16px; }
      &.completed { background: rgba(16, 185, 129, 0.15); color: #34d399; }
      &.in-progress { background: rgba(216, 184, 126, 0.15); color: var(--color-champagne-light); }
      &.pending { background: rgba(255, 255, 255, 0.05); color: var(--color-text-tertiary); }
    }

    .spotlight-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid var(--color-border-subtle);
      padding-top: 16px;
    }

    .aporte-sugestao {
      font-size: 12px;
      color: var(--color-text-secondary);
    }

    .btn-aporte {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: var(--radius-md);
      background: var(--color-primary-gradient);
      color: #ffffff;
      border: 1px solid rgba(216, 184, 126, 0.3);
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
    }

    /* Chart Widget Card */
    .chart-widget-card {
      padding: 28px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .widget-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 { margin: 0; font-family: var(--font-primary); font-size: 20px; font-weight: 700; color: var(--color-text-primary); }
    }

    .widget-subtitle {
      margin: 2px 0 0 0;
      font-size: 12px;
      color: var(--color-text-tertiary);
    }

    .chart-legend-pills {
      display: flex;
      gap: 8px;
    }

    .legend-pill {
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 12px;

      &.gold-pill { background: rgba(216, 184, 126, 0.2); color: var(--color-champagne-main); }
      &.bordo-pill { background: rgba(146, 38, 56, 0.2); color: var(--color-bordo-light); }
    }

    .chart-container {
      margin-top: 8px;
    }

    /* Bottom Grid */
    .bottom-sections-grid {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 24px;
    }

    .timeline-widget, .wishlist-widget {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .view-all-link {
      font-size: 12px;
      font-weight: 700;
      color: var(--color-champagne-main);
      cursor: pointer;
    }

    .timeline-items {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .timeline-node {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px;
      border-radius: var(--radius-md);
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--color-border-subtle);
    }

    .node-date {
      font-size: 11px;
      font-weight: 800;
      color: var(--color-champagne-main);
      width: 48px;
    }

    .node-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;

      span { font-size: 20px; }
      &.income { background: var(--color-positive-bg); color: var(--color-positive); }
      &.expense { background: var(--color-negative-bg); color: var(--color-negative); }
      &.project { background: rgba(216, 184, 126, 0.15); color: var(--color-champagne-main); }
    }

    .node-details {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .node-title { font-size: 13px; font-weight: 700; color: var(--color-text-primary); }
    .node-sub { font-size: 11px; color: var(--color-text-tertiary); }
    .node-value { font-family: var(--font-mono); font-weight: 700; font-size: 14px; }

    /* Wishlist Mini Cards */
    .wishlist-cards {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .wishlist-mini-card {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px 16px;
      border-radius: var(--radius-md);
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--color-border-subtle);
    }

    .wishlist-img-placeholder {
      font-size: 24px;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: rgba(216, 184, 126, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .wishlist-info {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .item-name { font-size: 13px; font-weight: 700; color: var(--color-text-primary); }
    .item-status-pill { font-size: 10px; font-weight: 800; margin-top: 2px; }
    .item-status-pill.quoted { color: var(--color-champagne-main); }
    .item-status-pill.desired { color: var(--color-text-tertiary); }

    .price-drop-badge {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 12px;
    }

    .price-stable-badge {
      background: rgba(255, 255, 255, 0.05);
      color: var(--color-text-tertiary);
      font-size: 11px;
      padding: 4px 10px;
      border-radius: 12px;
    }

    @media (max-width: 1024px) {
      .main-sections-grid, .bottom-sections-grid {
        grid-template-columns: 1fr;
      }
      .hero-banner {
        flex-direction: column;
        align-items: flex-start;
        gap: 20px;
      }
    }
  `],
})
export class DashboardPage {
  public chartOptions: ChartOptions = {
    series: [
      {
        name: 'Saldo Projetado',
        data: [3200, 4100, 4800, 4200, 6500, 7800, 8420],
      },
      {
        name: 'Despesas',
        data: [1200, 1500, 900, 2100, 1100, 1400, 950],
      },
    ],
    chart: {
      type: 'area',
      height: 240,
      toolbar: { show: false },
      background: 'transparent',
    },
    colors: ['#d8b87e', '#c43c52'],
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
      categories: ['01 AGO', '05 AGO', '10 AGO', '15 AGO', '20 AGO', '25 AGO', '30 AGO'],
      labels: {
        style: { colors: '#9c8e7c', fontSize: '11px', fontFamily: 'Outfit' },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: '#9c8e7c', fontSize: '11px', fontFamily: 'Space Grotesk' },
        formatter: (val) => `R$ ${val}`,
      },
    },
    grid: {
      borderColor: 'rgba(216, 184, 126, 0.1)',
      strokeDashArray: 4,
    },
    tooltip: {
      theme: 'dark',
    },
  };
}
