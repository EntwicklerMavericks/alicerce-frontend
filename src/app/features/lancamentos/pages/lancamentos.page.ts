import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { PullToRefreshDirective } from '../../../shared/directives/pull-to-refresh.directive';
import { FluxoCaixaStore, FiltroStatusLancamento } from '../store/fluxo-caixa.store';
import { CarteirasStore } from '../../carteiras/store/carteiras.store';
import { OverlayService } from '../../../core/services/overlay.service';
import { ToastService } from '../../../core/services/toast.service';
import { HapticsService } from '../../../core/platform/haptics.service';
import { FormularioReceitaComponent } from '../components/formulario-receita.component';
import { FormularioDespesaComponent } from '../components/formulario-despesa.component';

@Component({
  selector: 'app-lancamentos-page',
  standalone: true,
  imports: [CommonModule, ButtonComponent, SkeletonComponent, PullToRefreshDirective],
  template: `
    <div class="lancamentos-container" appPullToRefresh (refresh)="recarregar()">
      <!-- Hero de Fluxo de Caixa Mensal -->
      <section class="fluxo-hero">
        <div class="hero-top">
          <div>
            <span class="hero-label">Fluxo de Caixa</span>
            <h2 class="hero-month">{{ nomeMesAtual() }} {{ fluxoStore.anoAtual() }}</h2>
          </div>
          <button class="eye-toggle" (click)="carteirasStore.toggleOlhoMagico()">
            <span class="material-symbols-rounded">
              {{ carteirasStore.esconderSaldos() ? 'visibility_off' : 'visibility' }}
            </span>
          </button>
        </div>

        <div class="hero-grid">
          <!-- 1. Saldo Atual no Ledger -->
          <div class="kpi-card">
            <span class="kpi-title">Saldo Atual (Ledger)</span>
            <span class="kpi-value" [class.negative]="fluxoStore.saldoAtual() < 0">
              @if (carteirasStore.esconderSaldos()) {
                ••••••
              } @else {
                {{ fluxoStore.saldoAtual() | currency:'BRL':'symbol':'1.2-2' }}
              }
            </span>
          </div>

          <!-- 2. Saldo Projetado -->
          <div class="kpi-card highlight">
            <span class="kpi-title">Saldo Projetado</span>
            <span class="kpi-value">
              @if (carteirasStore.esconderSaldos()) {
                ••••••
              } @else {
                {{ fluxoStore.saldoProjetado() | currency:'BRL':'symbol':'1.2-2' }}
              }
            </span>
          </div>

          <!-- 3. Fluxo Operacional do Mês -->
          <div class="kpi-card">
            <span class="kpi-title">Resultado do Mês</span>
            <span class="kpi-value" [class.positive]="fluxoStore.fluxoDoPeriodo() > 0" [class.negative]="fluxoStore.fluxoDoPeriodo() < 0">
              @if (carteirasStore.esconderSaldos()) {
                ••••••
              } @else {
                {{ fluxoStore.fluxoDoPeriodo() | currency:'BRL':'symbol':'1.2-2' }}
              }
            </span>
          </div>
        </div>

        <!-- Ações Rápida de Lançamento -->
        <div class="hero-actions">
          <app-button
            variant="primary-gold"
            size="sm"
            icon="arrow_upward"
            (btnClick)="abrirFormularioReceita()">
            + Receita
          </app-button>
          <app-button
            variant="primary-bordo"
            size="sm"
            icon="arrow_downward"
            (btnClick)="abrirFormularioDespesa()">
            + Despesa
          </app-button>
        </div>
      </section>

      <!-- Chips de Filtro -->
      <section class="filters-section">
        <div class="chips-group">
          <button
            class="chip"
            [class.active]="filtroAtual() === 'TODOS'"
            (click)="setFiltro('TODOS')">
            Todos
          </button>
          <button
            class="chip"
            [class.active]="filtroAtual() === 'PENDENTES'"
            (click)="setFiltro('PENDENTES')">
            ⏳ Pendentes
          </button>
          <button
            class="chip"
            [class.active]="filtroAtual() === 'LIQUIDADOS'"
            (click)="setFiltro('LIQUIDADOS')">
            ✅ Realizados
          </button>
        </div>
      </section>

      <!-- Conteúdo da Lista de Lançamentos -->
      <section class="list-section">
        @if (fluxoStore.carregando()) {
          <div class="skeleton-list">
            <app-skeleton width="100%" height="72px" borderRadius="16px"></app-skeleton>
            <app-skeleton width="100%" height="72px" borderRadius="16px"></app-skeleton>
            <app-skeleton width="100%" height="72px" borderRadius="16px"></app-skeleton>
          </div>
        } @else if (lancamentosFiltrados().length === 0) {
          <div class="empty-state">
            <span class="material-symbols-rounded empty-icon">receipt_long</span>
            <p>Nenhum lançamento encontrado para este período.</p>
          </div>
        } @else {
          <div class="cards-list">
            @for (item of lancamentosFiltrados(); track item.id) {
              <div class="lancamento-card" [class.receita]="item.tipo === 'RECEITA'" [class.despesa]="item.tipo === 'DESPESA'">
                <div class="card-icon">
                  <span class="material-symbols-rounded">
                    {{ item.tipo === 'RECEITA' ? 'arrow_upward' : 'arrow_downward' }}
                  </span>
                </div>

                <div class="card-main">
                  <div class="card-title-row">
                    <span class="item-title">{{ item.descricao }}</span>
                    <span class="item-amount" [class.receita]="item.tipo === 'RECEITA'" [class.despesa]="item.tipo === 'DESPESA'">
                      @if (carteirasStore.esconderSaldos()) {
                        ••••••
                      } @else {
                        {{ (item.tipo === 'RECEITA' ? '+' : '-') + (item.valor | currency:'BRL':'symbol':'1.2-2') }}
                      }
                    </span>
                  </div>

                  <div class="card-sub-row">
                    <span class="item-date">
                      {{ (item.tipo === 'RECEITA' ? item.data : item.dataVencimento) | date:'dd/MM/yyyy' }}
                    </span>
                    <span class="status-badge" [class.liquidado]="item.statusLiquidacao === 'LIQUIDADO'" [class.pendente]="item.statusLiquidacao === 'PENDENTE'">
                      {{ item.statusLiquidacao === 'LIQUIDADO' ? (item.tipo === 'RECEITA' ? 'Recebida' : 'Paga') : 'Pendente' }}
                    </span>
                  </div>
                </div>

                @if (item.statusLiquidacao === 'PENDENTE') {
                  <button
                    class="action-baixa-btn"
                    (click)="darBaixa(item)"
                    title="Liquidar Lançamento">
                    <span class="material-symbols-rounded">check_circle</span>
                  </button>
                }
              </div>
            }
          </div>
        }
      </section>
    </div>
  `,
  styles: [`
    .lancamentos-container {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding-bottom: 90px;
    }

    .fluxo-hero {
      background: var(--color-primary-gradient);
      border-radius: var(--radius-lg);
      padding: 20px;
      border: 1px solid rgba(216, 184, 126, 0.3);
      box-shadow: var(--shadow-md);
      display: flex;
      flex-direction: column;
      gap: 16px;

      .hero-top {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .hero-label {
          font-size: 12px;
          color: var(--color-champagne-light);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .hero-month {
          font-size: 20px;
          font-weight: 800;
          color: #ffffff;
        }

        .eye-toggle {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: var(--color-champagne-light);
          padding: 8px;
          border-radius: 50%;
          cursor: pointer;
        }
      }

      .hero-grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 10px;

        @media (max-width: 480px) {
          grid-template-columns: 1fr;
        }
      }

      .kpi-card {
        background: rgba(0, 0, 0, 0.25);
        padding: 12px;
        border-radius: var(--radius-md);
        display: flex;
        flex-direction: column;
        gap: 4px;

        &.highlight {
          border: 1px solid var(--color-champagne-main);
          background: rgba(216, 184, 126, 0.1);
        }

        .kpi-title {
          font-size: 11px;
          color: var(--color-text-secondary);
        }

        .kpi-value {
          font-size: 15px;
          font-weight: 700;
          color: #ffffff;

          &.positive { color: #81c784; }
          &.negative { color: #e57373; }
        }
      }

      .hero-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
      }
    }

    .filters-section {
      .chips-group {
        display: flex;
        gap: 8px;

        .chip {
          padding: 8px 16px;
          border-radius: var(--radius-full);
          border: 1px solid rgba(216, 184, 126, 0.2);
          background: rgba(255, 255, 255, 0.04);
          color: var(--color-text-secondary);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;

          &.active {
            background: var(--color-gold-gradient);
            color: #2b0b10;
            border-color: transparent;
            font-weight: 700;
          }
        }
      }
    }

    .list-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .skeleton-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: var(--color-text-secondary);

      .empty-icon {
        font-size: 48px;
        opacity: 0.5;
        margin-bottom: 8px;
      }
    }

    .cards-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .lancamento-card {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(216, 184, 126, 0.15);
      border-radius: var(--radius-md);
      padding: 14px;
      display: flex;
      align-items: center;
      gap: 12px;

      &.receita .card-icon {
        background: rgba(46, 125, 50, 0.15);
        color: #4caf50;
      }

      &.despesa .card-icon {
        background: rgba(198, 40, 40, 0.15);
        color: #ef5350;
      }

      .card-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .card-main {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .card-title-row {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .item-title {
          font-weight: 700;
          font-size: 15px;
          color: var(--color-text-primary);
        }

        .item-amount {
          font-weight: 800;
          font-size: 15px;

          &.receita { color: #81c784; }
          &.despesa { color: #e57373; }
        }
      }

      .card-sub-row {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .item-date {
          font-size: 12px;
          color: var(--color-text-secondary);
        }

        .status-badge {
          font-size: 11px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 12px;

          &.liquidado {
            background: rgba(76, 175, 80, 0.2);
            color: #81c784;
          }

          &.pendente {
            background: rgba(255, 152, 0, 0.2);
            color: #ffb74d;
          }
        }
      }

      .action-baixa-btn {
        background: none;
        border: none;
        color: var(--color-champagne-main);
        cursor: pointer;
        padding: 4px;
        border-radius: 50%;

        &:hover {
          color: #ffffff;
          background: rgba(216, 184, 126, 0.2);
        }
      }
    }
  `],
})
export class LancamentosPage implements OnInit {
  filtroAtual = signal<FiltroStatusLancamento>('TODOS');

