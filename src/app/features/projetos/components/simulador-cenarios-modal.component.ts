import { Component, inject, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SimulacaoStore } from '../store/simulacao.store';
import { ProjetosStore } from '../store/projetos.store';
import { ToastService } from '../../../core/services/toast.service';
import { HapticsService } from '../../../core/platform/haptics.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { CronogramaSimulacaoComponent } from './cronograma-simulacao.component';

@Component({
  selector: 'app-simulador-cenarios-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CurrencyPipe,
    DatePipe,
    ButtonComponent,
    BadgeComponent,
    CronogramaSimulacaoComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (simulacaoStore.modalAberto()) {
      <div class="modal-backdrop animate-fade-in" (click)="fechar()">
        <div class="modal-drawer glass-card animate-slide-up" (click)="$event.stopPropagation()">
          <!-- CABEÇALHO DO MODAL -->
          <div class="modal-header">
            <div class="header-title-box">
              <div class="icon-badge">
                <span class="material-symbols-rounded">psychology</span>
              </div>
              <div>
                <h2 class="modal-title">Simulador de Cenários Executivos</h2>
                <p class="modal-sub">Análise de Sensibilidade What-If & Readiness em Tempo Real</p>
              </div>
            </div>

            <button class="close-btn" (click)="fechar()" title="Fechar">
              <span class="material-symbols-rounded">close</span>
            </button>
          </div>

          <div class="modal-body">
            <!-- PAINEL DE SLIDERS REATIVOS -->
            <div class="sliders-section glass-card">
              <h3 class="section-subtitle">
                <span class="material-symbols-rounded">tune</span>
                Parâmetros de Variabilidade (What-If)
              </h3>

              <div class="sliders-grid">
                <!-- Slider 1: Aporte Mensal -->
                <div class="slider-control-group">
                  <div class="slider-label-row">
                    <label for="aporteSlider" class="slider-label">
                      Multiplicador de Aporte Mensal
                    </label>
                    <span class="slider-val-badge gold">
                      {{ (simulacaoStore.parametros().multiplicadorAporteMensal * 100) | number:'1.0-0' }}%
                      ({{ simulacaoStore.parametros().multiplicadorAporteMensal | number:'1.2-2' }}x)
                    </span>
                  </div>

                  <input
                    id="aporteSlider"
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.05"
                    [ngModel]="simulacaoStore.parametros().multiplicadorAporteMensal"
                    (ngModelChange)="onAporteChange($event)"
                    class="range-slider gold"
                  />

                  <div class="preset-chips">
                    <button class="preset-chip" (click)="onAporteChange(0.5)">50% (-50%)</button>
                    <button class="preset-chip" (click)="onAporteChange(1.0)">100% (Atual)</button>
                    <button class="preset-chip" (click)="onAporteChange(1.5)">150% (+50%)</button>
                    <button class="preset-chip" (click)="onAporteChange(2.0)">200% (2x)</button>
                  </div>
                </div>

                <!-- Slider 2: Novo Orçamento Estimado -->
                <div class="slider-control-group">
                  <div class="slider-label-row">
                    <label for="orcamentoInput" class="slider-label">
                      Novo Orçamento Estimado (R$)
                    </label>
                    <span class="slider-val-badge">
                      {{ (simulacaoStore.parametros().novoOrcamentoEstimado || 0) | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}
                    </span>
                  </div>

                  <div class="input-range-combo">
                    <input
                      id="orcamentoSlider"
                      type="range"
                      min="5000"
                      [max]="maxOrcamentoSlider"
                      step="1000"
                      [ngModel]="simulacaoStore.parametros().novoOrcamentoEstimado"
                      (ngModelChange)="onOrcamentoChange($event)"
                      class="range-slider"
                    />

                    <input
                      id="orcamentoInput"
                      type="number"
                      [ngModel]="simulacaoStore.parametros().novoOrcamentoEstimado"
                      (ngModelChange)="onOrcamentoChange($event)"
                      class="num-input-gold"
                      step="1000"
                    />
                  </div>
                </div>

                <!-- Slider 3: Tempo de Esfriamento -->
                <div class="slider-control-group">
                  <div class="slider-label-row">
                    <label for="esfriamentoSlider" class="slider-label">
                      Multiplicador Tempo de Esfriamento (Wishlist)
                    </label>
                    <span class="slider-val-badge bordeaux">
                      {{ (simulacaoStore.parametros().multiplicadorTempoEsfriamento * 100) | number:'1.0-0' }}%
                    </span>
                  </div>

                  <input
                    id="esfriamentoSlider"
                    type="range"
                    min="0"
                    max="2.0"
                    step="0.1"
                    [ngModel]="simulacaoStore.parametros().multiplicadorTempoEsfriamento"
                    (ngModelChange)="onEsfriamentoChange($event)"
                    class="range-slider bordeaux"
                  />

                  <div class="preset-chips">
                    <button class="preset-chip" (click)="onEsfriamentoChange(0)">0% (Sem Trava)</button>
                    <button class="preset-chip" (click)="onEsfriamentoChange(0.5)">50% (Metade)</button>
                    <button class="preset-chip" (click)="onEsfriamentoChange(1.0)">100% (Padrão)</button>
                    <button class="preset-chip" (click)="onEsfriamentoChange(2.0)">200% (Duplo)</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- TABELA COMPARATIVA DINÂMICA (REAL VS SIMULADO) -->
            @if (simulacaoStore.baseline() && simulacaoStore.impacto()) {
              <div class="tabela-comparativa-box glass-card">
                <h3 class="section-subtitle">
                  <span class="material-symbols-rounded">compare_arrows</span>
                  Tabela Comparativa de Impacto Executivo
                </h3>

                <div class="table-responsive">
                  <table class="comparative-table">
                    <thead>
                      <tr>
                        <th>Métrica de Avaliação</th>
                        <th class="text-center">Cenário REAL</th>
                        <th class="text-center">Cenário SIMULADO</th>
                        <th class="text-right">Variação / Impacto</th>
                      </tr>
                    </thead>
                    <tbody>
                      <!-- Prazo Final -->
                      <tr>
                        <td class="metric-name">
                          <span class="material-symbols-rounded icon">event</span>
                          Término Estimado
                        </td>
                        <td class="text-center val-real">
                          {{ simulacaoStore.baseline()!.dataTerminoEstimada | date:'dd/MM/yyyy' }}
                        </td>
                        <td class="text-center val-simulado gold">
                          {{ simulacaoStore.impacto()!.novaDataConclusao | date:'dd/MM/yyyy' }}
                        </td>
                        <td class="text-right">
                          <span
                            class="impact-badge"
                            [class.positive]="simulacaoStore.diasAntecipados() > 0"
                            [class.negative]="simulacaoStore.diasAntecipados() < 0">
                            {{ simulacaoStore.diasAntecipados() > 0 ? '-' + simulacaoStore.diasAntecipados() + ' dias' : (simulacaoStore.diasAntecipados() < 0 ? '+' + Math.abs(simulacaoStore.diasAntecipados()) + ' dias' : 'Mantido') }}
                          </span>
                        </td>
                      </tr>

                      <!-- Duração em Meses -->
                      <tr>
                        <td class="metric-name">
                          <span class="material-symbols-rounded icon">hourglass_bottom</span>
                          Duração Estimada
                        </td>
                        <td class="text-center val-real">
                          {{ simulacaoStore.baseline()!.duracaoMeses }} meses
                        </td>
                        <td class="text-center val-simulado gold">
                          {{ Math.max(0.5, (simulacaoStore.baseline()!.duracaoMeses - simulacaoStore.mesesAntecipados())) | number:'1.1-1' }} meses
                        </td>
                        <td class="text-right">
                          <span
                            class="impact-badge"
                            [class.positive]="simulacaoStore.mesesAntecipados() > 0"
                            [class.negative]="simulacaoStore.mesesAntecipados() < 0">
                            {{ simulacaoStore.mesesAntecipados() > 0 ? '-' + simulacaoStore.mesesAntecipados() + ' meses' : (simulacaoStore.mesesAntecipados() < 0 ? '+' + Math.abs(simulacaoStore.mesesAntecipados()) + ' meses' : 'Igual') }}
                          </span>
                        </td>
                      </tr>

                      <!-- Orçamento -->
                      <tr>
                        <td class="metric-name">
                          <span class="material-symbols-rounded icon">payments</span>
                          Orçamento do Projeto
                        </td>
                        <td class="text-center val-real">
                          {{ simulacaoStore.baseline()!.custoTotal | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}
                        </td>
                        <td class="text-center val-simulado gold">
                          {{ (simulacaoStore.parametros().novoOrcamentoEstimado || simulacaoStore.baseline()!.custoTotal) | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}
                        </td>
                        <td class="text-right">
                          @let difOrc = simulacaoStore.impacto()!.diferencaOrcamento;
                          <span
                            class="impact-badge"
                            [class.positive]="difOrc < 0"
                            [class.negative]="difOrc > 0">
                            {{ difOrc === 0 ? 'Sem alteração' : (difOrc > 0 ? '+' : '') + (difOrc | currency:'BRL':'symbol':'1.0-0':'pt-BR') }}
                          </span>
                        </td>
                      </tr>

                      <!-- Cobertura Financeira -->
                      <tr>
                        <td class="metric-name">
                          <span class="material-symbols-rounded icon">account_balance_wallet</span>
                          Cobertura Financeira
                        </td>
                        <td class="text-center val-real">
                          {{ simulacaoStore.baseline()!.coberturaFinanceira }}%
                        </td>
                        <td class="text-center val-simulado gold">
                          {{ simulacaoStore.impacto()!.novaCoberturaFinanceira }}%
                        </td>
                        <td class="text-right">
                          @let difCob = simulacaoStore.impacto()!.novaCoberturaFinanceira - simulacaoStore.baseline()!.coberturaFinanceira;
                          <span
                            class="impact-badge"
                            [class.positive]="difCob > 0"
                            [class.negative]="difCob < 0">
                            {{ difCob === 0 ? 'Estável' : (difCob > 0 ? '+' : '') + difCob + '%' }}
                          </span>
                        </td>
                      </tr>

                      <!-- Readiness Score -->
                      <tr>
                        <td class="metric-name">
                          <span class="material-symbols-rounded icon">verified</span>
                          Readiness Score
                        </td>
                        <td class="text-center val-real">
                          {{ simulacaoStore.baseline()!.readinessScore }}/100
                        </td>
                        <td class="text-center val-simulado" [class]="obterReadinessClass(simulacaoStore.impacto()!.novoReadinessScore)">
                          {{ simulacaoStore.impacto()!.novoReadinessScore }}/100
                        </td>
                        <td class="text-right">
                          @let difRead = simulacaoStore.impacto()!.novoReadinessScore - simulacaoStore.baseline()!.readinessScore;
                          <span
                            class="impact-badge"
                            [class.positive]="difRead > 0"
                            [class.negative]="difRead < 0">
                            {{ difRead === 0 ? 'Manter' : (difRead > 0 ? '+' : '') + difRead + ' pts' }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            }

            <!-- CARD DO CAMINHO CRÍTICO (GARGALO / CRITICAL PATH) -->
            @if (simulacaoStore.gargalo(); as gargalo) {
              <div class="gargalo-card glass-card" [class]="gargalo.gravidade.toLowerCase()">
                <div class="gargalo-header">
                  <div class="gargalo-title-box">
                    <span class="material-symbols-rounded gargalo-icon">report_problem</span>
                    <div>
                      <h4 class="gargalo-title">Caminho Crítico (Gargalo da Simulação)</h4>
                      <p class="gargalo-subtitle">Análise de causa e efeito na velocidade do projeto</p>
                    </div>
                  </div>

                  <app-badge [variant]="obterGravidadeVariant(gargalo.gravidade)">
                    Gravidade {{ gargalo.gravidade }}
                  </app-badge>
                </div>

                @if (gargalo.nomeEtapa) {
                  <div class="etapa-afetada-tag">
                    <span class="material-symbols-rounded">warning</span>
                    <span>Etapa Ofensora: <strong>{{ gargalo.nomeEtapa }}</strong></span>
                  </div>
                }

                <div class="gargalo-body">
                  <p class="causa-text">
                    <strong>Justificativa de Causa:</strong> {{ gargalo.causa }}
                  </p>

                  <div class="sugestao-box">
                    <span class="material-symbols-rounded sugestao-icon">lightbulb</span>
                    <p class="sugestao-text">
                      <strong>Recomendação Executiva:</strong> {{ gargalo.sugestaoAcao }}
                    </p>
                  </div>
                </div>
              </div>
            }

            <!-- CRONOGRAMA COMPARATIVO DE BARRAS PARALELAS -->
            @if (simulacaoStore.resultado()) {
              <app-cronograma-simulacao
                [etapasTimeline]="simulacaoStore.etapasTimeline()"
                [diasAntecipacao]="simulacaoStore.diasAntecipados()"
                [mesesAntecipacao]="simulacaoStore.mesesAntecipados()"
                [novaDataConclusao]="simulacaoStore.impacto()?.novaDataConclusao || ''"
                [dataConclusaoOriginal]="simulacaoStore.baseline()?.dataTerminoEstimada"
              ></app-cronograma-simulacao>
            }
          </div>

          <!-- RODAPÉ DO MODAL -->
          <div class="modal-footer">
            <app-button variant="secondary-glass" (btnClick)="fechar()">
              Cancelar
            </app-button>

            <app-button
              variant="primary-gold"
              icon="task_alt"
              [disabled]="simulacaoStore.aplicando()"
              (btnClick)="aplicarCenario()">
              {{ simulacaoStore.aplicando() ? 'Aplicando Cenário...' : 'Aplicar Cenário ao Projeto Real' }}
            </app-button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(8px);
      z-index: 1000;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }

    .modal-drawer {
      width: 100%;
      max-width: 820px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      background: #1F1A1B;
      border: 1px solid rgba(216, 184, 126, 0.3);
      border-radius: 24px 24px 0 0;
      box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.6);
      overflow: hidden;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid rgba(216, 184, 126, 0.15);
      background: rgba(0, 0, 0, 0.2);
    }

    .header-title-box {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .icon-badge {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: var(--alic-color-gold-gradient, linear-gradient(135deg, #c9a74e, #9e7f2e));
      display: flex;
      align-items: center;
      justify-content: center;
      color: #1F1A1B;

      span { font-size: 24px; }
    }

    .modal-title {
      font-size: 17px;
      font-weight: 800;
      color: #ffffff;
      margin: 0;
    }

    .modal-sub {
      font-size: 11px;
      color: rgba(235, 217, 182, 0.7);
      margin: 2px 0 0 0;
    }

    .close-btn {
      background: none;
      border: none;
      color: rgba(235, 217, 182, 0.6);
      cursor: pointer;
      padding: 6px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #ffffff;
      }
    }

    .modal-body {
      padding: 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .section-subtitle {
      font-size: 14px;
      font-weight: 700;
      color: var(--alic-color-gold-light, #ebd9b6);
      margin: 0 0 14px 0;
      display: flex;
      align-items: center;
      gap: 8px;

      span { font-size: 18px; color: #c9a74e; }
    }

    .sliders-section {
      padding: 16px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(216, 184, 126, 0.15);
    }

    .sliders-grid {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .slider-control-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .slider-label-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .slider-label {
      font-size: 12px;
      font-weight: 600;
      color: rgba(235, 217, 182, 0.85);
    }

    .slider-val-badge {
      font-size: 12px;
      font-weight: 800;
      color: #ffffff;

      &.gold { color: #c9a74e; }
      &.bordeaux { color: #A13D63; }
    }

    .range-slider {
      width: 100%;
      height: 6px;
      border-radius: 3px;
      appearance: none;
      background: rgba(255, 255, 255, 0.15);
      outline: none;
      cursor: pointer;

      &::-webkit-slider-thumb {
        appearance: none;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #c9a74e;
        cursor: pointer;
        box-shadow: 0 0 8px rgba(201, 167, 78, 0.6);
      }

      &.bordeaux::-webkit-slider-thumb {
        background: #A13D63;
        box-shadow: 0 0 8px rgba(161, 61, 99, 0.6);
      }
    }

    .input-range-combo {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .num-input-gold {
      width: 120px;
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(216, 184, 126, 0.3);
      border-radius: 8px;
      padding: 6px 10px;
      color: #c9a74e;
      font-weight: 700;
      font-size: 13px;
      outline: none;

      &:focus {
        border-color: #c9a74e;
      }
    }

    .preset-chips {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-top: 4px;
    }

    .preset-chip {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(216, 184, 126, 0.15);
      border-radius: 6px;
      padding: 3px 8px;
      font-size: 10px;
      color: rgba(235, 217, 182, 0.7);
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(201, 167, 78, 0.2);
        color: #ffffff;
        border-color: #c9a74e;
      }
    }

    .tabela-comparativa-box {
      padding: 16px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(216, 184, 126, 0.15);
    }

    .table-responsive {
      overflow-x: auto;
    }

    .comparative-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;

      th {
        padding: 8px 10px;
        color: rgba(235, 217, 182, 0.6);
        font-weight: 600;
        font-size: 11px;
        border-bottom: 1px solid rgba(216, 184, 126, 0.15);
      }

      td {
        padding: 10px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }
    }

    .metric-name {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 700;
      color: #ffffff;

      .icon { font-size: 16px; color: #c9a74e; }
    }

    .val-real {
      color: rgba(235, 217, 182, 0.8);
      font-weight: 600;
    }

    .val-simulado {
      font-weight: 800;

      &.gold { color: #c9a74e; }
      &.high { color: #4caf50; }
      &.medium { color: #c9a74e; }
      &.low { color: #f44336; }
    }

    .impact-badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.08);

      &.positive {
        background: rgba(76, 175, 80, 0.2);
        color: #4caf50;
      }

      &.negative {
        background: rgba(244, 67, 54, 0.2);
        color: #f44336;
      }
    }

    .gargalo-card {
      padding: 16px;
      border-radius: 16px;
      background: rgba(244, 67, 54, 0.08);
      border: 1px solid rgba(244, 67, 54, 0.3);
      display: flex;
      flex-direction: column;
      gap: 10px;

      &.alta {
        background: rgba(244, 67, 54, 0.1);
        border-color: rgba(244, 67, 54, 0.4);
      }

      &.media {
        background: rgba(201, 167, 78, 0.1);
        border-color: rgba(201, 167, 78, 0.4);
      }

      &.baixa {
        background: rgba(76, 175, 80, 0.1);
        border-color: rgba(76, 175, 80, 0.4);
      }
    }

    .gargalo-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .gargalo-title-box {
      display: flex;
      align-items: center;
      gap: 10px;

      .gargalo-icon {
        font-size: 24px;
        color: #f44336;
      }

      .gargalo-title {
        font-size: 14px;
        font-weight: 800;
        color: #ffffff;
        margin: 0;
      }

      .gargalo-subtitle {
        font-size: 11px;
        color: rgba(235, 217, 182, 0.7);
        margin: 2px 0 0 0;
      }
    }

    .etapa-afetada-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #f44336;

      span { font-size: 16px; }
    }

    .gargalo-body {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .causa-text {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.85);
      margin: 0;
      line-height: 1.4;
    }

    .sugestao-box {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      background: rgba(0, 0, 0, 0.25);
      padding: 10px;
      border-radius: 8px;

      .sugestao-icon {
        font-size: 18px;
        color: #c9a74e;
        flex-shrink: 0;
      }

      .sugestao-text {
        font-size: 11px;
        color: #ebd9b6;
        margin: 0;
        line-height: 1.4;
      }
    }

    .modal-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 20px;
      border-top: 1px solid rgba(216, 184, 126, 0.15);
      background: rgba(0, 0, 0, 0.25);
    }
  `],
})
export class SimuladorCenariosModalComponent {
  readonly simulacaoStore = inject(SimulacaoStore);
  private readonly projetosStore = inject(ProjetosStore);
  private readonly toastService = inject(ToastService);
  private readonly haptics = inject(HapticsService);

  @Output() cenarioAplicado = new EventEmitter<number>();

  readonly Math = Math;

  get maxOrcamentoSlider(): number {
    const proj = this.simulacaoStore.projetoAtual();
    const base = proj?.orcamentoEstimado || 50000;
    return Math.max(100000, base * 3);
  }

  fechar(): void {
    this.haptics.impactLight();
    this.simulacaoStore.fecharModal();
  }

  onAporteChange(val: number): void {
    this.haptics.selectionChanged();
    this.simulacaoStore.atualizarParametros({ multiplicadorAporteMensal: Number(val) });
  }

  onOrcamentoChange(val: number): void {
    this.haptics.selectionChanged();
    this.simulacaoStore.atualizarParametros({ novoOrcamentoEstimado: Number(val) });
  }

  onEsfriamentoChange(val: number): void {
    this.haptics.selectionChanged();
    this.simulacaoStore.atualizarParametros({ multiplicadorTempoEsfriamento: Number(val) });
  }

  async aplicarCenario(): Promise<void> {
    this.haptics.impactMedium();
    const proj = this.simulacaoStore.projetoAtual();
    if (!proj) return;

    const novoOrc = this.simulacaoStore.parametros().novoOrcamentoEstimado;

    const ok = await this.simulacaoStore.aplicarCenarioAoProjeto((orcAtualizado) => {
      if (proj && orcAtualizado) {
        this.projetosStore.atualizarProjeto(proj.id, {
          orcamentoEstimado: orcAtualizado,
        });
      }
    });

    if (ok) {
      this.toastService.showSuccess(
        `Cenário simulado aplicado ao projeto "${proj.nome}" com sucesso!`
      );
      this.cenarioAplicado.emit(novoOrc || proj.orcamentoEstimado);
    }
  }

  obterReadinessClass(score: number): 'high' | 'medium' | 'low' {
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  obterGravidadeVariant(gravidade: 'ALTA' | 'MEDIA' | 'BAIXA'): 'bordo' | 'gold' | 'positive' {
    switch (gravidade) {
      case 'ALTA': return 'bordo';
      case 'MEDIA': return 'gold';
      case 'BAIXA': return 'positive';
    }
  }
}
