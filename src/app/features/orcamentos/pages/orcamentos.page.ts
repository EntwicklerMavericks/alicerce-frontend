import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { OrcamentosStore } from '../store/orcamentos.store';
import { OverlayService } from '../../../core/services/overlay.service';
import { ToastService } from '../../../core/services/toast.service';
import { HapticsService } from '../../../core/platform/haptics.service';
import { FabActionRegistryService } from '../../../core/services/fab-action-registry.service';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { FormularioOrcamentoComponent } from '../components/formulario-orcamento.component';
import { Orcamento, StatusOrcamento } from '../../../core/models/orcamento.models';

@Component({
  selector: 'app-orcamentos-page',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, CardComponent, ButtonComponent, BadgeComponent],
  template: `
    <div class="orcamentos-page animate-fade-in">
      <!-- Header da Página & Controle de Competência -->
      <div class="page-header">
        <div class="header-titles">
          <h1 class="page-title">Orçamentos Financeiros</h1>
          <p class="page-subtitle">Controle de consumo e limites por categoria</p>
        </div>

        <app-button
          variant="primary-gold"
          size="sm"
          icon="add"
          (btnClick)="abrirFormularioOrcamento()">
          Definir Teto
        </app-button>
      </div>

      <!-- Navegação de Mês/Competência -->
      <div class="month-selector-bar">
        <button class="month-nav-btn" (click)="alterarMes(-1)" title="Mês anterior">
          <span class="material-symbols-rounded">chevron_left</span>
        </button>

        <div class="month-display">
          <span class="material-symbols-rounded calendar-icon">calendar_month</span>
          <span class="month-label">{{ formatarCompetenciaExtenso(orcamentosStore.mesAnoSelecionado()) }}</span>
          <input
            type="month"
            class="hidden-month-input"
            [value]="orcamentosStore.mesAnoSelecionado()"
            (change)="onMonthInputChange($event)" />
        </div>

        <button class="month-nav-btn" (click)="alterarMes(1)" title="Próximo mês">
          <span class="material-symbols-rounded">chevron_right</span>
        </button>
      </div>

      <!-- Card Global Consolidado -->
      <app-card [glow]="true">
        <div class="global-summary">
          <div class="summary-top">
            <div class="summary-info">
              <span class="summary-label">CONSUMO GLOBAL DO MÊS</span>
              <div class="summary-values">
                <span class="spent-value">{{ orcamentosStore.gastoTotal() | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
                <span class="limit-value"> de {{ orcamentosStore.tetoTotal() | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
              </div>
            </div>

            <app-badge [variant]="obterBadgeVariantGlobal(orcamentosStore.statusGlobal())">
              {{ obterStatusLabel(orcamentosStore.statusGlobal()) }}
            </app-badge>
          </div>

          <!-- Barra de Progresso Trincada/Global -->
          <div class="progress-bar-container">
            <div
              class="progress-bar-fill"
              [style.width.%]="mathMin(orcamentosStore.percentualGlobal(), 100)"
              [ngClass]="obterCorStatusClass(orcamentosStore.statusGlobal())">
            </div>
          </div>

          <div class="summary-bottom">
            <span class="progress-percentage">{{ orcamentosStore.percentualGlobal() }}% consumido</span>
            <span class="remaining-text">
              Disponível: {{ orcamentosStore.restanteTotal() | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
            </span>
          </div>

          <!-- Mini Pills de Indicadores de Categorias -->
          <div class="status-counters-row">
            <div class="counter-item negative">
              <span class="dot red"></span>
              <span>{{ orcamentosStore.qtdExcedidos() }} Excedidos</span>
            </div>
            <div class="counter-item warning">
              <span class="dot orange"></span>
              <span>{{ orcamentosStore.qtdAlerta() }} em Alerta/Atenção</span>
            </div>
          </div>
        </div>
      </app-card>

      <!-- Lista de Categorias com Orçamento -->
      <div class="categories-section">
        <div class="section-title">
          <h2>Categorias de Gastos</h2>
          <span class="category-count">{{ orcamentosStore.orcamentos().length }} registradas</span>
        </div>

        @if (orcamentosStore.carregando()) {
          <div class="loading-state">
            <span class="spinner"></span>
            <p>Carregando orçamentos...</p>
          </div>
        } @else if (orcamentosStore.orcamentos().length === 0) {
          <div class="empty-state glass-card">
            <span class="material-symbols-rounded empty-icon">pie_chart</span>
            <h3>Nenhum teto configurado</h3>
            <p>Defina limites de orçamento por categoria para evitar imprevistos no final do mês.</p>
            <app-button variant="primary-gold" (btnClick)="abrirFormularioOrcamento()">
              Criar Primeiro Orçamento
            </app-button>
          </div>
        } @else {
          <div class="category-cards-grid">
            @for (item of orcamentosStore.orcamentos(); track item.id) {
              <div class="category-card glass-card animate-slide-up">
                <div class="category-card-header">
                  <div class="category-title-group">
                    <div
                      class="category-icon-avatar"
                      [style.background]="obterCorFundoIcone(item.status)">
                      <span class="material-symbols-rounded">{{ item.icone || 'category' }}</span>
                    </div>

                    <div class="category-name-wrap">
                      <h3 class="category-name">{{ item.categoria }}</h3>
                      <span class="category-subtext">{{ item.percentualConsumido }}% consumido</span>
                    </div>
                  </div>

                  <div class="card-header-actions">
                    <app-badge [variant]="obterBadgeVariantGlobal(item.status)">
                      {{ obterStatusLabel(item.status) }}
                    </app-badge>

                    <button
                      class="action-icon-btn"
                      (click)="removerOrcamento(item)"
                      title="Excluir Orçamento">
                      <span class="material-symbols-rounded">delete</span>
                    </button>
                  </div>
                </div>

                <!-- Barra de consumo tricolor conforme regras da Sprint 2.5 -->
                <!-- Verde <70%, Laranja 70-90%, Amarelo 90-100%, Vermelho >=100% -->
                <div class="category-progress-container">
                  <div
                    class="category-progress-fill"
                    [style.width.%]="mathMin(item.percentualConsumido, 100)"
                    [ngClass]="obterCorStatusClass(item.status)">
                  </div>
                </div>

                <div class="category-card-footer">
                  <div class="footer-values">
                    <span class="spent">Gasto: <strong>{{ item.valorGasto | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</strong></span>
                    <span class="limit">Teto: <strong>{{ item.valorTeto | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</strong></span>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .orcamentos-page {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
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

    .month-selector-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(216, 184, 126, 0.25);
      border-radius: 16px;
      padding: 6px 12px;
    }

    .month-nav-btn {
      background: none;
      border: none;
      color: var(--alic-color-gold-light, #ebd9b6);
      cursor: pointer;
      padding: 6px;
      display: flex;
      align-items: center;
      border-radius: 8px;

      &:hover {
        background: rgba(216, 184, 126, 0.15);
      }

      span { font-size: 24px; }
    }

    .month-display {
      position: relative;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;

      .calendar-icon {
        color: var(--alic-color-gold-main, #d8b87e);
        font-size: 20px;
      }

      .month-label {
        font-size: 14px;
        font-weight: 700;
        color: #ffffff;
      }
    }

    .hidden-month-input {
      position: absolute;
      inset: 0;
      opacity: 0;
      cursor: pointer;
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
      transition: width 0.4s ease, background-color 0.4s ease;

      &.bar-green { background: #4caf50; box-shadow: 0 0 10px rgba(76, 175, 80, 0.4); }
      &.bar-orange { background: #ff9800; box-shadow: 0 0 10px rgba(255, 152, 0, 0.4); }
      &.bar-yellow { background: #fbc02d; box-shadow: 0 0 10px rgba(251, 192, 45, 0.4); }
      &.bar-red { background: #f44336; box-shadow: 0 0 10px rgba(244, 67, 54, 0.4); }
    }

    .summary-bottom {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      font-weight: 600;
      color: rgba(235, 217, 182, 0.8);
    }

    .status-counters-row {
      display: flex;
      gap: 16px;
      border-top: 1px dashed rgba(216, 184, 126, 0.2);
      padding-top: 10px;
      margin-top: 4px;
    }

    .counter-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: rgba(235, 217, 182, 0.7);

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        &.red { background: #f44336; }
        &.orange { background: #ff9800; }
      }
    }

    .categories-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .section-title {
      display: flex;
      align-items: center;
      justify-content: space-between;

      h2 { font-size: 16px; font-weight: 700; color: #ebd9b6; margin: 0; }
      .category-count { font-size: 12px; color: rgba(235, 217, 182, 0.5); }
    }

    .category-cards-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .category-card {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      border-radius: 16px;
      background: rgba(31, 26, 27, 0.65);
      border: 1px solid rgba(216, 184, 126, 0.2);
    }

    .category-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .category-title-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .category-icon-avatar {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;

      span { font-size: 22px; color: #ffffff; }
    }

    .category-name {
      font-size: 15px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }

    .category-subtext {
      font-size: 11px;
      color: rgba(235, 217, 182, 0.6);
    }

    .card-header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .action-icon-btn {
      background: none;
      border: none;
      color: rgba(235, 217, 182, 0.5);
      cursor: pointer;
      padding: 4px;
      border-radius: 6px;

      &:hover {
        color: #f44336;
        background: rgba(244, 67, 54, 0.15);
      }

      span { font-size: 18px; }
    }

    .category-progress-container {
      width: 100%;
      height: 8px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 4px;
      overflow: hidden;
    }

    .category-progress-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease;

      &.bar-green { background: #4caf50; }
      &.bar-orange { background: #ff9800; }
      &.bar-yellow { background: #fbc02d; }
      &.bar-red { background: #f44336; }
    }

    .category-card-footer {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: rgba(235, 217, 182, 0.7);

      strong { color: #ffffff; }
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
      p { font-size: 13px; color: rgba(235, 217, 182, 0.6); margin: 0; max-width: 320px; }
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
export class OrcamentosPage implements OnInit {
  readonly orcamentosStore = inject(OrcamentosStore);
  private readonly overlayService = inject(OverlayService);
  private readonly toastService = inject(ToastService);
  private readonly haptics = inject(HapticsService);
  private readonly fabRegistry = inject(FabActionRegistryService);

  ngOnInit(): void {
    this.orcamentosStore.carregarOrcamentos();

    this.fabRegistry.registerAction({
      id: 'novo-orcamento',
      label: '+ Definir Orçamento',
      icon: 'pie_chart',
      color: '#d8b87e',
      priority: 95,
      execute: () => this.abrirFormularioOrcamento(),
    });
  }

  abrirFormularioOrcamento(): void {
    this.haptics.impactMedium();
    this.overlayService.openBottomSheet({
      component: FormularioOrcamentoComponent,
      title: 'Teto por Categoria',
    });
  }

  async removerOrcamento(item: Orcamento): Promise<void> {
    this.haptics.impactMedium();
    if (confirm(`Deseja remover o orçamento de "${item.categoria}"?`)) {
      const ok = await this.orcamentosStore.removerOrcamento(item.id);
      if (ok) {
        this.toastService.showSuccess(`Orçamento de "${item.categoria}" removido.`);
      }
    }
  }

  alterarMes(delta: number): void {
    this.haptics.impactLight();
    const atual = this.orcamentosStore.mesAnoSelecionado();
    const [anoStr, mesStr] = atual.split('-');
    let ano = parseInt(anoStr, 10);
    let mes = parseInt(mesStr, 10) + delta;

    if (mes > 12) {
      mes = 1;
      ano += 1;
    } else if (mes < 1) {
      mes = 12;
      ano -= 1;
    }

    const novoMesAno = `${ano}-${String(mes).padStart(2, '0')}`;
    this.orcamentosStore.definirMesAno(novoMesAno);
  }

  onMonthInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      this.orcamentosStore.definirMesAno(input.value);
    }
  }

  formatarCompetenciaExtenso(mesAno: string): string {
    if (!mesAno) return '';
    const [ano, mes] = mesAno.split('-');
    const meses = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];
    const idx = parseInt(mes, 10) - 1;
    return `${meses[idx] || ''} de ${ano}`;
  }

  mathMin(val: number, max: number): number {
    return Math.min(val, max);
  }

  // Define a classe CSS de cor conforme os percentuais estipulados na Sprint 2.5:
  // Verde <70%, Laranja 70-90%, Amarelo 90-100%, Vermelho >=100%
  obterCorStatusClass(status: StatusOrcamento): string {
    switch (status) {
      case 'NORMAL':
        return 'bar-green';
      case 'ALERTA':
        return 'bar-orange';
      case 'ATENCAO':
        return 'bar-yellow';
      case 'EXCEDIDO':
        return 'bar-red';
      default:
        return 'bar-green';
    }
  }

  obterBadgeVariantGlobal(status: StatusOrcamento): 'positive' | 'negative' | 'gold' | 'neutral' {
    switch (status) {
      case 'NORMAL':
        return 'positive';
      case 'ALERTA':
      case 'ATENCAO':
        return 'gold';
      case 'EXCEDIDO':
        return 'negative';
      default:
        return 'neutral';
    }
  }

  obterStatusLabel(status: StatusOrcamento): string {
    switch (status) {
      case 'NORMAL':
        return 'Normal';
      case 'ALERTA':
        return 'Alerta (>70%)';
      case 'ATENCAO':
        return 'Atenção (>90%)';
      case 'EXCEDIDO':
        return 'Excedido (≥100%)';
      default:
        return 'Normal';
    }
  }

  obterCorFundoIcone(status: StatusOrcamento): string {
    switch (status) {
      case 'NORMAL':
        return 'rgba(76, 175, 80, 0.25)';
      case 'ALERTA':
        return 'rgba(255, 152, 0, 0.25)';
      case 'ATENCAO':
        return 'rgba(251, 192, 45, 0.25)';
      case 'EXCEDIDO':
        return 'rgba(244, 67, 54, 0.35)';
      default:
        return 'rgba(216, 184, 126, 0.2)';
    }
  }
}
