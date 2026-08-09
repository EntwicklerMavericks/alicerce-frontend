import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { EtapaTimeline } from '../../../core/models/simulacao.models';

@Component({
  selector: 'app-cronograma-simulacao',
  standalone: true,
  imports: [CommonModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="cronograma-simulacao glass-card">
      <div class="cronograma-header">
        <div class="header-left">
          <span class="material-symbols-rounded header-icon">timeline</span>
          <div>
            <h3 class="header-title">Cronograma Comparativo Executivo</h3>
            <p class="header-sub">Linha do Tempo Paralela: Cenário Real vs Cenário Simulado</p>
          </div>
        </div>

        <div class="impacto-summary-badge" [class.positive]="diasAntecipacao > 0" [class.negative]="diasAntecipacao < 0">
          <span class="material-symbols-rounded">
            {{ diasAntecipacao > 0 ? 'rocket_launch' : diasAntecipacao < 0 ? 'warning' : 'schedule' }}
          </span>
          <div class="impacto-text">
            @if (diasAntecipacao > 0) {
              <span class="impacto-title">Antecipação de {{ diasAntecipacao }} dias</span>
              <span class="impacto-sub">({{ mesesAntecipacao }} meses mais rápido)</span>
            } @else if (diasAntecipacao < 0) {
              <span class="impacto-title">Atraso de {{ Math.abs(diasAntecipacao) }} dias</span>
              <span class="impacto-sub">({{ Math.abs(mesesAntecipacao) }} meses de extensão)</span>
            } @else {
              <span class="impacto-title">Sem alteração de prazo</span>
              <span class="impacto-sub">(Cronograma mantido)</span>
            }
          </div>
        </div>
      </div>

      <!-- Legenda Visual -->
      <div class="legenda-row">
        <div class="legenda-item">
          <span class="dot real"></span>
          <span>Cenário REAL (Baseline Atual)</span>
        </div>
        <div class="legenda-item">
          <span class="dot simulado"></span>
          <span>Cenário SIMULADO (What-If)</span>
        </div>
      </div>

      <!-- Timeline de Etapas Comparativas -->
      <div class="timeline-etapas-list">
        @for (etapa of etapasTimeline; track etapa.etapaId) {
          <div class="etapa-comparativa-card">
            <div class="etapa-meta-row">
              <div class="etapa-title-box">
                <span class="etapa-ordem">#{{ etapa.ordem }}</span>
                <span class="etapa-nome">{{ etapa.nome }}</span>
              </div>

              @if (etapa.diasDiferenca !== 0) {
                <span
                  class="delta-chip"
                  [class.faster]="etapa.diasDiferenca > 0"
                  [class.slower]="etapa.diasDiferenca < 0">
                  {{ etapa.diasDiferenca > 0 ? '-' + etapa.diasDiferenca + ' dias' : '+' + Math.abs(etapa.diasDiferenca) + ' dias' }}
                </span>
              }
            </div>

            <!-- Barras Paralelas de Comparação -->
            <div class="barras-paralelas-container">
              <!-- Barra Real -->
              <div class="bar-row real">
                <span class="bar-label">REAL</span>
                <div class="bar-track">
                  <div class="bar-fill real" style="width: 100%;"></div>
                </div>
                <span class="date-tag">{{ etapa.dataFimReal | date:'dd/MM/yy' }}</span>
              </div>

              <!-- Barra Simulada -->
              <div class="bar-row simulado">
                <span class="bar-label">SIM</span>
                <div class="bar-track">
                  <div
                    class="bar-fill simulado"
                    [class.faster]="etapa.diasDiferenca > 0"
                    [class.slower]="etapa.diasDiferenca < 0"
                    [style.width.%]="calcularLarguraSimulada(etapa.diasDiferenca)">
                  </div>
                </div>
                <span class="date-tag gold">{{ etapa.dataFimSimulada | date:'dd/MM/yy' }}</span>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Data de Conclusão Final Comparada -->
      <div class="final-conclusao-bar">
        <div class="conclusao-col">
          <span class="lbl">Término Real Estimado</span>
          <span class="val-date">{{ (dataConclusaoOriginal || novaDataConclusao) | date:'dd/MM/yyyy' }}</span>
        </div>
        <div class="divider-icon">
          <span class="material-symbols-rounded">double_arrow</span>
        </div>
        <div class="conclusao-col">
          <span class="lbl">Novo Término Simulado</span>
          <span class="val-date gold">{{ novaDataConclusao | date:'dd/MM/yyyy' }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cronograma-simulacao {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px;
      border-radius: 16px;
      background: rgba(31, 26, 27, 0.6);
      border: 1px solid rgba(216, 184, 126, 0.2);
    }

    .cronograma-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 10px;

      .header-icon {
        font-size: 28px;
        color: var(--alic-color-gold-main, #c9a74e);
      }

      .header-title {
        font-size: 15px;
        font-weight: 700;
        color: #ffffff;
        margin: 0;
      }

      .header-sub {
        font-size: 11px;
        color: rgba(235, 217, 182, 0.6);
        margin: 2px 0 0 0;
      }
    }

    .impacto-summary-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(216, 184, 126, 0.2);
      color: rgba(235, 217, 182, 0.8);

      &.positive {
        background: rgba(76, 175, 80, 0.15);
        border-color: rgba(76, 175, 80, 0.4);
        color: #4caf50;
      }

      &.negative {
        background: rgba(244, 67, 54, 0.15);
        border-color: rgba(244, 67, 54, 0.4);
        color: #f44336;
      }

      .material-symbols-rounded {
        font-size: 22px;
      }

      .impacto-text {
        display: flex;
        flex-direction: column;
      }

      .impacto-title {
        font-size: 12px;
        font-weight: 800;
      }

      .impacto-sub {
        font-size: 10px;
        opacity: 0.8;
      }
    }

    .legenda-row {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 6px 10px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      font-size: 11px;
      color: rgba(235, 217, 182, 0.7);
    }

    .legenda-item {
      display: flex;
      align-items: center;
      gap: 6px;

      .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;

        &.real { background: #A13D63; }
        &.simulado { background: #C9A74E; }
      }
    }

    .timeline-etapas-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .etapa-comparativa-card {
      display: flex;
      flex-direction: column;
      gap: 6px;
      background: rgba(255, 255, 255, 0.03);
      padding: 10px 12px;
      border-radius: 10px;
      border: 1px solid rgba(216, 184, 126, 0.12);
    }

    .etapa-meta-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .etapa-title-box {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .etapa-ordem {
      font-size: 11px;
      font-weight: 800;
      color: #c9a74e;
    }

    .etapa-nome {
      font-size: 13px;
      font-weight: 700;
      color: #ffffff;
    }

    .delta-chip {
      font-size: 10px;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 6px;

      &.faster {
        background: rgba(76, 175, 80, 0.2);
        color: #4caf50;
      }

      &.slower {
        background: rgba(244, 67, 54, 0.2);
        color: #f44336;
      }
    }

    .barras-paralelas-container {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .bar-row {
      display: flex;
      align-items: center;
      gap: 8px;

      .bar-label {
        font-size: 9px;
        font-weight: 800;
        width: 26px;
        color: rgba(235, 217, 182, 0.6);
      }

      .bar-track {
        flex: 1;
        height: 8px;
        background: rgba(255, 255, 255, 0.08);
        border-radius: 4px;
        overflow: hidden;
      }

      .bar-fill {
        height: 100%;
        border-radius: 4px;
        transition: width 0.3s ease;

        &.real {
          background: linear-gradient(90deg, #A13D63, #7a2b49);
        }

        &.simulado {
          background: linear-gradient(90deg, #C9A74E, #e0c273);

          &.faster {
            background: linear-gradient(90deg, #2e7d32, #4caf50);
          }

          &.slower {
            background: linear-gradient(90deg, #c62828, #f44336);
          }
        }
      }

      .date-tag {
        font-size: 10px;
        font-weight: 600;
        color: rgba(235, 217, 182, 0.6);
        width: 54px;
        text-align: right;

        &.gold { color: #c9a74e; font-weight: 700; }
      }
    }

    .final-conclusao-bar {
      display: flex;
      align-items: center;
      justify-content: space-around;
      background: rgba(0, 0, 0, 0.3);
      padding: 10px 14px;
      border-radius: 12px;
      border: 1px dashed rgba(216, 184, 126, 0.25);
    }

    .conclusao-col {
      display: flex;
      flex-direction: column;
      align-items: center;

      .lbl {
        font-size: 10px;
        color: rgba(235, 217, 182, 0.5);
      }

      .val-date {
        font-size: 13px;
        font-weight: 700;
        color: #ffffff;

        &.gold { color: #c9a74e; }
      }
    }

    .divider-icon {
      color: rgba(216, 184, 126, 0.5);
      span { font-size: 20px; }
    }
  `],
})
export class CronogramaSimulacaoComponent {
  @Input({ required: true }) etapasTimeline: EtapaTimeline[] = [];
  @Input({ required: true }) diasAntecipacao: number = 0;
  @Input({ required: true }) mesesAntecipacao: number = 0;
  @Input({ required: true }) novaDataConclusao: string = '';
  @Input() dataConclusaoOriginal?: string;

  readonly Math = Math;

  calcularLarguraSimulada(diasDiferenca: number): number {
    if (diasDiferenca > 0) {
      // Antecipado: barra simulated menor (e.g. 70% a 90%)
      const pct = Math.max(40, 100 - (diasDiferenca / 60) * 40);
      return Math.round(pct);
    } else if (diasDiferenca < 0) {
      // Atrasado: barra simulated 100% (ou cheia)
      return 100;
    }
    return 100;
  }
}
