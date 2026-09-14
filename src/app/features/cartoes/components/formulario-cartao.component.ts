import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CartoesStore } from '../store/cartoes.store';
import { OverlayService } from '../../../core/services/overlay.service';
import { ToastService } from '../../../core/services/toast.service';

import { InputComponent } from '../../../shared/components/input/input.component';
import { DayPickerComponent } from '../../../shared/components/day-picker/day-picker.component';
import { ColorPickerComponent } from '../../../shared/components/color-picker/color-picker.component';

@Component({
  selector: 'app-formulario-cartao',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, InputComponent, DayPickerComponent, ColorPickerComponent],
  template: `
    <div class="form-container">
      <div class="form-header">
        <h3 class="form-title">
          <span class="material-symbols-rounded icon-gold">credit_card</span>
          Novo Cartão de Crédito
        </h3>
        <button class="close-btn" (click)="fechar()">
          <span class="material-symbols-rounded">close</span>
        </button>
      </div>

      <form (ngSubmit)="salvar()" class="form-body">
        <div class="form-group">
          <label for="nome">Nome do Cartão</label>
          <input
            id="nome"
            type="text"
            [(ngModel)]="nome"
            name="nome"
            placeholder="Ex: Nubank UV, XP Visa Infinite..."
            required
            class="input-field" />
        </div>

        <div class="form-row">
          <app-input
            id="limiteTotal"
            label="Limite Total (R$)"
            type="currency"
            [(ngModel)]="limiteTotal"
            name="limiteTotal"
            placeholder="R$ 0,00"
            [required]="true">
          </app-input>

          <div class="form-group">
            <label for="bandeira">Bandeira</label>
            <select id="bandeira" [(ngModel)]="bandeira" name="bandeira" class="input-field">
              <option value="MASTERCARD">Mastercard</option>
              <option value="VISA">Visa</option>
              <option value="ELO">Elo</option>
              <option value="AMEX">Amex</option>
              <option value="OUTRA">Outra</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <app-day-picker
            id="diaFechamento"
            label="Dia Fechamento"
            [(ngModel)]="diaFechamento"
            name="diaFechamento"
            [required]="true">
          </app-day-picker>

          <app-day-picker
            id="diaVencimento"
            label="Dia Vencimento"
            [(ngModel)]="diaVencimento"
            name="diaVencimento"
            [required]="true">
          </app-day-picker>
        </div>

        <app-color-picker
          id="cor"
          label="Cor do Card"
          [(ngModel)]="cor"
          name="cor"
          [cardName]="nome">
        </app-color-picker>

        <div class="form-actions">
          <app-button
            type="submit"
            variant="primary-gold"
            size="lg"
            [loading]="salvando()"
            icon="check">
            Cadastrar Cartão
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

      .input-color-picker {
        width: 100%;
        height: 44px;
        border: 1px solid rgba(216, 184, 126, 0.25);
        border-radius: var(--radius-md);
        background: transparent;
        cursor: pointer;
      }
    }

    .form-actions {
      margin-top: 8px;
      display: flex;
      flex-direction: column;
    }
  `],
})
export class FormularioCartaoComponent {
  nome = '';
  limiteTotal: number | null = null;
  bandeira = 'MASTERCARD';
  diaFechamento = 25;
  diaVencimento = 5;
  cor = '#820ad1';
  salvando = signal<boolean>(false);

  constructor(
    readonly cartoesStore: CartoesStore,
    private readonly overlay: OverlayService,
    private readonly toast: ToastService,
  ) {}

  async salvar(): Promise<void> {
    if (!this.nome || !this.limiteTotal || this.limiteTotal <= 0) {
      this.toast.showWarning('Informe o nome e um limite válido.');
      return;
    }

    this.salvando.set(true);

    const ok = await this.cartoesStore.criarCartao({
      nome: this.nome,
      limiteTotal: this.limiteTotal,
      bandeira: this.bandeira,
      diaFechamento: Number(this.diaFechamento),
      diaVencimento: Number(this.diaVencimento),
      cor: this.cor,
    });

    this.salvando.set(false);

    if (ok) {
      this.toast.showSuccess('Cartão de crédito cadastrado com sucesso!');
      this.overlay.close(true);
    }
  }

  fechar(): void {
    this.overlay.close(false);
  }
}