  constructor(
    readonly fluxoStore: FluxoCaixaStore,
    readonly carteirasStore: CarteirasStore,
    private readonly overlay: OverlayService,
    private readonly toast: ToastService,
    private readonly haptics: HapticsService,
  ) {}

  ngOnInit(): void {
    this.fluxoStore.carregarDados();
  }

  recarregar(): void {
    this.fluxoStore.carregarDados();
  }

  nomeMesAtual(): string {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
    ];
    return meses[this.fluxoStore.mesAtual() - 1] || '';
  }

  setFiltro(f: FiltroStatusLancamento): void {
    this.filtroAtual.set(f);
  }

  lancamentosFiltrados(): Array<any> {
    const recs = this.fluxoStore.receitas().map((r) => ({ ...r, tipo: 'RECEITA' }));
    const desps = this.fluxoStore.despesas().map((d) => ({ ...d, tipo: 'DESPESA' }));
    const todos = [...recs, ...desps].sort((a: any, b: any) => {
      const dataA = new Date(a.tipo === 'RECEITA' ? a.data : a.dataVencimento).getTime();
      const dataB = new Date(b.tipo === 'RECEITA' ? b.data : b.dataVencimento).getTime();
      return dataB - dataA;
    });

    const filtro = this.filtroAtual();
    if (filtro === 'LIQUIDADOS') {
      return todos.filter((i) => i.statusLiquidacao === 'LIQUIDADO');
    }
    if (filtro === 'PENDENTES') {
      return todos.filter((i) => i.statusLiquidacao === 'PENDENTE');
    }
    return todos;
  }

  abrirFormularioReceita(): void {
    this.overlay.openBottomSheet({ component: FormularioReceitaComponent });
  }

  abrirFormularioDespesa(): void {
    this.overlay.openBottomSheet({ component: FormularioDespesaComponent });
  }

  async darBaixa(item: any): Promise<void> {
    await this.haptics.impactLight();

    let sucesso = false;
    if (item.tipo === 'RECEITA') {
      sucesso = await this.fluxoStore.darBaixaReceita(item.id);
    } else {
      sucesso = await this.fluxoStore.darBaixaDespesa(item.id);
    }

    if (sucesso) {
      await this.haptics.notificationSuccess();
      this.toast.showSuccess(
        `${item.tipo === 'RECEITA' ? 'Receita recebida' : 'Despesa paga'} com sucesso!`,
      );
    }
  }
}
