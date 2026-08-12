import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CategoriasStore } from '../store/categorias.store';
import { OverlayService } from '../../../core/services/overlay.service';
import { ToastService } from '../../../core/services/toast.service';
import { Categoria } from '../../../core/models/lancamento.models';

@Component({
  selector: 'app-formulario-categoria',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  template: `
    <div class="form-container">
      <div class="form-header">
        <h3 class="form-title">
          <span class="material-symbols-rounded icon-cat">category</span>
          {{ categoriaEdicao ? 'Editar Categoria' : 'Nova Categoria' }}
        </h3>
        <button class="close-btn" (click)="fechar()">
          <span class="material-symbols-rounded">close</span>
        </button>
      </div>

      <form (ngSubmit)="salvar()" class="form-body">
        <!-- Nome -->
        <div class="form-group">
          <label for="nome">Nome da Categoria</label>
          <input
            id="nome"
            type="text"
            [(ngModel)]="nome"
            name="nome"
            placeholder="Ex: Alimentação, Lazer, Educação..."
            required
            class="input-field" />
        </div>

        <!-- Tipo -->
        <div class="form-group">
          <label>Tipo de Lançamento</label>
          <div class="segmented-control">
            <button
              type="button"
              [class.active]="tipo === 'DESPESA'"
              (click)="tipo = 'DESPESA'">
              🔴 Despesa
            </button>
            <button
              type="button"
              [class.active]="tipo === 'RECEITA'"
              (click)="tipo = 'RECEITA'">
              🟢 Receita
            </button>
            <button
              type="button"
              [class.active]="tipo === 'AMBAS'"
              (click)="tipo = 'AMBAS'">
              🟣 Ambas
            </button>
          </div>
        </div>

        <!-- Seleção de Ícone (Grid Material Icons) -->
        <div class="form-group">
          <label>Ícone Representativo</label>
          <div class="icon-grid">
            @for (iconName of iconesDisponiveis; track iconName) {
              <button
                type="button"
                class="icon-option"
                [class.selected]="icone === iconName"
                [style.color]="icone === iconName ? '#2b0b10' : cor"
                [style.background]="icone === iconName ? cor : 'rgba(255,255,255,0.05)'"
                (click)="icone = iconName">
                <span class="material-symbols-rounded">{{ iconName }}</span>
              </button>
            }
          </div>
        </div>

        <!-- Seleção de Cor (Palette Picker) -->
        <div class="form-group">
          <label>Cor de Identificação</label>
          <div class="color-palette">
            @for (c of coresDisponiveis; track c) {
              <button
                type="button"
                class="color-option"
                [class.selected]="cor === c"
                [style.background]="c"
                (click)="cor = c">
                @if (cor === c) {
                  <span class="material-symbols-rounded check-icon">check</span>
                }
              </button>
            }
          </div>
        </div>

        <div class="form-actions">
          <app-button
            type="submit"
            variant="primary-gold"
            size="lg"
            [loading]="store.criando() || store.atualizando()"
            icon="check">
            {{ categoriaEdicao ? 'Salvar Alterações' : 'Criar Categoria' }}
          </app-button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-container {
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 16px;
      width: 100%;
      box-sizing: border-box;
      overflow-x: hidden;
    }

    .form-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .form-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 18px;
        font-weight: 700;
        color: var(--color-champagne-light);

        .icon-cat {
          color: var(--color-champagne-main);
        }
      }

      .close-btn {
        background: none;
        border: none;
        color: var(--color-text-secondary);
        cursor: pointer;
      }
    }

    .form-body {
      display: flex;
      flex-direction: column;
      gap: 16px;
      width: 100%;
      box-sizing: border-box;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 100%;

      label {
        font-size: 11px;
        font-weight: 700;
        color: var(--color-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .input-field {
        width: 100%;
        box-sizing: border-box;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(216, 184, 126, 0.25);
        border-radius: var(--radius-md);
        padding: 12px 14px;
        color: var(--color-text-primary);
        font-size: 14px;
        outline: none;

        &:focus {
          border-color: var(--color-champagne-main);
          background: rgba(255, 255, 255, 0.08);
        }
      }
    }

    .segmented-control {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 6px;
      background: rgba(0, 0, 0, 0.2);
      padding: 4px;
      border-radius: var(--radius-md);

      button {
        padding: 10px 4px;
        border: none;
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--color-text-secondary);
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;

        &.active {
          background: var(--color-primary-gradient);
          color: #ffffff;
          box-shadow: var(--shadow-sm);
        }
      }
    }

    .icon-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 8px;

      .icon-option {
        height: 42px;
        border-radius: var(--radius-sm);
        border: 1px solid rgba(216, 184, 126, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;

        span {
          font-size: 22px;
        }

        &.selected {
          border-color: var(--color-champagne-main);
          box-shadow: var(--shadow-sm);
          transform: scale(1.05);
        }
      }
    }

    .color-palette {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;

      .color-option {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        border: 2px solid transparent;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease;

        .check-icon {
          font-size: 18px;
          color: #ffffff;
          text-shadow: 0 1px 2px rgba(0,0,0,0.6);
        }

        &.selected {
          border-color: #ffffff;
          transform: scale(1.15);
          box-shadow: 0 0 10px rgba(255,255,255,0.4);
        }
      }
    }

    .form-actions {
      margin-top: 8px;
      display: flex;
      flex-direction: column;
    }
  `],
})
export class FormularioCategoriaComponent implements OnInit {
  @Input() categoriaEdicao?: Categoria;

