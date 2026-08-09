import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PlanningStore } from '../store/planning.store';
import { OrcamentoAlerta, MetaDestaque, OrcamentoStatus } from '../../../core/models/planning.models';

@Component({
  selector: 'app-saude-orcamentos-metas',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="saude-container">
      <!-- PANEL 1: SAÚDE DOS ORÇAMENTOS POR CATEGORIA -->
      <div class="panel-box glass-card animate-fade-in">
        <div class="panel-header">
          <div>
            <div class="badge-tag gold">
              <span class="material-symbols-rounded icon-sm">pie_chart</span>
              <span>ORÇAMENTOS & TETOS</span>
            </div>
            <h2 class="section-title">Saúde de Orçamentos 📊</h2>
            <p class="section-subtitle">
              Consumo relativo aos limites mensais por categoria com réguas tricolores de alerta.
            </p>
          </div>

          <div class="avg-metric-pill">
            <span class="lbl">Consumo Médio</span>
            <span class="val font-mono" [ngClass]="getConsumoColorClass(store.mediaConsumoOrcamentos())">
              {{ store.mediaConsumoOrcamentos() }}%
            </span>
          </div>
        </div>

        <div class="orcamentos-list">
          <div *ngFor="let orc of store.orcamentosAlerta()" class="orcamento-row-card">
            <div class="orc-top-info">
              <div class="orc-cat-name">
                <span class="cat-icon-chip" [style.background-color]="orc.cor || '#C9A74E'">
                  <span class="material-symbols-rounded">{{ orc.icone || 'label' }}</span>
                </span>
                <span class="cat-label">{{ orc.categoria }}</span>
              </div>

              <div class="orc-status-group">
                <span class="status-pill" [ngClass]="getOrcamentoStatusCss(orc.status)">
                  {{ getOrcamentoStatusLabel(orc.status) }}
                </span>
                <span class="pct-val font-mono" [ngClass]="getConsumoColorClass(orc.percentualConsumido)">
                  {{ orc.percentualConsumido }}%
                </span>
              </div>
            </div>

            <!-- Mini Barra Tricolor Progress -->
            <div class="tricolor-progress-track">
              <div
                class="tricolor-progress-fill"
                [style.width.%]="calcTricolorFillWidth(orc.percentualConsumido)"
                [ngClass]="getTricolorBarClass(orc.percentualConsumido)"
              ></div>
            </div>

            <div class="orc-amounts-bar font-mono">
              <span>Gasto: R$ {{ orc.valorGasto | number : '1.2-2' }}</span>
              <span>Teto: R$ {{ orc.valorTeto | number : '1.2-2' }}</span>
            </div>
          </div>
        </div>

        <div class="panel-footer">
          <a routerLink="/orcamentos" class="footer-link">
            <span>Ver Todos os Orçamentos</span>
            <span class="material-symbols-rounded">chevron_right</span>
          </a>
        </div>
      </div>

      <!-- PANEL 2: METAS PRIORITÁRIAS EM DESTAQUE -->
      <div class="panel-box glass-card animate-fade-in">
        <div class="panel-header">
          <div>
            <div class="badge-tag green">
              <span class="material-symbols-rounded icon-sm">savings</span>
              <span>METAS & APORTES</span>
            </div>
            <h2 class="section-title">Metas Prioritárias 🎯</h2>
            <p class="section-subtitle">
              Progresso acumulado e ritmo necessário para cumprimento no prazo estipulado.
            </p>
          </div>

          <div class="avg-metric-pill">
            <span class="lbl">Progresso Médio</span>
            <span class="val font-mono text-green">
              {{ store.progressoMedioMetas() }}%
            </span>
          </div>
        </div>

        <div class="metas-list">
          <div *ngFor="let meta of store.metasDestaque()" class="meta-row-card">
            <div class="meta-top-info">
              <div class="meta-identity">
                <span class="meta-icon-chip" [style.background-color]="meta.cor || '#10b981'">
                  <span class="material-symbols-rounded">{{ meta.icone || 'target' }}</span>
                </span>
                <div>
                  <h4 class="meta-name">{{ meta.nome }}</h4>
                  <span class="meta-deadline font-mono">
                    <span class="material-symbols-rounded icon-tiny">schedule</span>
                    {{ meta.diasRestantes }} dias restantes
                  </span>
                </div>
              </div>

              <div class="meta-status-group">
                <span class="prazo-badge" [class.atrasado]="meta.statusPrazo === 'ATRASADO'">
                  {{ meta.statusPrazo === 'ATRASADO' ? 'Atrasado' : 'No Prazo' }}
                </span>
                <span class="pct-val font-mono text-gold">{{ meta.percentualConcluido }}%</span>
              </div>
            </div>

            <!-- Glassmorphic Progress Bar -->
            <div class="glass-progress-track">
              <div
                class="glass-progress-fill"
                [style.width.%]="meta.percentualConcluido"
                [style.background]="meta.cor || 'var(--color-gold)'"
              ></div>
            </div>

            <div class="meta-amounts-bar font-mono">
              <span>Atual: R$ {{ meta.valorAtual | number : '1.2-2' }}</span>
              <span>Alvo: R$ {{ meta.valorAlvo | number : '1.2-2' }}</span>
            </div>

            <div class="rhythm-banner">
              <span class="rhythm-lbl">Ritmo Estimado Requerido:</span>
              <span class="rhythm-val font-mono">R$ {{ meta.ritmoMensalEstimado | number : '1.2-2' }}/mês</span>
            </div>
          </div>
        </div>

        <div class="panel-footer">
          <a routerLink="/goals" class="footer-link">
            <span>Gerenciar Metas</span>
            <span class="material-symbols-rounded">chevron_right</span>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .saude-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
      gap: 20px;
    }

    .panel-box {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;

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

        &.green {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #34d399;
        }
      }

      .icon-sm { font-size: 14px; }
    }

    .section-title {
      font-family: var(--font-primary, 'Outfit', sans-serif);
      font-size: 20px;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 4px 0;
    }

    .section-subtitle {
      font-size: 12px;
      color: #9c8e7c;
      margin: 0;
    }

    .avg-metric-pill {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      background: rgba(0, 0, 0, 0.3);
      padding: 6px 12px;
      border-radius: 10px;
      border: 1px solid rgba(216, 184, 126, 0.2);

      .lbl {
        font-size: 10px;
        color: #9c8e7c;
        font-weight: 700;
        text-transform: uppercase;
      }

      .val {
        font-size: 18px;
        font-weight: 800;
      }
    }

    /* List Containers */
    .orcamentos-list, .metas-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .orcamento-row-card, .meta-row-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(216, 184, 126, 0.15);
      border-radius: 12px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      transition: background 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.06);
      }
    }

    /* Orcamento Row Elements */
    .orc-top-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .orc-cat-name {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .cat-icon-chip, .meta-icon-chip {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;

      span { font-size: 18px; }
    }

    .cat-label {
      font-size: 14px;
      font-weight: 700;
      color: #ffffff;
    }

    .orc-status-group, .meta-status-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .status-pill {
      font-size: 10px;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 4px;
      text-transform: uppercase;

      &.st-normal { background: rgba(16, 185, 129, 0.2); color: #34d399; }
      &.st-atencao { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
      &.st-alerta { background: rgba(249, 115, 22, 0.2); color: #fb923c; }
      &.st-excedido { background: rgba(239, 68, 68, 0.25); color: #f87171; }
    }

    .pct-val {
      font-size: 14px;
      font-weight: 800;
    }

    /* Tricolor Progress Bar */
    .tricolor-progress-track {
      width: 100%;
      height: 8px;
      background: rgba(0, 0, 0, 0.35);
      border-radius: 9999px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .tricolor-progress-fill {
      height: 100%;
      border-radius: 9999px;
      transition: width 0.3s ease;

      &.bar-green { background: linear-gradient(90deg, #10b981, #34d399); }
      &.bar-yellow { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
      &.bar-orange { background: linear-gradient(90deg, #f97316, #fb923c); }
      &.bar-red { background: linear-gradient(90deg, #e11d48, #ef4444); }
    }

    .orc-amounts-bar, .meta-amounts-bar {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #9c8e7c;
    }

    /* Meta Row Elements */
    .meta-top-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .meta-identity {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .meta-name {
      font-size: 14px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }

    .meta-deadline {
      font-size: 11px;
      color: #9c8e7c;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .icon-tiny { font-size: 12px; }

    .prazo-badge {
      font-size: 10px;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 4px;
      background: rgba(16, 185, 129, 0.2);
      color: #34d399;

      &.atrasado {
        background: rgba(239, 68, 68, 0.2);
        color: #f87171;
      }
    }

    .glass-progress-track {
      width: 100%;
      height: 8px;
      background: rgba(0, 0, 0, 0.35);
      border-radius: 9999px;
      overflow: hidden;
    }

    .glass-progress-fill {
      height: 100%;
      border-radius: 9999px;
      transition: width 0.3s ease;
    }

    .rhythm-banner {
      background: rgba(201, 167, 78, 0.1);
      border: 1px solid rgba(201, 167, 78, 0.2);
      border-radius: 6px;
      padding: 4px 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;

      .rhythm-lbl { color: #9c8e7c; }
      .rhythm-val { font-weight: 800; color: #C9A74E; }
    }

    .panel-footer {
      display: flex;
      justify-content: flex-end;
      margin-top: 4px;
    }

    .footer-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 700;
      color: #C9A74E;
      text-decoration: none;
      transition: color 0.2s ease;

      span { font-size: 16px; }

      &:hover {
        color: #ffffff;
      }
    }

    .text-green { color: #34d399 !important; }
    .text-gold { color: #C9A74E !important; }
    .text-bordo { color: #f87171 !important; }
    .text-amber { color: #fbbf24 !important; }
  `],
})
export class SaudeOrcamentosMetasComponent {
  readonly store = inject(PlanningStore);

  calcTricolorFillWidth(pct: number): number {
    return Math.min(pct, 100);
  }

  getTricolorBarClass(pct: number): string {
    if (pct >= 100) return 'bar-red';
    if (pct >= 90) return 'bar-orange';
    if (pct >= 70) return 'bar-yellow';
    return 'bar-green';
  }

  getConsumoColorClass(pct: number): string {
    if (pct >= 100) return 'text-bordo';
    if (pct >= 70) return 'text-amber';
    return 'text-green';
  }

  getOrcamentoStatusLabel(status: OrcamentoStatus): string {
    const map: Record<OrcamentoStatus, string> = {
      DENTRO_DO_LIMITE: 'Normal',
      ATENCAO: 'Atenção',
      ALERTA: 'Alerta',
      EXCEDIDO: 'Excedido',
    };
    return map[status] || status;
  }

  getOrcamentoStatusCss(status: OrcamentoStatus): string {
    switch (status) {
      case 'DENTRO_DO_LIMITE':
        return 'st-normal';
      case 'ATENCAO':
        return 'st-atencao';
      case 'ALERTA':
        return 'st-alerta';
      case 'EXCEDIDO':
        return 'st-excedido';
      default:
        return '';
    }
  }
}
