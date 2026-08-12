import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoriasStore } from '../store/categorias.store';
import { OverlayService } from '../../../core/services/overlay.service';
import { ToastService } from '../../../core/services/toast.service';
import { FormularioCategoriaComponent } from '../components/formulario-categoria.component';
import { Categoria } from '../../../core/models/lancamento.models';

type FiltroTipo = 'TODAS' | 'RECEITAS' | 'DESPESAS';

@Component({
  selector: 'app-categorias-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <!-- Banner Hero -->
      <section class="hero-banner">
        <div class="hero-header">
          <div class="hero-icon-box">
            <span class="material-symbols-rounded">category</span>
          </div>
          <div class="hero-titles">
            <h1 class="hero-title">Categorias Financeiras</h1>
            <p class="hero-subtitle">Organize suas receitas e despesas com identificadores visuais</p>
          </div>
        </div>

        <div class="hero-stats">
          <div class="stat-pill">
            <span class="stat-value">{{ store.categorias().length }}</span>
            <span class="stat-label">Total</span>
          </div>
          <div class="stat-pill">
            <span class="stat-value">{{ store.categoriasSistema().length }}</span>
            <span class="stat-label">Padrão Sistema</span>
          </div>
          <div class="stat-pill">
            <span class="stat-value">{{ store.categoriasCustomizadas().length }}</span>
            <span class="stat-label">Personalizadas</span>
          </div>
        </div>
      </section>

      <!-- Filtro por Tipo -->
      <div class="filter-section">
        <div class="segmented-control">
          <button
            type="button"
            [class.active]="filtro() === 'TODAS'"
            (click)="filtro.set('TODAS')">
            Todas ({{ store.categorias().length }})
          </button>
          <button
            type="button"
            [class.active]="filtro() === 'DESPESAS'"
            (click)="filtro.set('DESPESAS')">
            🔴 Despesas ({{ store.categoriasDespesa().length }})
          </button>
          <button
            type="button"
            [class.active]="filtro() === 'RECEITAS'"
            (click)="filtro.set('RECEITAS')">
            🟢 Receitas ({{ store.categoriasReceita().length }})
          </button>
        </div>

        <button class="add-cat-btn" (click)="abrirFormularioCriacao()">
          <span class="material-symbols-rounded">add</span>
          <span>Nova Categoria</span>
        </button>
      </div>

      <!-- Lista de Categorias -->
      <main class="content-body">
        @if (store.carregando()) {
          <div class="loading-state">
            <span class="material-symbols-rounded spinner">progress_activity</span>
            <p>Carregando categorias...</p>
          </div>
        } @else if (categoriasExibidas().length === 0) {
          <div class="empty-state">
            <span class="material-symbols-rounded empty-icon">folder_off</span>
            <h3>Nenhuma categoria encontrada</h3>
            <p>Clique em "+ Nova Categoria" para cadastrar sua primeira categoria personalizada.</p>
          </div>
        } @else {
          <div class="categories-grid">
            @for (cat of categoriasExibidas(); track cat.id) {
              <div class="category-card" [style.border-left-color]="cat.cor || '#d8b87e'">
                <div class="card-icon-box" [style.background]="(cat.cor || '#d8b87e') + '22'" [style.color]="cat.cor || '#d8b87e'">
                  <span class="material-symbols-rounded">{{ cat.icone || 'category' }}</span>
                </div>

                <div class="card-info">
                  <div class="card-header-row">
                    <h4 class="cat-name">{{ cat.nome }}</h4>
                    @if (isSistema(cat)) {
                      <span class="badge-system" title="Categoria padrão do sistema (Somente Leitura)">Padrão</span>
                    }
                  </div>
                  <span class="cat-type-tag" [class.receita]="cat.tipo === 'RECEITA'" [class.despesa]="cat.tipo === 'DESPESA'">
                    {{ cat.tipo === 'AMBAS' ? 'Receitas & Despesas' : cat.tipo }}
                  </span>
                </div>

                <!-- Botões de Ação (Apenas para categorias customizadas) -->
                <div class="card-actions">
                  @if (!isSistema(cat)) {
                    <button class="action-btn edit-btn" (click)="editarCategoria(cat)" title="Editar Categoria">
                      <span class="material-symbols-rounded">edit</span>
                    </button>
                    <button class="action-btn delete-btn" (click)="confirmarExclusao(cat)" title="Excluir Categoria">
                      <span class="material-symbols-rounded">delete</span>
                    </button>
                  } @else {
                    <span class="lock-icon" title="Protegida contra alteração">
                      <span class="material-symbols-rounded">lock</span>
                    </span>
                  }
                </div>
              </div>
            }
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 1000px;
      margin: 0 auto;
      box-sizing: border-box;
    }

    .hero-banner {
      background: linear-gradient(135deg, rgba(74, 18, 26, 0.95) 0%, rgba(24, 7, 10, 0.98) 100%);
      border: 1px solid rgba(216, 184, 126, 0.3);
      border-radius: var(--radius-lg, 16px);
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.4);
    }

    .hero-header {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .hero-icon-box {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: var(--color-primary-gradient, linear-gradient(135deg, #A13D63, #3D0D15));
      border: 1.5px solid var(--color-champagne-main, #C9A74E);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      flex-shrink: 0;

      span { font-size: 24px; }
    }

    .hero-title {
      font-size: 20px;
      font-weight: 800;
      color: var(--color-champagne-light, #ebd9b6);
      margin: 0;
    }

    .hero-subtitle {
      font-size: 12px;
      color: rgba(235, 217, 182, 0.7);
      margin: 2px 0 0 0;
    }

    .hero-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 10px;
    }

    .stat-pill {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(216, 184, 126, 0.2);
      border-radius: var(--radius-md, 12px);
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      align-items: center;

      .stat-value {
        font-size: 18px;
        font-weight: 800;
        color: var(--color-champagne-main, #d8b87e);
      }

      .stat-label {
        font-size: 10px;
        font-weight: 700;
        color: rgba(235, 217, 182, 0.6);
        text-transform: uppercase;
      }
    }

    .filter-section {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }

    .segmented-control {
      display: flex;
      gap: 4px;
      background: rgba(0, 0, 0, 0.2);
      padding: 4px;
      border-radius: var(--radius-md, 12px);

      button {
        padding: 8px 14px;
        border: none;
        border-radius: var(--radius-sm, 8px);
        background: transparent;
        color: var(--color-text-secondary, #a1a1aa);
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;

        &.active {
          background: var(--color-primary-gradient, linear-gradient(135deg, #A13D63, #3D0D15));
          color: #ffffff;
          box-shadow: var(--shadow-sm);
        }
      }
    }

    .add-cat-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background: var(--color-primary-gradient, linear-gradient(135deg, #A13D63, #3D0D15));
      border: 1px solid var(--color-champagne-main, #C9A74E);
      color: #ffffff;
      padding: 10px 16px;
      border-radius: var(--radius-md, 12px);
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: var(--shadow-md);
      transition: transform 0.2s ease;

      &:hover {
        transform: scale(1.03);
      }

      span { font-size: 18px; }
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 12px;
    }

    .category-card {
      background: rgba(24, 7, 10, 0.85);
      border: 1px solid rgba(216, 184, 126, 0.2);
      border-left: 5px solid #d8b87e;
      border-radius: var(--radius-md, 12px);
      padding: 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      transition: transform 0.2s ease, border-color 0.2s ease;

      &:hover {
        border-color: rgba(216, 184, 126, 0.5);
      }
    }

    .card-icon-box {
      width: 42px;
      height: 42px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      span { font-size: 22px; }
    }

    .card-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .card-header-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .cat-name {
      font-size: 14px;
      font-weight: 700;
      color: var(--color-text-primary, #ffffff);
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .badge-system {
      background: rgba(216, 184, 126, 0.2);
      border: 1px solid rgba(216, 184, 126, 0.4);
      color: var(--color-champagne-light, #ebd9b6);
      font-size: 9px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 99px;
      text-transform: uppercase;
    }

    .cat-type-tag {
      font-size: 11px;
      font-weight: 600;
      color: var(--color-text-secondary, #a1a1aa);

      &.receita { color: #10b981; }
      &.despesa { color: #ef4444; }
    }

    .card-actions {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }

    .action-btn {
      background: none;
      border: none;
      color: var(--color-text-secondary, #a1a1aa);
      cursor: pointer;
      padding: 6px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s ease, color 0.2s ease;

      span { font-size: 18px; }

      &.edit-btn:hover {
        background: rgba(59, 130, 246, 0.15);
        color: #3b82f6;
      }

      &.delete-btn:hover {
        background: rgba(239, 68, 68, 0.15);
        color: #ef4444;
      }
    }

    .lock-icon {
      color: rgba(235, 217, 182, 0.3);
      padding: 6px;
      display: flex;
      align-items: center;
      justify-content: center;

      span { font-size: 18px; }
    }

    .loading-state, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
      color: var(--color-text-secondary, #a1a1aa);

      .spinner {
        font-size: 36px;
        animation: spin 1s linear infinite;
        color: var(--color-champagne-main, #d8b87e);
        margin-bottom: 12px;
      }

      .empty-icon {
        font-size: 48px;
        color: rgba(216, 184, 126, 0.4);
        margin-bottom: 12px;
      }
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }
  `],
})
export class CategoriasPage implements OnInit {
  readonly filtro = signal<FiltroTipo>('TODAS');

  readonly categoriasExibidas = computed(() => {
    const f = this.filtro();
    if (f === 'DESPESAS') return this.store.categoriasDespesa();
    if (f === 'RECEITAS') return this.store.categoriasReceita();
    return this.store.categorias();
  });

  constructor(
    readonly store: CategoriasStore,
    private readonly overlay: OverlayService,
    private readonly toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.store.carregarCategorias();
  }

  isSistema(cat: Categoria): boolean {
    return (cat as any).sistema === true;
  }

  abrirFormularioCriacao(): void {
    this.overlay.openBottomSheet({ component: FormularioCategoriaComponent });
  }

  editarCategoria(cat: Categoria): void {
    if (this.isSistema(cat)) return;
    this.overlay.openBottomSheet({
      component: FormularioCategoriaComponent,
      data: cat,
    });
  }

  async confirmarExclusao(cat: Categoria): Promise<void> {
    if (this.isSistema(cat)) return;

    const confirmou = confirm(
      `Deseja realmente excluir a categoria "${cat.nome}"?`
    );
    if (!confirmou) return;

    const ok = await this.store.removerCategoria(cat.id);
    if (ok) {
      this.toast.showSuccess('Categoria excluída com sucesso.');
    } else if (this.store.erro()) {
      this.toast.showError(this.store.erro()!);
    }
  }
}
