import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { FluxoCaixaStore } from '../store/fluxo-caixa.store';
import { CarteirasStore } from '../../carteiras/store/carteiras.store';
import { CategoriasStore } from '../../categorias/store/categorias.store';
import { OverlayService } from '../../../core/services/overlay.service';
import { ToastService } from '../../../core/services/toast.service';
import { StatusLiquidacao } from '../../../core/models/lancamento.models';

@Component({
  selector: 'app-formulario-despesa',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  template: `
    <div class="form-container">
      <div class="form-header">
        <h3 class="form-title">
          <span class="material-symbols-rounded icon-despesa">arrow_downward</span>
          Nova Despesa
        </h3>
        <button class="close-btn" (click)="fechar()">
          <span class="material-symbols-rounded">close</span>
        </button>
      </div>

      <form (ngSubmit)="salvar()" class="form-body">
        <div class="form-group">
          <label for="descricao">Descrição</label>
          <input
            id="descricao"
            type="text"
            [(ngModel)]="descricao"
            name="descricao"
            placeholder="Ex: Mercado, Aluguel, Luz, Internet..."
            required
            class="input-field" />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="valor">Valor (R$)</label>
            <input
              id="valor"
              type="number"
              step="0.01"
              [(ngModel)]="valor"
              name="valor"
              placeholder="0,00"
              required
              class="input-field" />
          </div>

          <div class="form-group">
            <label for="dataVencimento">Vencimento</label>
            <input
              id="dataVencimento"
              type="date"
              [(ngModel)]="dataVencimento"
              name="dataVencimento"
              required
              class="input-field" />
          </div>
        </div>

        <div class="form-group">
          <label for="categoriaId">Categoria</label>
          <select
            id="categoriaId"
            [(ngModel)]="categoriaId"
            name="categoriaId"
            required
            class="input-field">
            <option value="">Selecione uma categoria...</option>
            @for (cat of categoriasStore.categoriasDespesa(); track cat.id) {
              <option [value]="cat.id">{{ cat.nome }}</option>
            }
          </select>
        </div>

        <div class="form-group">
          <label for="carteiraId">Conta Pagadora</label>
          <select
            id="carteiraId"
            [(ngModel)]="carteiraId"
            name="carteiraId"
            class="input-field">
            <option value="">Selecione uma conta...</option>
            @for (c of carteirasStore.carteiras(); track c.id) {
              <option [value]="c.id">{{ c.nome }} ({{ c.tipo }})</option>
            }
          </select>
        </div>

        <div class="form-group">
          <label>Status de Liquidação</label>
          <div class="segmented-control">
            <button
              type="button"
              [class.active]="statusLiquidacao === 'PENDENTE'"
              (click)="statusLiquidacao = 'PENDENTE'">
              ⏳ Pendente
            </button>
            <button
              type="button"
              [class.active]="statusLiquidacao === 'LIQUIDADO'"
              (click)="statusLiquidacao = 'LIQUIDADO'">
              ✅ Paga
            </button>
          </div>
        </div>

        <div class="form-actions">
          <app-button
            type="submit"
            variant="primary-bordo"
            size="lg"
            [loading]="salvando()"
            icon="check">
            Salvar Despesa
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

        .icon-despesa {
          color: #c62828;
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

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      min-width: 0;

      @media (max-width: 360px) {
        grid-template-columns: 1fr;
      }
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 0;
      width: 100%;
      box-sizing: border-box;

      label {
        font-size: 11px;
        font-weight: 700;
        color: var(--color-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        display: block;
      }

      .input-field {
        width: 100%;
        box-sizing: border-box;
        min-width: 0;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(216, 184, 126, 0.25);
        border-radius: var(--radius-md);
        padding: 12px 14px;
        color: var(--color-text-primary);
        font-family: var(--font-primary);
        font-size: 14px;
        outline: none;
        color-scheme: dark;

        &:focus {
          border-color: var(--color-champagne-main);
          background: rgba(255, 255, 255, 0.08);
        }
      }

      select.input-field {
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        background-color: rgba(24, 7, 10, 0.95);
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='%23d8b87e'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 12px center;
        background-size: 20px;
        padding-right: 36px;
        color: #ffffff;
        cursor: pointer;
      }

      select.input-field option {
        background-color: #1a060a;
        color: #ebd9b6;
        padding: 12px;
        font-size: 14px;
      }
    }

    .segmented-control {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      background: rgba(0, 0, 0, 0.2);
      padding: 4px;
      border-radius: var(--radius-md);

      button {
        padding: 10px;
        border: none;
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--color-text-secondary);
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

    .form-actions {
      margin-top: 8px;
      display: flex;
      flex-direction: column;
    }
  `],
})
export class FormularioDespesaComponent implements OnInit {
  descricao = '';
  valor: number | null = null;
  dataVencimento = new Date().toISOString().substring(0, 10);
  categoriaId = '';
  carteiraId = '';
  statusLiquidacao: StatusLiquidacao = 'PENDENTE';
  salvando = signal<boolean>(false);

  constructor(
    readonly fluxoStore: FluxoCaixaStore,
    readonly carteirasStore: CarteirasStore,
    readonly categoriasStore: CategoriasStore,
    private readonly overlay: OverlayService,
    private readonly toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.carteirasStore.carregarCarteiras();
    this.categoriasStore.carregarCategorias();
  }

  async salvar(): Promise<void> {
    if (!this.descricao || !this.valor || this.valor <= 0) {
      this.toast.showWarning('Informe a descrição e um valor válido.');
      return;
    }

    if (!this.categoriaId) {
      this.toast.showWarning('Selecione uma categoria para a despesa.');
      return;
    }

    this.salvando.set(true);

    const ok = await this.fluxoStore.criarDespesa({
      descricao: this.descricao,
      valor: this.valor,
      dataVencimento: this.dataVencimento,
      categoriaId: this.categoriaId,
      carteiraId: this.carteiraId || undefined,
      statusLiquidacao: this.statusLiquidacao,
    });

    this.salvando.set(false);

    if (ok) {
      this.toast.showSuccess('Despesa registrada com sucesso!');
      this.overlay.close(true);
    }
  }

  fechar(): void {
    this.overlay.close(false);
  }
}