  nome = '';
  tipo: 'RECEITA' | 'DESPESA' | 'AMBAS' = 'DESPESA';
  icone = 'category';
  cor = '#ef4444';

  readonly iconesDisponiveis = [
    'restaurant', 'home', 'directions_car', 'shopping_cart', 'payments',
    'trending_up', 'flight', 'sports_esports', 'medical_services', 'school',
    'build', 'pets', 'fitness_center', 'celebration', 'work', 'category'
  ];

  readonly coresDisponiveis = [
    '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#d8b87e'
  ];

  constructor(
    readonly store: CategoriasStore,
    private readonly overlay: OverlayService,
    private readonly toast: ToastService,
  ) {}

  ngOnInit(): void {
    const data = this.overlay.activeOverlay()?.data as Categoria | undefined;
    if (data) {
      this.categoriaEdicao = data;
      this.nome = data.nome;
      this.tipo = data.tipo;
      this.icone = data.icone || 'category';
      this.cor = data.cor || '#ef4444';
    } else if (this.categoriaEdicao) {
      this.nome = this.categoriaEdicao.nome;
      this.tipo = this.categoriaEdicao.tipo;
      this.icone = this.categoriaEdicao.icone || 'category';
      this.cor = this.categoriaEdicao.cor || '#ef4444';
    }
  }

  async salvar(): Promise<void> {
    const nomeLimpo = this.nome.trim();
    if (!nomeLimpo) {
      this.toast.showWarning('Informe o nome da categoria.');
      return;
    }

    let ok = false;
    if (this.categoriaEdicao) {
      ok = await this.store.atualizarCategoria(this.categoriaEdicao.id, {
        nome: nomeLimpo,
        tipo: this.tipo,
        icone: this.icone,
        cor: this.cor,
      });
    } else {
      ok = await this.store.criarCategoria({
        nome: nomeLimpo,
        tipo: this.tipo,
        icone: this.icone,
        cor: this.cor,
      });
    }

    if (ok) {
      this.toast.showSuccess(
        this.categoriaEdicao
          ? 'Categoria atualizada com sucesso!'
          : 'Categoria criada com sucesso!'
      );
      this.overlay.close(true);
    } else if (this.store.erro()) {
      this.toast.showError(this.store.erro()!);
    }
  }

  fechar(): void {
    this.overlay.close(false);
  }
}
