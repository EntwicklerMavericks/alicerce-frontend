import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  NgApexchartsModule,
  ApexAxisChartSeries,
  ApexNonAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexStroke,
  ApexTooltip,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexLegend,
  ApexPlotOptions,
} from 'ng-apexcharts';
import { RelatoriosStore, AbaRelatorio } from '../store/relatorios.store';
import { TipoPeriodoRelatorio } from '../../../core/models/relatorios.models';

@Component({
  selector: 'app-relatorios-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgApexchartsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relatorios-container animate-fade-in">
      <!-- 1. Header Executivo da Página -->
      <header class="executive-header">
        <div class="header-main-info">
          <div class="executive-badge">
            <span class="pulse-dot"></span>
            <span>AUDITORIA & EXECUTIVE ANALYTICS</span>
          </div>
          <h1 class="page-title">
            Relatórios Analíticos & Exportações 📊
          </h1>
          <p class="page-subtitle">
            Consolidado executivo de fluxo de caixa, distribuição por categorias, gestão de cartões de crédito e evolução de metas/projetos.
          </p>
        </div>

        <div class="header-actions">
          <button
            class="executive-btn refresh-btn"
            (click)="store.carregarRelatorios()"
            [disabled]="store.carregando()"
          >
            <span class="material-symbols-rounded" [class.spin]="store.carregando()">refresh</span>
            <span>Atualizar Dados</span>
          </button>
        </div>
      </header>

      <!-- 2. Barra de Seleção de Período Executivo -->
      <section class="period-selection-card glass-card">
        <div class="period-header">
          <div class="period-title-group">
            <span class="material-symbols-rounded icon-gold">calendar_today</span>
            <h3>Período de Análise</h3>
          </div>
          <span class="period-subtitle">Selecione a janela temporal para recalcular os indicadores</span>
        </div>

        <div class="period-pills-row">
          <button
            *ngFor="let p of periodosDisponiveis"
            class="period-pill"
            [class.active]="store.filtroPeriodo().tipoPeriodo === p.value"
            (click)="selecionarPeriodo(p.value)"
          >
            {{ p.label }}
          </button>
        </div>

        <!-- Filtro de Datas Personalizadas -->
        <div *ngIf="store.filtroPeriodo().tipoPeriodo === 'PERSONALIZADO'" class="custom-date-row animate-fade-in">
          <div class="input-field">
            <label>Data Início</label>
            <input type="date" [(ngModel)]="dataInicio" class="date-input" />
          </div>
          <div class="input-field">
            <label>Data Fim</label>
            <input type="date" [(ngModel)]="dataFim" class="date-input" />
          </div>
          <button class="apply-date-btn" (click)="aplicarDataPersonalizada()">
            <span class="material-symbols-rounded">filter_alt</span>
            <span>Filtrar</span>
          </button>
        </div>
      </section>

      <!-- 3. Barra de Exportação Executiva (PDF, Excel, CSV) -->
      <section class="export-action-bar glass-card gold-border">
        <div class="export-info">
          <div class="export-icon-box">
            <span class="material-symbols-rounded">download_for_offline</span>
          </div>
          <div>
            <h3 class="export-title">Exportação de Relatórios Executivos</h3>
            <p class="export-desc">Baixe dados consolidados nos formatos PDF, Excel e CSV com 1 clique</p>
          </div>
        </div>

        <div class="export-buttons-group">
          <!-- Botão PDF Executivo -->
          <button
            class="export-btn pdf-btn"
            (click)="store.baixarPdf()"
            [disabled]="store.baixandoExportacao() === 'pdf'"
          >
            <span class="material-symbols-rounded" [class.spin]="store.baixandoExportacao() === 'pdf'">
              {{ store.baixandoExportacao() === 'pdf' ? 'sync' : 'picture_as_pdf' }}
            </span>
            <span>Baixar PDF Executivo</span>
          </button>

          <!-- Botão Exportar Excel -->
          <button
            class="export-btn excel-btn"
            (click)="store.exportarExcel()"
            [disabled]="store.baixandoExportacao() === 'excel'"
          >
            <span class="material-symbols-rounded" [class.spin]="store.baixandoExportacao() === 'excel'">
              {{ store.baixandoExportacao() === 'excel' ? 'sync' : 'table_chart' }}
            </span>
            <span>Exportar Excel</span>
          </button>

          <!-- Botão Baixar CSV -->
          <button
            class="export-btn csv-btn"
            (click)="store.baixarCsv()"
            [disabled]="store.baixandoExportacao() === 'csv'"
          >
            <span class="material-symbols-rounded" [class.spin]="store.baixandoExportacao() === 'csv'">
              {{ store.baixandoExportacao() === 'csv' ? 'sync' : 'description' }}
            </span>
            <span>Baixar CSV</span>
          </button>
        </div>
      </section>

      <!-- 4. Abas Executivas de Navegação -->
      <nav class="executive-tabs-bar">
        <button
          class="tab-btn"
          [class.active]="store.abaAtiva() === 'fluxo'"
          (click)="store.setAbaAtiva('fluxo')"
        >
          <span class="material-symbols-rounded">show_chart</span>
          <span>Fluxo de Caixa</span>
        </button>

        <button
          class="tab-btn"
          [class.active]="store.abaAtiva() === 'categorias'"
          (click)="store.setAbaAtiva('categorias')"
        >
          <span class="material-symbols-rounded">pie_chart</span>
          <span>Categorias</span>
        </button>

        <button
          class="tab-btn"
          [class.active]="store.abaAtiva() === 'cartoes'"
          (click)="store.setAbaAtiva('cartoes')"
        >
          <span class="material-symbols-rounded">credit_card</span>
          <span>Cartões de Crédito</span>
        </button>

        <button
          class="tab-btn"
          [class.active]="store.abaAtiva() === 'metas'"
          (click)="store.setAbaAtiva('metas')"
        >
          <span class="material-symbols-rounded">flag</span>
          <span>Metas & Projetos</span>
        </button>
      </nav>

      <!-- 5. Conteúdo por Aba -->

      <!-- TAB 1: FLUXO DE CAIXA -->
      <div *ngIf="store.abaAtiva() === 'fluxo'" class="tab-content animate-fade-in">
        <!-- Cards Métricas Principais -->
        <div class="metrics-grid">
          <!-- Total Receitas -->
          <div class="metric-card glass-card">
            <div class="card-top">
              <span class="card-label">Total Receitas</span>
              <div class="icon-bubble positive-bubble"><span class="material-symbols-rounded">trending_up</span></div>
            </div>
            <div class="card-main">
              <span class="card-value positive-text">{{ formatarMoeda(store.fluxoCaixa()?.totalReceitas || 0) }}</span>
              <span class="trend-badge positive">
                +{{ store.fluxoCaixa()?.comparativoMesAnterior?.receitaVariacaoPct }}% vs anterior
              </span>
            </div>
          </div>

          <!-- Total Despesas -->
          <div class="metric-card glass-card">
            <div class="card-top">
              <span class="card-label">Total Despesas</span>
              <div class="icon-bubble negative-bubble"><span class="material-symbols-rounded">trending_down</span></div>
            </div>
            <div class="card-main">
              <span class="card-value negative-text">{{ formatarMoeda(store.fluxoCaixa()?.totalDespesas || 0) }}</span>
              <span class="trend-badge positive">
                {{ store.fluxoCaixa()?.comparativoMesAnterior?.despesaVariacaoPct }}% vs anterior
              </span>
            </div>
          </div>

          <!-- Saldo Líquido -->
          <div class="metric-card glass-card gold-border">
            <div class="card-top">
              <span class="card-label">Saldo Líquido</span>
              <div class="icon-bubble gold-bubble"><span class="material-symbols-rounded">account_balance_wallet</span></div>
            </div>
            <div class="card-main">
              <span class="card-value gold-text">{{ formatarMoeda(store.fluxoCaixa()?.saldoLiquido || 0) }}</span>
              <span class="trend-badge positive">
                +{{ store.fluxoCaixa()?.comparativoMesAnterior?.saldoVariacaoPct }}% vs anterior
              </span>
            </div>
          </div>

          <!-- Taxa de Poupança -->
          <div class="metric-card glass-card">
            <div class="card-top">
              <span class="card-label">Taxa de Poupança</span>
              <div class="icon-bubble champagne-bubble"><span class="material-symbols-rounded">savings</span></div>
            </div>
            <div class="card-main">
              <span class="card-value champagne-text">{{ (store.fluxoCaixa()?.taxaPoupanca || 0) | number: '1.1-1' }}%</span>
              <span class="sub-note">Percentual de renda poupada</span>
            </div>
          </div>
        </div>

        <!-- Gráfico ApexCharts: Barras Comparativas Receita vs Despesa + Saldo -->
        <div class="widget-card glass-card chart-card">
          <div class="widget-header">
            <div class="widget-title-group">
              <div class="icon-bubble gold-bubble"><span class="material-symbols-rounded">bar_chart</span></div>
              <div>
                <h3>Histórico Diário & Comportamento do Fluxo de Caixa 📈</h3>
                <p class="widget-subtitle">Comparativo de entradas, saídas e evolução do saldo acumulado</p>
              </div>
            </div>
          </div>

          <div class="chart-wrapper">
            <apx-chart
              [series]="chartFluxoSeries()"
              [chart]="chartFluxoConfig"
              [xaxis]="chartFluxoXAxis()"
              [yaxis]="chartFluxoYAxis"
              [stroke]="chartFluxoStroke"
              [tooltip]="chartFluxoTooltip"
              [dataLabels]="chartFluxoDataLabels"
              [colors]="chartFluxoColors"
              [grid]="chartFluxoGrid"
              [plotOptions]="chartFluxoPlotOptions"
              [legend]="chartLegend"
            ></apx-chart>
          </div>
        </div>
      </div>

      <!-- TAB 2: CATEGORIAS -->
      <div *ngIf="store.abaAtiva() === 'categorias'" class="tab-content animate-fade-in">
        <div class="categories-grid">
          <!-- Gráfico Donut/Rosca: Distribuição de Despesas -->
          <div class="widget-card glass-card">
            <div class="widget-header">
              <div class="widget-title-group">
                <div class="icon-bubble bordo-bubble"><span class="material-symbols-rounded">donut_large</span></div>
                <div>
                  <h3>Distribuição de Gastos por Categoria 🍩</h3>
                  <p class="widget-subtitle">Proporção percentual e volume financeiro das despesas</p>
                </div>
              </div>
            </div>

            <div class="donut-chart-container">
              <apx-chart
                [series]="chartDonutSeries()"
                [chart]="chartDonutConfig"
                [labels]="chartDonutLabels()"
                [colors]="chartDonutColors()"
                [legend]="chartDonutLegend"
                [tooltip]="chartDonutTooltip"
                [plotOptions]="chartDonutPlotOptions"
                [dataLabels]="chartDonutDataLabels"
              ></apx-chart>
            </div>
          </div>

          <!-- Ranking & Lista de Categorias -->
          <div class="widget-card glass-card">
            <div class="widget-header">
              <div class="widget-title-group">
                <div class="icon-bubble gold-bubble"><span class="material-symbols-rounded">format_list_bulleted</span></div>
                <div>
                  <h3>Detalhamento por Categoria</h3>
                  <p class="widget-subtitle">Ranking ordenado por volume de gastos</p>
                </div>
              </div>
            </div>

            <div class="categories-list">
              <div *ngFor="let cat of store.distribuicaoDespesas()" class="category-item">
                <div class="cat-left">
                  <div
                    class="cat-icon-box"
                    [style.background-color]="(cat.cor || '#C9A74E') + '22'"
                    [style.color]="cat.cor || '#C9A74E'"
                  >
                    <span class="material-symbols-rounded">{{ cat.icone || 'category' }}</span>
                  </div>
                  <div class="cat-info">
                    <span class="cat-name">{{ cat.nome }}</span>
                    <span class="cat-count">{{ cat.quantidadeLancamentos }} lançamentos</span>
                  </div>
                </div>

                <div class="cat-right">
                  <span class="cat-amount">{{ formatarMoeda(cat.valor) }}</span>
                  <span class="cat-pct-badge" [style.color]="cat.cor || '#C9A74E'">
                    {{ cat.percentual | number: '1.1-1' }}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Despesas em Destaque -->
        <div class="widget-card glass-card margin-top-card">
          <div class="widget-header">
            <div class="widget-title-group">
              <div class="icon-bubble critical-bubble"><span class="material-symbols-rounded">priority_high</span></div>
              <div>
                <h3>Maiores Lançamentos do Período</h3>
                <p class="widget-subtitle">Lançamentos de maior impacto financeiro no orçamento</p>
              </div>
            </div>
          </div>

          <div class="top-expenses-list">
            <div *ngFor="let item of store.topDespesas()" class="top-expense-item">
              <div class="item-main">
                <span class="item-desc">{{ item.descricao }}</span>
                <span class="item-cat-badge">{{ item.categoria }}</span>
              </div>
              <div class="item-meta">
                <span class="item-date">{{ item.data | date: 'dd/MM/yyyy' }}</span>
                <span class="item-val negative-text">{{ formatarMoeda(item.valor) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 3: CARTÕES DE CRÉDITO -->
      <div *ngIf="store.abaAtiva() === 'cartoes'" class="tab-content animate-fade-in">
        <!-- Cards Resumo de Cartões -->
        <div class="metrics-grid">
          <div class="metric-card glass-card">
            <div class="card-top">
              <span class="card-label">Total Faturas Abertas</span>
              <div class="icon-bubble bordo-bubble"><span class="material-symbols-rounded">credit_card</span></div>
            </div>
            <div class="card-main">
              <span class="card-value gold-text">{{ formatarMoeda(store.cartoes()?.totalFaturas || 0) }}</span>
              <span class="sub-note">Soma das faturas no período</span>
            </div>
          </div>

          <div class="metric-card glass-card">
            <div class="card-top">
              <span class="card-label">Limite Comprometido</span>
              <div class="icon-bubble champagne-bubble"><span class="material-symbols-rounded">pie_chart</span></div>
            </div>
            <div class="card-main">
              <span class="card-value champagne-text">{{ formatarMoeda(store.cartoes()?.totalLimiteComprometido || 0) }}</span>
              <span class="sub-note">Consolidado entre todos os cartões</span>
            </div>
          </div>

          <div class="metric-card glass-card">
            <div class="card-top">
              <span class="card-label">Projeção Próximo Mês</span>
              <div class="icon-bubble gold-bubble"><span class="material-symbols-rounded">event_upcoming</span></div>
            </div>
            <div class="card-main">
              <span class="card-value white-text">
                {{ formatarMoeda(store.cartoes()?.projecaoProximasFaturas?.[0]?.valorTotal || 0) }}
              </span>
              <span class="sub-note">Faturas parceladas vincendas</span>
            </div>
          </div>
        </div>

        <!-- Gráfico ApexCharts: Barras Comparativas de Limite por Cartão -->
        <div class="widget-card glass-card chart-card">
          <div class="widget-header">
            <div class="widget-title-group">
              <div class="icon-bubble gold-bubble"><span class="material-symbols-rounded">credit_card</span></div>
              <div>
                <h3>Uso de Limite & Fatura por Cartão 💳</h3>
                <p class="widget-subtitle">Comparativo de limite disponível, limite usado e valor da fatura atual</p>
              </div>
            </div>
          </div>

          <div class="chart-wrapper">
            <apx-chart
              [series]="chartCartoesSeries()"
              [chart]="chartCartoesConfig"
              [xaxis]="chartCartoesXAxis()"
              [yaxis]="chartCartoesYAxis"
              [colors]="chartCartoesColors"
              [plotOptions]="chartCartoesPlotOptions"
              [grid]="chartFluxoGrid"
              [legend]="chartLegend"
              [tooltip]="chartFluxoTooltip"
            ></apx-chart>
          </div>
        </div>

        <!-- Cards Detalhados dos Cartões -->
        <div class="cards-grid">
          <div *ngFor="let c of store.usoPorCartao()" class="card-detail-item glass-card" [style.border-left-color]="c.cor || '#C9A74E'">
            <div class="card-detail-header">
              <div>
                <h4 class="card-title">{{ c.nomeCartao }}</h4>
                <span class="brand-pill">{{ c.bandeira }}</span>
              </div>
              <span class="card-fatura-val">{{ formatarMoeda(c.valorFaturaAtual) }}</span>
            </div>

            <div class="progress-bar-track">
              <div
                class="progress-bar-fill"
                [style.width.%]="c.percentualUso > 100 ? 100 : c.percentualUso"
                [style.background-color]="c.cor || '#C9A74E'"
              ></div>
            </div>

            <div class="card-limit-info">
              <span>Usado: <strong>{{ formatarMoeda(c.limiteUsado) }}</strong> ({{ c.percentualUso | number: '1.1-1' }}%)</span>
              <span>Limite Total: {{ formatarMoeda(c.limiteTotal) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 4: METAS & PROJETOS -->
      <div *ngIf="store.abaAtiva() === 'metas'" class="tab-content animate-fade-in">
        <!-- Cards Resumo Metas e Projetos -->
        <div class="metrics-grid">
          <div class="metric-card glass-card gold-border">
            <div class="card-top">
              <span class="card-label">Total Aportado em Metas</span>
              <div class="icon-bubble gold-bubble"><span class="material-symbols-rounded">flag</span></div>
            </div>
            <div class="card-main">
              <span class="card-value gold-text">{{ formatarMoeda(store.metasProjetos()?.totalAportadoMetas || 0) }}</span>
              <span class="sub-note">Acumulado em objetivos financeiros</span>
            </div>
          </div>

          <div class="metric-card glass-card">
            <div class="card-top">
              <span class="card-label">Progresso Geral das Metas</span>
              <div class="icon-bubble champagne-bubble"><span class="material-symbols-rounded">query_stats</span></div>
            </div>
            <div class="card-main">
              <span class="card-value champagne-text">
                {{ (store.metasProjetos()?.progressoGeralMetasPct || 0) | number: '1.1-1' }}%
              </span>
              <span class="sub-note">Média ponderada de conclusão</span>
            </div>
          </div>

          <div class="metric-card glass-card">
            <div class="card-top">
              <span class="card-label">Investimento em Projetos</span>
              <div class="icon-bubble bordo-bubble"><span class="material-symbols-rounded">foundation</span></div>
            </div>
            <div class="card-main">
              <span class="card-value white-text">
                {{ formatarMoeda(store.metasProjetos()?.totalInvestidoProjetos || 0) }}
              </span>
              <span class="sub-note">Gasto executado em obras & projetos</span>
            </div>
          </div>
        </div>

        <!-- Gráfico ApexCharts: Progresso Comparativo de Metas & Projetos -->
        <div class="widget-card glass-card chart-card">
          <div class="widget-header">
            <div class="widget-title-group">
              <div class="icon-bubble gold-bubble"><span class="material-symbols-rounded">track_changes</span></div>
              <div>
                <h3>Evolução & Conclusão de Metas e Projetos 🎯</h3>
                <p class="widget-subtitle">Comparativo percentual de conclusão por objetivo estratégico</p>
              </div>
            </div>
          </div>

          <div class="chart-wrapper">
            <apx-chart
              [series]="chartMetasSeries()"
              [chart]="chartMetasConfig"
              [xaxis]="chartMetasXAxis()"
              [yaxis]="chartMetasYAxis"
              [colors]="chartMetasColors"
              [plotOptions]="chartMetasPlotOptions"
              [grid]="chartFluxoGrid"
              [legend]="chartLegend"
              [tooltip]="chartFluxoTooltip"
            ></apx-chart>
          </div>
        </div>

        <!-- Grid de Metas e Projetos -->
        <div class="metas-projetos-grid">
          <!-- Sub-bloco Metas -->
          <div class="widget-card glass-card">
            <div class="widget-header">
              <div class="widget-title-group">
                <div class="icon-bubble gold-bubble"><span class="material-symbols-rounded">flag</span></div>
                <h3>Status das Metas Financeiras</h3>
              </div>
            </div>

            <div class="items-list">
              <div *ngFor="let m of store.metasStatus()" class="status-item">
                <div class="item-header">
                  <span class="item-name">{{ m.nome }}</span>
                  <span class="status-badge" [ngClass]="m.status.toLowerCase()">{{ m.status }}</span>
                </div>
                <div class="progress-bar-track">
                  <div class="progress-bar-fill gold-fill" [style.width.%]="m.percentualConcluido"></div>
                </div>
                <div class="item-footer">
                  <span>Atual: <strong>{{ formatarMoeda(m.valorAtual) }}</strong></span>
                  <span class="pct-text">{{ m.percentualConcluido | number: '1.1-1' }}%</span>
                  <span>Alvo: {{ formatarMoeda(m.valorAlvo) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Sub-bloco Projetos -->
          <div class="widget-card glass-card">
            <div class="widget-header">
              <div class="widget-title-group">
                <div class="icon-bubble bordo-bubble"><span class="material-symbols-rounded">engineering</span></div>
                <h3>Status dos Projetos Alicerce</h3>
              </div>
            </div>

            <div class="items-list">
              <div *ngFor="let p of store.projetosStatus()" class="status-item">
                <div class="item-header">
                  <span class="item-name">{{ p.titulo }}</span>
                  <span class="status-badge" [ngClass]="p.status.toLowerCase()">{{ p.status }}</span>
                </div>
                <div class="progress-bar-track">
                  <div class="progress-bar-fill bordo-fill" [style.width.%]="p.percentualProgresso"></div>
                </div>
                <div class="item-footer">
                  <span>Gasto: <strong>{{ formatarMoeda(p.valorGasto) }}</strong></span>
                  <span class="pct-text">{{ p.percentualProgresso | number: '1.1-1' }}%</span>
                  <span>Teto: {{ formatarMoeda(p.orcamentoTotal) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
    .relatorios-container {
      display: flex; flex-direction: column; gap: 20px; padding: 16px; max-width: 1440px; margin: 0 auto;
    }

    /* Executive Header */
    .executive-header {
      background: linear-gradient(135deg, #4A121A 0%, #1F1A1B 100%);
      border: 1px solid rgba(201, 167, 78, 0.35); border-radius: 16px; padding: 24px; display: flex;
      justify-content: space-between; align-items: center; box-shadow: 0 10px 30px rgba(161, 61, 99, 0.25);
    }
    .executive-badge {
      display: inline-flex; align-items: center; gap: 8px; padding: 4px 12px; border-radius: 99px;
      background: rgba(201, 167, 78, 0.15); border: 1px solid rgba(201, 167, 78, 0.35); color: #E8D39E; font-size: 11px; font-weight: 700; margin-bottom: 8px;
    }
    .pulse-dot { width: 8px; height: 8px; border-radius: 50%; background: #C9A74E; box-shadow: 0 0 10px #C9A74E; }
    .page-title { font-size: 26px; font-weight: 800; color: #FFF; margin: 0 0 4px 0; }
    .page-subtitle { color: rgba(255, 255, 255, 0.75); font-size: 13px; margin: 0; max-width: 750px; }
    .executive-btn {
      display: flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; border: 1px solid transparent;
      &.refresh-btn { background: rgba(255, 255, 255, 0.08); border-color: rgba(201, 167, 78, 0.3); color: #E8D39E; }
    }
    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Glass Cards Base */
    .glass-card {
      background: rgba(31, 26, 27, 0.85); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px; padding: 18px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      &.gold-border { border-color: rgba(201, 167, 78, 0.4); }
    }

    /* Period Selection Card */
    .period-selection-card { display: flex; flex-direction: column; gap: 14px; }
    .period-header {
      display: flex; justify-content: space-between; align-items: center;
      .period-title-group { display: flex; align-items: center; gap: 8px; h3 { font-size: 16px; font-weight: 700; color: #FFF; margin: 0; } .icon-gold { color: #C9A74E; } }
      .period-subtitle { font-size: 11px; color: rgba(255, 255, 255, 0.5); }
    }
    .period-pills-row { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; }
    .period-pill {
      background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.12); color: rgba(255, 255, 255, 0.7);
      padding: 8px 16px; border-radius: 99px; font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: all 0.2s ease;
      &:hover { background: rgba(201, 167, 78, 0.15); color: #E8D39E; }
      &.active { background: linear-gradient(135deg, #C9A74E 0%, #A13D63 100%); color: #FFF; border-color: transparent; box-shadow: 0 4px 12px rgba(201, 167, 78, 0.3); }
    }
    .custom-date-row { display: flex; align-items: flex-end; gap: 12px; background: rgba(0, 0, 0, 0.2); padding: 12px; border-radius: 10px; border: 1px solid rgba(201, 167, 78, 0.2); }
    .input-field { display: flex; flex-direction: column; gap: 4px; flex: 1; label { font-size: 11px; color: rgba(255, 255, 255, 0.6); } }
    .date-input { background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; padding: 8px; color: #FFF; font-size: 12px; }
    .apply-date-btn { display: flex; align-items: center; gap: 4px; background: #C9A74E; color: #1F1A1B; border: none; border-radius: 6px; padding: 8px 16px; font-size: 12px; font-weight: 800; cursor: pointer; }

    /* Export Action Bar */
    .export-action-bar { display: flex; justify-content: space-between; align-items: center; gap: 16px; background: linear-gradient(135deg, rgba(161, 61, 99, 0.15) 0%, rgba(31, 26, 27, 0.95) 100%); }
    .export-info { display: flex; align-items: center; gap: 12px; }
    .export-icon-box { width: 42px; height: 42px; border-radius: 10px; background: rgba(201, 167, 78, 0.2); color: #C9A74E; display: flex; align-items: center; justify-content: center; span { font-size: 24px; } }
    .export-title { font-size: 16px; font-weight: 800; color: #FFF; margin: 0 0 2px 0; }
    .export-desc { font-size: 11px; color: rgba(255, 255, 255, 0.6); margin: 0; }
    .export-buttons-group { display: flex; gap: 10px; flex-wrap: wrap; }
    .export-btn {
      display: flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 10px; font-size: 12px; font-weight: 800; cursor: pointer; border: 1px solid transparent; transition: all 0.2s ease;
      &.pdf-btn { background: linear-gradient(135deg, #A13D63 0%, #7A2846 100%); color: #FFF; border-color: rgba(201, 167, 78, 0.3); box-shadow: 0 4px 12px rgba(161, 61, 99, 0.3); }
      &.excel-btn { background: linear-gradient(135deg, #10B981 0%, #047857 100%); color: #FFF; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }
      &.csv-btn { background: rgba(255, 255, 255, 0.08); border-color: rgba(255, 255, 255, 0.2); color: #FFF; }
      &:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.1); }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }

    /* Tabs Bar */
    .executive-tabs-bar { display: flex; gap: 8px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 4px; }
    .tab-btn {
      display: flex; align-items: center; gap: 8px; background: none; border: none; padding: 12px 18px; color: rgba(255, 255, 255, 0.5); font-size: 13px; font-weight: 700; cursor: pointer; border-bottom: 3px solid transparent; transition: all 0.2s ease;
      &:hover { color: #E8D39E; }
      &.active { color: #C9A74E; border-bottom-color: #C9A74E; }
    }

    /* Content Layout */
    .tab-content { display: flex; flex-direction: column; gap: 20px; }
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
    .card-value { font-family: monospace; font-size: 22px; font-weight: 800; color: #FFF; &.gold-text { color: #C9A74E; } &.champagne-text { color: #E8D39E; } &.positive-text { color: #34D399; } &.negative-text { color: #F87171; } &.white-text { color: #FFF; } }
    .trend-badge { font-size: 10px; font-weight: 700; &.positive { color: #34D399; } }
    .sub-note { font-size: 10px; color: rgba(255, 255, 255, 0.45); }

    .widget-card { display: flex; flex-direction: column; gap: 14px; }
    .widget-header { display: flex; justify-content: space-between; align-items: center; h3 { font-size: 16px; font-weight: 700; color: #FFF; margin: 0; } }
    .widget-title-group { display: flex; align-items: center; gap: 10px; }
    .widget-subtitle { margin: 2px 0 0 0; font-size: 11px; color: rgba(255, 255, 255, 0.5); }
    .chart-wrapper { width: 100%; min-height: 320px; }

    /* Categories Tab Layout */
    .categories-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .donut-chart-container { min-height: 280px; display: flex; justify-content: center; align-items: center; }
    .categories-list { display: flex; flex-direction: column; gap: 10px; }
    .category-item { display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.02); border-radius: 10px; padding: 10px 14px; }
    .cat-left { display: flex; align-items: center; gap: 10px; }
    .cat-icon-box { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; span { font-size: 18px; } }
    .cat-info { display: flex; flex-direction: column; }
    .cat-name { font-size: 13px; font-weight: 700; color: #FFF; }
    .cat-count { font-size: 10px; color: rgba(255, 255, 255, 0.4); }
    .cat-right { display: flex; flex-direction: column; align-items: flex-end; }
    .cat-amount { font-family: monospace; font-size: 14px; font-weight: 800; color: #FFF; }
    .cat-pct-badge { font-size: 10px; font-weight: 800; }

    .margin-top-card { margin-top: 4px; }
    .top-expenses-list { display: flex; flex-direction: column; gap: 8px; }
    .top-expense-item { display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.03); border-radius: 8px; padding: 10px 14px; }
    .item-main { display: flex; align-items: center; gap: 10px; }
    .item-desc { font-size: 13px; font-weight: 600; color: #FFF; }
    .item-cat-badge { font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; background: rgba(201, 167, 78, 0.2); color: #C9A74E; }
    .item-meta { display: flex; flex-direction: column; align-items: flex-end; }
    .item-date { font-size: 10px; color: rgba(255, 255, 255, 0.4); }
    .item-val { font-family: monospace; font-size: 14px; font-weight: 800; }

    /* Cards Grid */
    .cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px; }
    .card-detail-item { display: flex; flex-direction: column; gap: 10px; border-left: 4px solid #C9A74E; }
    .card-detail-header { display: flex; justify-content: space-between; align-items: flex-start; }
    .card-title { font-size: 14px; font-weight: 700; color: #FFF; margin: 0 0 2px 0; }
    .brand-pill { font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; background: rgba(255, 255, 255, 0.1); color: #E8D39E; }
    .card-fatura-val { font-family: monospace; font-size: 16px; font-weight: 800; color: #C9A74E; }
    .progress-bar-track { height: 6px; background: rgba(255, 255, 255, 0.1); border-radius: 3px; overflow: hidden; }
    .progress-bar-fill { height: 100%; border-radius: 3px; }
    .card-limit-info { display: flex; justify-content: space-between; font-size: 10px; color: rgba(255, 255, 255, 0.6); }

    /* Metas & Projetos Grid */
    .metas-projetos-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .items-list { display: flex; flex-direction: column; gap: 12px; }
    .status-item { display: flex; flex-direction: column; gap: 6px; background: rgba(255, 255, 255, 0.02); border-radius: 10px; padding: 12px; }
    .item-header { display: flex; justify-content: space-between; align-items: center; }
    .item-name { font-size: 13px; font-weight: 700; color: #FFF; }
    .status-badge {
      font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;
      &.em_andamento { background: rgba(201, 167, 78, 0.2); color: #C9A74E; }
      &.concluidad, &.concluido { background: rgba(16, 185, 129, 0.2); color: #34D399; }
      &.atrasada, &.pausado { background: rgba(239, 68, 68, 0.2); color: #F87171; }
    }
    .gold-fill { background: #C9A74E; }
    .bordo-fill { background: #A13D63; }
    .item-footer { display: flex; justify-content: space-between; font-size: 10px; color: rgba(255, 255, 255, 0.6); }
    .pct-text { font-weight: 800; color: #C9A74E; }

    @media (max-width: 1024px) {
      .executive-header { flex-direction: column; align-items: flex-start; gap: 14px; }
      .export-action-bar { flex-direction: column; align-items: flex-start; .export-buttons-group { width: 100%; .export-btn { flex: 1; justify-content: center; } } }
      .categories-grid, .metas-projetos-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class RelatoriosPage {
  public readonly store = inject(RelatoriosStore);

  public dataInicio = '2026-08-01';
  public dataFim = '2026-08-31';

  public readonly periodosDisponiveis: Array<{ label: string; value: TipoPeriodoRelatorio }> = [
    { label: 'Mês Atual', value: 'MES_ATUAL' },
    { label: 'Últimos 30 Dias', value: 'ULTIMOS_30_DIAS' },
    { label: 'Últimos 3 Meses', value: 'ULTIMOS_3_MESES' },
    { label: 'Últimos 6 Meses', value: 'ULTIMOS_6_MESES' },
    { label: 'Ano Atual', value: 'ANO_ATUAL' },
    { label: 'Personalizado', value: 'PERSONALIZADO' },
  ];

  // ApexCharts Config for General Legends
  public readonly chartLegend: ApexLegend = {
    labels: { colors: 'rgba(255, 255, 255, 0.7)' },
    position: 'top',
  };

  // --- TAB 1: FLUXO DE CAIXA CHART CONFIG ---
  public readonly chartFluxoConfig: ApexChart = {
    type: 'bar',
    height: 320,
    toolbar: { show: false },
    background: 'transparent',
  };

  public readonly chartFluxoColors = ['#10B981', '#A13D63', '#C9A74E'];

  public readonly chartFluxoSeries = computed<ApexAxisChartSeries>(() => {
    const hist = this.store.historicoDiario();
    return [
      {
        name: 'Receitas',
        data: hist.map((h) => h.receita),
      },
      {
        name: 'Despesas',
        data: hist.map((h) => h.despesa),
      },
      {
        name: 'Saldo Acumulado',
        type: 'line',
        data: hist.map((h) => h.saldoAcumulado),
      },
    ];
  });

  public readonly chartFluxoXAxis = computed<ApexXAxis>(() => ({
    categories: this.store.historicoDiario().map((h) => h.data),
    labels: {
      style: { colors: 'rgba(255, 255, 255, 0.6)', fontSize: '11px', fontFamily: 'Outfit' },
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
  }));

  public readonly chartFluxoYAxis: ApexYAxis = {
    labels: {
      style: { colors: 'rgba(255, 255, 255, 0.6)', fontSize: '11px', fontFamily: 'Space Grotesk' },
      formatter: (val) => `R$ ${val.toLocaleString('pt-BR')}`,
    },
  };

  public readonly chartFluxoStroke: ApexStroke = {
    width: [0, 0, 3],
    curve: 'smooth',
  };

  public readonly chartFluxoPlotOptions: ApexPlotOptions = {
    bar: {
      columnWidth: '45%',
      borderRadius: 4,
    },
  };

  public readonly chartFluxoDataLabels: ApexDataLabels = { enabled: false };

  public readonly chartFluxoGrid: ApexGrid = {
    borderColor: 'rgba(201, 167, 78, 0.1)',
    strokeDashArray: 4,
  };

  public readonly chartFluxoTooltip: ApexTooltip = { theme: 'dark' };

  // --- TAB 2: DONUT / ROSCA CHART CONFIG ---
  public readonly chartDonutConfig: ApexChart = {
    type: 'donut',
    height: 280,
    background: 'transparent',
  };

  public readonly chartDonutSeries = computed<ApexNonAxisChartSeries>(() => {
    return this.store.distribuicaoDespesas().map((d) => d.valor);
  });

  public readonly chartDonutLabels = computed<string[]>(() => {
    return this.store.distribuicaoDespesas().map((d) => d.nome);
  });

  public readonly chartDonutColors = computed<string[]>(() => {
    return this.store.distribuicaoDespesas().map((d) => d.cor || '#C9A74E');
  });

  public readonly chartDonutLegend: ApexLegend = {
    show: true,
    position: 'bottom',
    labels: { colors: 'rgba(255, 255, 255, 0.8)' },
    fontFamily: 'Outfit',
  };

  public readonly chartDonutTooltip: ApexTooltip = { theme: 'dark' };

  public readonly chartDonutDataLabels: ApexDataLabels = {
    enabled: true,
    formatter: (val: number) => `${val.toFixed(1)}%`,
  };

  public readonly chartDonutPlotOptions: ApexPlotOptions = {
    pie: {
      donut: {
        size: '65%',
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Total Despesas',
            color: '#C9A74E',
            formatter: () => {
              const total = this.store.fluxoCaixa()?.totalDespesas || 0;
              return `R$ ${total.toLocaleString('pt-BR')}`;
            },
          },
        },
      },
    },
  };

  // --- TAB 3: CARTOES CHART CONFIG ---
  public readonly chartCartoesConfig: ApexChart = {
    type: 'bar',
    height: 300,
    toolbar: { show: false },
    background: 'transparent',
  };

  public readonly chartCartoesColors = ['#C9A74E', '#A13D63', '#10B981'];

  public readonly chartCartoesSeries = computed<ApexAxisChartSeries>(() => {
    const cartoes = this.store.usoPorCartao();
    return [
      {
        name: 'Valor Fatura Atual',
        data: cartoes.map((c) => c.valorFaturaAtual),
      },
      {
        name: 'Limite Usado Total',
        data: cartoes.map((c) => c.limiteUsado),
      },
      {
        name: 'Limite Disponível',
        data: cartoes.map((c) => Math.max(0, c.limiteTotal - c.limiteUsado)),
      },
    ];
  });

  public readonly chartCartoesXAxis = computed<ApexXAxis>(() => ({
    categories: this.store.usoPorCartao().map((c) => c.nomeCartao),
    labels: {
      style: { colors: 'rgba(255, 255, 255, 0.7)', fontSize: '11px', fontFamily: 'Outfit' },
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
  }));

  public readonly chartCartoesYAxis: ApexYAxis = {
    labels: {
      style: { colors: 'rgba(255, 255, 255, 0.6)', fontSize: '11px' },
      formatter: (val) => `R$ ${val.toLocaleString('pt-BR')}`,
    },
  };

  public readonly chartCartoesPlotOptions: ApexPlotOptions = {
    bar: { horizontal: false, columnWidth: '50%', borderRadius: 4 },
  };

  // --- TAB 4: METAS & PROJETOS CHART CONFIG ---
  public readonly chartMetasConfig: ApexChart = {
    type: 'bar',
    height: 300,
    toolbar: { show: false },
    background: 'transparent',
  };

  public readonly chartMetasColors = ['#C9A74E', '#A13D63'];

  public readonly chartMetasSeries = computed<ApexAxisChartSeries>(() => {
    const metas = this.store.metasStatus();
    const projetos = this.store.projetosStatus();
    const categories = [
      ...metas.map((m) => m.nome),
      ...projetos.map((p) => p.titulo),
    ];
    const dataPct = [
      ...metas.map((m) => m.percentualConcluido),
      ...projetos.map((p) => p.percentualProgresso),
    ];
    return [
      {
        name: 'Progresso Concluído (%)',
        data: dataPct,
      },
    ];
  });

  public readonly chartMetasXAxis = computed<ApexXAxis>(() => ({
    categories: [
      ...this.store.metasStatus().map((m) => m.nome),
      ...this.store.projetosStatus().map((p) => p.titulo),
    ],
    labels: {
      style: { colors: 'rgba(255, 255, 255, 0.7)', fontSize: '11px', fontFamily: 'Outfit' },
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
  }));

  public readonly chartMetasYAxis: ApexYAxis = {
    max: 100,
    labels: {
      style: { colors: 'rgba(255, 255, 255, 0.6)', fontSize: '11px' },
      formatter: (val) => `${val}%`,
    },
  };

  public readonly chartMetasPlotOptions: ApexPlotOptions = {
    bar: { horizontal: true, borderRadius: 4, barHeight: '50%' },
  };

  selecionarPeriodo(tipo: TipoPeriodoRelatorio): void {
    this.store.setTipoPeriodo(tipo);
  }

  aplicarDataPersonalizada(): void {
    if (this.dataInicio && this.dataFim) {
      this.store.setDatasPersonalizadas(this.dataInicio, this.dataFim);
    }
  }

  formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }
}
