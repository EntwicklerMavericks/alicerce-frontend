import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanningStore } from '../store/planning.store';
import { ExplanationBreakdown, ProjectedEvent } from '../../../core/models/planning.models';

@Component({
  selector: 'app-explanation-breakdown',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="breakdown-card glass-card">
      <div class="breakdown-header">
        <div>
          <h3 class="breakdown-title">
            <span class="material-symbols-rounded header-icon">pie_chart</span>
            Explicação do Fluxo por Categoria & Fonte
          </h3>
          <p class="breakdown-subtitle">
            Entenda quais categorias impactam a projeção financeira
            {{ store.competenciaSelecionada() ? 'em ' + store.competenciaSelecionada()?.mesRotulo : 'nos 12 Meses' }}
          </p>
        </div>

        <div class="filter-pills">
          <button
            class="pill-btn"
            [class.active]="filtrosTipo === 'TODOS'"
            (click)="setFiltroTipo('TODOS')"
          >
            Todos
          </button>
          <button
            class="pill-btn receita"
            [class.active]="filtrosTipo === 'RECEITA'"
            (click)="setFiltroTipo('RECEITA')"
          >
            Receitas
          </button>
          <button
            class="pill-btn despesa"
            [class.active]="filtrosTipo === 'DESPESA'"
            (click)="setFiltroTipo('DESPESA')"
          >
            Despesas
          </button>
        </div>
      </div>

      <!-- Tag de categoria ativa -->
      <div *ngIf="store.selectedCategory()" class="active-category-banner">
        <span>Filtrando por Categoria: <strong>{{ store.selectedCategory() }}</strong></span>
        <button class="clear-category-btn" (click)="store.selecionarCategoria(null)">
          <span class="material-symbols-rounded">close</span> Limpar Filtro
        </button>
      </div>

      <!-- Lista de Categorias com Barra Proporcional -->
      <div class="categories-grid" *ngIf="breakdownLista().length > 0; else emptyState">
        <div
          *ngFor="let item of breakdownLista()"
          class="category-item-card"
          [class.selected]="store.selectedCategory() === item.categoria"
          (click)="store.selecionarCategoria(item.categoria)"
        >
          <div class="category-top-row">
            <div class="cat-identity">
              <div class="cat-icon-box" [style.background-color]="item.cor + '22'" [style.color]="item.cor">
                <span class="material-symbols-rounded">{{ item.icone || 'label' }}</span>
              </div>
              <div class="cat-names">
                <span class="cat-name">{{ item.categoria }}</span>
                <span class="cat-events-count">{{ item.quantidadeEventos }} evento(s) projetado(s)</span>
              </div>
            </div>

            <div class="cat-values">
              <span class="cat-amount" [class.receita-text]="item.tipo === 'RECEITA'" [class.despesa-text]="item.tipo === 'DESPESA'">
                {{ item.tipo === 'RECEITA' ? '+' : '-' }} R$ {{ item.valorTotal | number : '1.2-2' }}
              </span>
              <span *ngIf="item.percentual > 0" class="cat-percent-badge" [style.background-color]="item.cor + '20'" [style.color]="item.cor">
                {{ item.percentual }}%
              </span>
            </div>
          </div>

          <!-- Barra de Progresso / Percentual -->
          <div class="cat-progress-track">
            <div
              class="cat-progress-fill"
              [style.width.%]="item.percentual > 0 ? item.percentual : 100"
              [style.background-color]="item.cor"
            ></div>
          </div>

          <!-- Detalhe de Eventos Inclusos (accordion leve) -->
          <div *ngIf="store.selectedCategory() === item.categoria && item.itens" class="category-expanded-events">
            <h4 class="expanded-title">Fontes e Eventos Relacionados:</h4>
            <div class="events-mini-list">
              <div *ngFor="let ev of item.itens" class="mini-event-row">
                <div class="mini-ev-info">
                  <span class="mini-ev-desc">{{ ev.descricao }}</span>
                  <span class="mini-ev-fonte">Fonte: {{ ev.fonte }} • {{ ev.competencia }}</span>
                </div>
                <span class="mini-ev-val" [class.receita-text]="ev.tipo === 'RECEITA'">
                  {{ ev.tipo === 'RECEITA' ? '+' : '-' }} R$ {{ ev.valor | number : '1.2-2' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ng-template #emptyState>
        <div class="empty-breakdown">
          <span class="material-symbols-rounded empty-icon">filter_alt_off</span>
          <p>Nenhum item encontrado para os filtros selecionados.</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .breakdown-card {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .breakdown-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      flex-wrap: wrap;
    }

    .breakdown-title {
      font-family: var(--font-primary, 'Outfit', sans-serif);
      font-size: 20px;
      font-weight: 700;
      color: var(--color-text-primary, #ffffff);
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .header-icon {
      color: var(--color-champagne-main, #C9A74E);
      font-size: 24px;
    }

    .breakdown-subtitle {
      font-size: 13px;
      color: var(--color-text-tertiary, #9c8e7c);
      margin: 4px 0 0 0;
    }

    .filter-pills {
      display: flex;
      gap: 6px;
      background: rgba(255, 255, 255, 0.05);
      padding: 4px;
      border-radius: 12px;
      border: 1px solid rgba(216, 184, 126, 0.15);
    }

    .pill-btn {
      background: transparent;
      border: none;
      color: rgba(235, 217, 182, 0.6);
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        color: #ffffff;
      }

      &.active {
        background: var(--color-gold-gradient, linear-gradient(135deg, #d8b87e 0%, #c9a74e 100%));
        color: #2b0b10;
        box-shadow: 0 2px 10px rgba(216, 184, 126, 0.3);
      }

      &.receita.active {
        background: #10b981;
        color: #ffffff;
      }

      &.despesa.active {
        background: #A13D63;
        color: #ffffff;
      }
    }

    .active-category-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(201, 167, 78, 0.12);
      border: 1px solid rgba(201, 167, 78, 0.3);
      padding: 10px 16px;
      border-radius: 10px;
      color: #ebd9b6;
      font-size: 13px;
    }

    .clear-category-btn {
      background: transparent;
      border: none;
      color: #C9A74E;
      font-weight: 700;
      font-size: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;

      span { font-size: 16px; }
      &:hover { text-decoration: underline; }
    }

    .categories-grid {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .category-item-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(216, 184, 126, 0.15);
      border-radius: 12px;
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

      &:hover {
        background: rgba(255, 255, 255, 0.06);
        border-color: rgba(216, 184, 126, 0.35);
        transform: translateY(-1px);
      }

      &.selected {
        border-color: #C9A74E;
        background: rgba(201, 167, 78, 0.08);
        box-shadow: 0 4px 20px rgba(201, 167, 78, 0.15);
      }
    }

    .category-top-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .cat-identity {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .cat-icon-box {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;

      span { font-size: 22px; }
    }

    .cat-names {
      display: flex;
      flex-direction: column;
    }

    .cat-name {
      font-size: 15px;
      font-weight: 700;
      color: #ffffff;
    }

    .cat-events-count {
      font-size: 11px;
      color: #9c8e7c;
    }

    .cat-values {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .cat-amount {
      font-family: var(--font-mono, 'Space Grotesk', monospace);
      font-size: 16px;
      font-weight: 700;
      color: #ffffff;

      &.receita-text { color: #34d399; }
      &.despesa-text { color: #f87171; }
    }

    .cat-percent-badge {
      font-size: 11px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 8px;
    }

    .cat-progress-track {
      height: 6px;
      background: rgba(255, 255, 255, 0.06);
      border-radius: 3px;
      overflow: hidden;
    }

    .cat-progress-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.4s ease;
    }

    .category-expanded-events {
      margin-top: 10px;
      padding-top: 12px;
      border-top: 1px solid rgba(216, 184, 126, 0.15);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .expanded-title {
      font-size: 12px;
      font-weight: 700;
      color: #C9A74E;
      margin: 0;
    }

    .events-mini-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .mini-event-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 10px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 6px;
    }

    .mini-ev-info {
      display: flex;
      flex-direction: column;
    }

    .mini-ev-desc {
      font-size: 12px;
      font-weight: 600;
      color: #ffffff;
    }

    .mini-ev-fonte {
      font-size: 10px;
      color: #9c8e7c;
    }

    .mini-ev-val {
      font-family: var(--font-mono, 'Space Grotesk', monospace);
      font-size: 12px;
      font-weight: 700;
      color: #f87171;

      &.receita-text { color: #34d399; }
    }

    .empty-breakdown {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      color: #9c8e7c;

      .empty-icon { font-size: 40px; margin-bottom: 8px; opacity: 0.5; }
      p { margin: 0; font-size: 14px; }
    }
  `],
})
export class ExplanationBreakdownComponent {
  readonly store = inject(PlanningStore);
  filtrosTipo: 'TODOS' | 'RECEITA' | 'DESPESA' = 'TODOS';

  setFiltroTipo(tipo: 'TODOS' | 'RECEITA' | 'DESPESA'): void {
    this.filtrosTipo = tipo;
  }

  breakdownLista(): ExplanationBreakdown[] {
    const lista = this.store.breakdownFiltrado();
    if (this.filtrosTipo === 'TODOS') return lista;
    return lista.filter((item) => item.tipo === this.filtrosTipo);
  }
}
