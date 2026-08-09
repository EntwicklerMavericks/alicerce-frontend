import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CartoesStore } from '../store/cartoes.store';
import { OverlayService } from '../../../core/services/overlay.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-formulario-compra-cartao',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  template: `
    <div class="form-container">
      <div class="form-header">
        <h3 class="form-title">
          <span class="material-symbols-rounded icon-gold">shopping_cart</span>
          Nova Compra no Cartão
        </h3>
        <button class="close-btn" (click)="fechar()">
          <span class="material-symbols-rounded">close</span>
        </button>
      </div>

      <form (ngSubmit)="salvar()" class="form-body">
        <div class="form-group">
          <label for="cartaoId">Cartão de Crédito</label>
          <select id="cartaoId" [(ngModel)]="cartaoId" name="cartaoId" class="input-field" required>
            <option value="">Selecione o cartão...</option>
            @for (c of cartoesStore.cartoes(); track c.id) {
              <option [value]="c.id">{{ c.nome }} (Limite Disp: R$ {{ c.limiteDisponivel | number:'1.2-2' }})</option>
            }
          </select>
        </div>

        <div class="form-group">
          <label for="descricao">Descrição da Compra</label>
          <input
            id="descricao"
            type="text"
            [(ngModel)]="descricao"
            name="descricao"
            placeholder="Ex: Notebook, Supermercado, Eletrônicos..."
            required
            class="input-field" />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="valorTotal">Valor Total (R$)</label>
            <input
              id="valorTotal"
              type="number"
              step="0.01"
              [(ngModel)]="valorTotal"
              name="valorTotal"
              placeholder="0,00"
              required
              class="input-field" />
          </div>

          <div class="form-group">
            <label for="qtdParcelas">Parcelas (x)</label>
            <select id="qtdParcelas" [(ngModel)]="qtdParcelas" name="qtdParcelas" class="input-field">
              <option [value]="1">À vista (1x)</option>
              <option [value]="2">2x sem juros</option>
              <option [value]="3">3x sem juros</option>
              <option [value]="4">4x sem juros</option>
              <option [value]="5">5x sem juros</option>
              <option [value]="6">6x sem juros</option>
              <option [value]="10">10x sem juros</option>
              <option [value]="12">12x sem juros</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="dataCompra">Data da Compra</label>
            <input
              id="dataCompra"
              type="date"
              [(ngModel)]="dataCompra"
              name="dataCompra"
              required
              class="input-field" />
          </div>

          <div class="form-group">
            <label for="categoriaId">Categoria</label>
            <select id="categoriaId" [(ngModel)]="categoriaId" name="categoriaId" class="input-field">
              <option value="cat-compra-geral">Geral / Outros</option>
              <option value="cat-mercado">Mercado</option>
              <option value="cat-eletronicos">Eletrônicos</option>
              <option value="cat-vestuario">Vestuário</option>
            </select>
          </div>
        </div>

        <div class="form-actions">
          <app-button
            type="submit"
            variant="primary-gold"
            size="lg"
            [loading]="salvando()"
            icon="check">
            Registrar Compra
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

        .icon-gold {
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

    .form-actions {
      margin-top: 8px;
      display: flex;
      flex-direction: column;
    }
  `],
})
export class FormularioCompraCartaoComponent implements OnInit {
  cartaoId = '';
  descricao = '';
  valorTotal: number | null = null;
  qtdParcelas = 1;
  dataCompra = new Date().toISOString().substring(0, 10);
  categoriaId = 'cat-compra-geral';
  salvando = signal<boolean>(false);

  constructor(
    readonly cartoesStore: CartoesStore,
    private readonly overlay: OverlayService,
    private readonly toast: ToastService,
  ) {}

  ngOnInit(): void {
    if (this.cartoesStore.cartaoSelecionado()) {
      this.cartaoId = this.cartoesStore.cartaoSelecionado()!.id;
    }
  }

  async salvar(): Promise<void> {
    if (!this.cartaoId || !this.descricao || !this.valorTotal || this.valorTotal <= 0) {
      this.toast.showWarning('Informe o cartão, a descrição e o valor da compra.');
      return;
    }

    this.salvando.set(true);

    const ok = await this.cartoesStore.registrarCompra({
      cartaoId: this.cartaoId,
      categoriaId: this.categoriaId,
      descricao: this.descricao,
      valorTotal: this.valorTotal,
      qtdParcelas: Number(this.qtdParcelas),
      dataCompra: this.dataCompra,
    });

    this.salvando.set(false);

    if (ok) {
      this.toast.showSuccess('Compra parcelada registrada nas faturas com sucesso!');
      this.overlay.close(true);
    }
  }

  fechar(): void {
    this.overlay.close(false);
  }
}
