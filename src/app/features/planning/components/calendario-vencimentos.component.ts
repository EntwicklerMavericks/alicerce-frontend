import { Component, inject, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanningStore } from '../store/planning.store';
import { CalendarioVencimento, VencimentoStatus, VencimentoTipo } from '../../../core/models/planning.models';

@Component({
  selector: 'app-calendario-vencimentos',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="vencimentos-card glass-card animate-fade-in">
      <!-- Top Header & Action Controls -->
      <div class="card-header">
        <div class="header-titles">
          <div class="badge-tag gold">
            <span class="material-symbols-rounded icon-sm">calendar_month</span>
            <span>PRÓXIMOS 30 DIAS</span>
          </div>
          <h2 class="section-title">Calendário & Radar de Vencimentos 📅</h2>
          <p class="section-subtitle">
            Gestão unificada de faturas, contas fixas, parcelas e compromissos com alertamento automático de risco.
          </p>
        </div>

        <div class="view-mode-toggle">
          <button
            class="toggle-chip"
            [class.active]="modoExibicao() === 'LISTA'"
            (click)="modoExibicao.set('LISTA')"
            title="Exibição em Lista Cronológica"
          >
            <span class="material-symbols-rounded">format_list_bulleted</span>
            <span>Lista</span>
          </button>
          <button
            class="toggle-chip"
            [class.active]="modoExibicao() === 'GRID_30D'"
            (click)="modoExibicao.set('GRID_30D')"
            title="Grid Visual dos 30 Dias"
          >
            <span class="material-symbols-rounded">grid_view</span>
            <span>Grid 30d</span>
          </button>
        </div>
      </div>

      <!-- Metric Summary Cards Bar -->
      <div class="vencimentos-summary-grid">
        <div class="mini-summary-box">
          <span class="summary-label">Total de Compromissos (30d)</span>
          <div class="summary-val font-mono">
            {{ store.totalVencimentos30Dias() }} itens
          </div>
          <span class="summary-sub text-gold font-mono">
            R$ {{ store.valorTotalVencimentos30Dias() | number : '1.2-2' }}
          </span>
        </div>

        <div class="mini-summary-box" [class.alert-border]="store.totalVencidosAtrasados() > 0">
          <span class="summary-label">Atrasados / Vencidos</span>
          <div class="summary-val font-mono text-bordo">
            {{ store.totalVencidosAtrasados() }} contas
          </div>
          <span class="summary-sub text-bordo font-mono">
            R$ {{ store.valorVencidosAtrasados() | number : '1.2-2' }}
          </span>
        </div>

        <div class="mini-summary-box">
          <span class="summary-label">Vencendo Hoje / Imine.</span>
          <div class="summary-val font-mono text-amber">
            {{ totalVencendoHoje() }} contas
          </div>
          <span class="summary-sub text-amber font-mono">
            R$ {{ valorVencendoHoje() | number : '1.2-2' }}
          </span>
        </div>
      </div>

      <!-- Quick Filter Bar -->
      <div class="filters-bar">
        <div class="status-filters">
          <span class="filter-label">Status:</span>
          <button
            class="filter-chip"
            [class.active]="store.filtroVencimentoStatus() === 'TODOS'"
            (click)="store.setFiltroVencimentoStatus('TODOS')"
          >
            Todos ({{ store.vencimentos30Dias().length }})
          </button>
          <button
            class="filter-chip status-atrasado"
            [class.active]="store.filtroVencimentoStatus() === 'ATRASADO'"
            (click)="store.setFiltroVencimentoStatus('ATRASADO')"
          >
            <span class="dot"></span> Atrasados
          </button>
          <button
            class="filter-chip status-hoje"
            [class.active]="store.filtroVencimentoStatus() === 'VENCENDO_HOJE'"
            (click)="store.setFiltroVencimentoStatus('VENCENDO_HOJE')"
          >
            <span class="dot"></span> Hoje
          </button>
          <button
            class="filter-chip status-pendente"
            [class.active]="store.filtroVencimentoStatus() === 'PENDENTE'"
            (click)="store.setFiltroVencimentoStatus('PENDENTE')"
          >
            <span class="dot"></span> Pendentes
          </button>
          <button
            class="filter-chip status-pago"
            [class.active]="store.filtroVencimentoStatus() === 'PAGO'"
            (click)="store.setFiltroVencimentoStatus('PAGO')"
          >
            <span class="dot"></span> Pagos
          </button>
        </div>

        <div class="type-filter">
          <select
            class="select-type"
            [value]="store.filtroVencimentoTipo()"
            (change)="onTypeChange($event)"
          >
            <option value="TODOS">Todos os Tipos</option>
            <option value="FATURA">Fatura de Cartão</option>
            <option value="DESPESA_FIXA">Despesa Fixa</option>
            <option value="PARCELA">Parcelamentos</option>
            <option value="BOLETO">Boleto Bancário</option>
            <option value="RECORRENCIA">Recorrência / Aporte</option>
          </select>
        </div>
      </div>

      <!-- MODE 1: LISTA CRONOLÓGICA -->
      <div *ngIf="modoExibicao() === 'LISTA'" class="vencimentos-list-container">
        <div *ngIf="store.vencimentosFiltrados().length === 0" class="empty-state">
          <span class="material-symbols-rounded empty-icon">event_busy</span>
          <p>Nenhum vencimento encontrado para o filtro selecionado.</p>
        </div>

        <div *ngFor="let item of store.vencimentosFiltrados()" class="vencimento-item-card" [ngClass]="getItemCssClass(item.status)">
          <div class="date-badge">
            <span class="day-num">{{ item.diaDoMes }}</span>
            <span class="date-sub">{{ formatShortDate(item.dataVencimento) }}</span>
          </div>

          <div class="item-info-group">
            <div class="item-title-bar">
              <span class="item-title">{{ item.descricao }}</span>
              <span class="type-pill" [ngClass]="item.tipo.toLowerCase()">{{ getTipoLabel(item.tipo) }}</span>
            </div>

            <div class="item-metadata">
              <span class="meta-chip">
                <span class="material-symbols-rounded">category</span>
                {{ item.categoria }}
              </span>
              <span *ngIf="item.origemNome" class="meta-chip">
                <span class="material-symbols-rounded">account_balance_wallet</span>
                {{ item.origemNome }}
              </span>
              <span *ngIf="item.cartaoNome" class="meta-chip">
                <span class="material-symbols-rounded">credit_card</span>
                {{ item.cartaoNome }}
              </span>
              <span *ngIf="item.parcelaInfo" class="meta-chip gold font-mono">
                <span class="material-symbols-rounded">pie_chart</span>
                {{ item.parcelaInfo }}
              </span>
            </div>
          </div>

          <div class="item-value-action">
            <div class="amount-display font-mono" [class.line-through]="item.status === 'PAGO'">
              R$ {{ item.valor | number : '1.2-2' }}
            </div>

            <div class="status-action-wrapper">
              <span class="status-pill" [ngClass]="getStatusCssClass(item.status)">
                <span class="status-dot"></span>
                {{ getStatusLabel(item.status) }}
              </span>

              <button
                *ngIf="item.status !== 'PAGO'"
                class="pay-btn"
                (click)="store.marcarVencimentoComoPago(item.id)"
                title="Marcar como Pago"
              >
                <span class="material-symbols-rounded">check_circle</span>
                <span>Pagar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- MODE 2: GRID VISUAL 30 DIAS -->
      <div *ngIf="modoExibicao() === 'GRID_30D'" class="vencimentos-grid-container">
        <div class="grid-30d-board">
          <div *ngFor="let dia of diasGrid30()" class="grid-day-cell" [class.has-events]="dia.eventos.length > 0" [class.is-today]="dia.isHoje">
            <div class="cell-day-header">
              <span class="day-number">{{ dia.diaNum }}</span>
              <span class="day-label">{{ dia.diaSemana }}</span>
            </div>

            <div class="cell-events-list">
              <div
                *ngFor="let ev of dia.eventos"
                class="grid-event-pill"
                [ngClass]="getStatusCssClass(ev.status)"
                [title]="ev.descricao + ' - R$ ' + ev.valor"
              >
                <span class="ev-name">{{ ev.descricao }}</span>
                <span class="ev-val font-mono">R$ {{ ev.valor | number : '1.0-0' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .vencimentos-card {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      flex-wrap: wrap;
    }

    .badge-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.5px;
      margin-bottom: 6px;

      &.gold {
        background: rgba(201, 167, 78, 0.15);
        border: 1px solid rgba(201, 167, 78, 0.3);
        color: #ebd9b6;
      }
    }

    .icon-sm { font-size: 14px; }

    .section-title {
      font-family: var(--font-primary, 'Outfit', sans-serif);
      font-size: 22px;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 4px 0;
    }

    .section-subtitle {
      font-size: 12px;
      color: #9c8e7c;
      margin: 0;
    }

    .view-mode-toggle {
      display: flex;
      gap: 6px;
      background: rgba(0, 0, 0, 0.3);
      padding: 4px;
      border-radius: 10px;
      border: 1px solid rgba(216, 184, 126, 0.2);
    }

    .toggle-chip {
      background: transparent;
      border: none;
      color: #9c8e7c;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;

      span { font-size: 16px; }

      &.active {
        background: var(--color-gold-gradient, linear-gradient(135deg, #d8b87e 0%, #c9a74e 100%));
        color: #2b0b10;
        box-shadow: 0 2px 8px rgba(201, 167, 78, 0.3);
      }
    }

    /* Summary Grid */
    .vencimentos-summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
    }

    .mini-summary-box {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(216, 184, 126, 0.15);
      border-radius: 12px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 4px;

      &.alert-border {
        border-color: rgba(239, 68, 68, 0.4);
        background: rgba(239, 68, 68, 0.05);
      }
    }

    .summary-label {
      font-size: 11px;
      color: #9c8e7c;
      font-weight: 700;
      text-transform: uppercase;
    }

    .summary-val {
      font-size: 20px;
      font-weight: 800;
      color: #ffffff;
    }

    .summary-sub {
      font-size: 12px;
      font-weight: 700;
    }

    /* Filters Bar */
    .filters-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      background: rgba(0, 0, 0, 0.2);
      padding: 12px 16px;
      border-radius: 12px;
      border: 1px solid rgba(216, 184, 126, 0.15);
    }

    .status-filters {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .filter-label {
      font-size: 12px;
      font-weight: 700;
      color: #9c8e7c;
    }

    .filter-chip {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #ebd9b6;
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;

      .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: currentColor;
      }

      &:hover {
        background: rgba(201, 167, 78, 0.15);
      }

      &.active {
        background: rgba(201, 167, 78, 0.25);
        border-color: #C9A74E;
        color: #ffffff;
      }

      &.status-atrasado .dot { background: #ef4444; }
      &.status-hoje .dot { background: #f59e0b; }
      &.status-pendente .dot { background: #C9A74E; }
      &.status-pago .dot { background: #10b981; }
    }

    .select-type {
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(216, 184, 126, 0.25);
      color: #ebd9b6;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      outline: none;
    }

    /* Lista Cronológica */
    .vencimentos-list-container {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .vencimento-item-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(216, 184, 126, 0.15);
      border-radius: 12px;
      padding: 14px;
      display: grid;
      grid-template-columns: 60px 1fr auto;
      gap: 16px;
      align-items: center;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.06);
        transform: translateX(2px);
      }

      &.atrasado-card {
        border-color: rgba(239, 68, 68, 0.4);
        background: rgba(239, 68, 68, 0.06);
      }

      &.hoje-card {
        border-color: rgba(245, 158, 11, 0.4);
        background: rgba(245, 158, 11, 0.06);
      }

      &.pago-card {
        opacity: 0.7;
      }
    }

    .date-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(201, 167, 78, 0.15);
      border: 1px solid rgba(201, 167, 78, 0.3);
      border-radius: 10px;
      padding: 6px;

      .day-num {
        font-family: var(--font-mono, 'Space Grotesk', monospace);
        font-size: 18px;
        font-weight: 800;
        color: #C9A74E;
        line-height: 1;
      }

      .date-sub {
        font-size: 10px;
        color: #9c8e7c;
      }
    }

    .item-info-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .item-title-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .item-title {
      font-size: 14px;
      font-weight: 700;
      color: #ffffff;
    }

    .type-pill {
      font-size: 10px;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 4px;
      text-transform: uppercase;
      background: rgba(255, 255, 255, 0.1);
      color: #9c8e7c;

      &.fatura { background: rgba(225, 29, 72, 0.2); color: #f43f5e; }
      &.despesa_fixa { background: rgba(161, 61, 99, 0.2); color: #ebd9b6; }
      &.parcela { background: rgba(201, 167, 78, 0.2); color: #C9A74E; }
      &.boleto { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
      &.recorrencia { background: rgba(16, 185, 129, 0.2); color: #34d399; }
    }

    .item-metadata {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .meta-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      color: #9c8e7c;

      span { font-size: 14px; }
      &.gold { color: #C9A74E; }
    }

    .item-value-action {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 6px;
    }

    .amount-display {
      font-size: 16px;
      font-weight: 800;
      color: #ffffff;

      &.line-through {
        text-decoration: line-through;
        color: #9c8e7c;
      }
    }

    .status-action-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;

      .status-dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
      }

      &.st-atrasado {
        background: rgba(239, 68, 68, 0.2);
        color: #f87171;
        .status-dot { background: #f87171; }
      }

      &.st-hoje {
        background: rgba(245, 158, 11, 0.2);
        color: #fbbf24;
        .status-dot { background: #fbbf24; }
      }

      &.st-pendente {
        background: rgba(201, 167, 78, 0.2);
        color: #ebd9b6;
        .status-dot { background: #C9A74E; }
      }

      &.st-pago {
        background: rgba(16, 185, 129, 0.2);
        color: #34d399;
        .status-dot { background: #34d399; }
      }
    }

    .pay-btn {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
      transition: all 0.2s ease;

      span { font-size: 14px; }

      &:hover {
        background: rgba(16, 185, 129, 0.3);
      }
    }

    /* Empty state */
    .empty-state {
      padding: 32px;
      text-align: center;
      color: #9c8e7c;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;

      .empty-icon { font-size: 36px; color: #C9A74E; }
    }

    /* Grid 30d Board */
    .vencimentos-grid-container {
      overflow-x: auto;
    }

    .grid-30d-board {
      display: grid;
      grid-template-columns: repeat(7, minmax(130px, 1fr));
      gap: 8px;
    }

    .grid-day-cell {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(216, 184, 126, 0.1);
      border-radius: 8px;
      padding: 8px;
      min-height: 90px;
      display: flex;
      flex-direction: column;
      gap: 6px;

      &.has-events {
        background: rgba(201, 167, 78, 0.05);
        border-color: rgba(201, 167, 78, 0.25);
      }

      &.is-today {
        border-color: #C9A74E;
        box-shadow: 0 0 10px rgba(201, 167, 78, 0.2);
      }
    }

    .cell-day-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      padding-bottom: 4px;

      .day-number {
        font-family: var(--font-mono, 'Space Grotesk', monospace);
        font-weight: 800;
        font-size: 13px;
        color: #C9A74E;
      }

      .day-label {
        font-size: 10px;
        color: #9c8e7c;
      }
    }

    .cell-events-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .grid-event-pill {
      font-size: 10px;
      padding: 3px 6px;
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 4px;
      background: rgba(255, 255, 255, 0.08);

      .ev-name {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 70px;
      }

      &.st-atrasado { background: rgba(239, 68, 68, 0.25); color: #f87171; }
      &.st-hoje { background: rgba(245, 158, 11, 0.25); color: #fbbf24; }
      &.st-pendente { background: rgba(201, 167, 78, 0.2); color: #ebd9b6; }
      &.st-pago { background: rgba(16, 185, 129, 0.2); color: #34d399; opacity: 0.6; }
    }

    .text-bordo { color: #f87171 !important; }
    .text-gold { color: #C9A74E !important; }
    .text-amber { color: #fbbf24 !important; }
  `],
})
export class CalendarioVencimentosComponent {
  readonly store = inject(PlanningStore);
  readonly modoExibicao = signal<'LISTA' | 'GRID_30D'>('LISTA');

  readonly totalVencendoHoje = computed(() => {
    return this.store.vencimentos30Dias().filter((v) => v.status === 'VENCENDO_HOJE').length;
  });

  readonly valorVencendoHoje = computed(() => {
    return this.store
      .vencimentos30Dias()
      .filter((v) => v.status === 'VENCENDO_HOJE')
      .reduce((acc, v) => acc + v.valor, 0);
  });

  readonly diasGrid30 = computed(() => {
    const hoje = new Date();
    const dias = [];
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    for (let i = 0; i < 28; i++) {
      const d = new Date(hoje);
      d.setDate(d.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const dayStr = String(d.getDate()).padStart(2, '0');
      const fullStr = `${year}-${month}-${dayStr}`;

      const evs = this.store
        .vencimentosFiltrados()
        .filter((item) => item.dataVencimento === fullStr);

      dias.push({
        diaNum: d.getDate(),
        diaSemana: diasSemana[d.getDay()],
        dateStr: fullStr,
        isHoje: i === 0,
        eventos: evs,
      });
    }

    return dias;
  });

  onTypeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.store.setFiltroVencimentoTipo(target.value as VencimentoTipo | 'TODOS');
  }

  formatShortDate(dateStr: string): string {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}`;
    }
    return dateStr;
  }

  getTipoLabel(tipo: VencimentoTipo): string {
    const map: Record<VencimentoTipo, string> = {
      FATURA: 'Fatura',
      DESPESA_FIXA: 'Fixa',
      PARCELA: 'Parcela',
      BOLETO: 'Boleto',
      RECORRENCIA: 'Aporte',
      OUTRO: 'Outro',
    };
    return map[tipo] || tipo;
  }

  getStatusLabel(status: VencimentoStatus): string {
    const map: Record<VencimentoStatus, string> = {
      ATRASADO: 'Atrasado',
      VENCENDO_HOJE: 'Hoje',
      PENDENTE: 'Pendente',
      PAGO: 'Pago',
    };
    return map[status] || status;
  }

  getStatusCssClass(status: VencimentoStatus): string {
    switch (status) {
      case 'ATRASADO':
        return 'st-atrasado';
      case 'VENCENDO_HOJE':
        return 'st-hoje';
      case 'PENDENTE':
        return 'st-pendente';
      case 'PAGO':
        return 'st-pago';
      default:
        return '';
    }
  }

  getItemCssClass(status: VencimentoStatus): string {
    switch (status) {
      case 'ATRASADO':
        return 'atrasado-card';
      case 'VENCENDO_HOJE':
        return 'hoje-card';
      case 'PAGO':
        return 'pago-card';
      default:
        return '';
    }
  }
}
