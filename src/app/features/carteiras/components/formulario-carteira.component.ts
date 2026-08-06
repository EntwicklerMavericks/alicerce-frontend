import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CarteirasStore } from '../store/carteiras.store';
import { OverlayService } from '../../../core/services/overlay.service';
import { ToastService } from '../../../core/services/toast.service';
import { HapticsService } from '../../../core/platform/haptics.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';

@Component({
  selector: 'app-formulario-carteira',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, InputComponent],
  template: `
    <div class="form-sheet-container">
      <div class="sheet-title-box">
        <h2>Nova Conta ou Carteira</h2>
        <p>Cadastre uma conta bancária ou caixinha de reserva</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="carteira-form">
        <app-input
          id="nome"
          label="Nome da Conta"
          placeholder="Ex: Nubank Principal, Caixinha Itaú"
          icon="account_balance_wallet"
          formControlName="nome"
          [required]="true">
        </app-input>

        <div class="field-group">
          <label class="field-label">Tipo de Carteira</label>
          <select formControlName="tipo" class="custom-select">
            <option value="CONTA_CORRENTE">Conta Corrente</option>
            <option value="CARTEIRA_DIGITAL">Carteira Digital (PicPay, Mercado Pago)</option>
            <option value="POUPANCA">Poupança</option>
            <option value="INVESTIMENTO">Investimentos (CDB, Ações)</option>
            <option value="DINHEIRO">Dinheiro Físico / Caixinha</option>
            <option value="CARTAO_CREDITO">Cartão de Crédito</option>
          </select>
        </div>

        <app-input
          id="saldoInicial"
          label="Saldo Inicial de Abertura (R$)"
          type="number"
          placeholder="Ex: 1500.00"
          icon="attach_money"
          formControlName="saldoInicial">
        </app-input>

        <div class="toggle-row">
          <label class="checkbox-label">
            <input type="checkbox" formControlName="permiteSaldoNegativo" />
            <span>Permitir Saldo Negativo (Cheque Especial)</span>
          </label>
        </div>

        <div class="toggle-row">
          <label class="checkbox-label">
            <input type="checkbox" formControlName="padrao" />
            <span>Definir como Conta Padrão do Workspace</span>
          </label>
        </div>

        <app-button
          type="submit"
          variant="primary-gold"
          size="lg"
          [loading]="carteirasStore.carregando()"
          [disabled]="form.invalid">
          Salvar Carteira
        </app-button>
      </form>
    </div>
  `,
  styles: [`
    .form-sheet-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-bottom: 12px;
    }

    .sheet-title-box {
      h2 { font-size: 18px; font-weight: 700; margin: 0; color: #ebd9b6; }
      p { font-size: 12px; color: rgba(235, 217, 182, 0.6); margin: 2px 0 0 0; }
    }

    .carteira-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .field-label {
      font-size: 12px;
      font-weight: 600;
      color: rgba(235, 217, 182, 0.7);
    }

    .custom-select {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(216, 184, 126, 0.25);
      border-radius: var(--alic-radius-md);
      padding: 12px 14px;
      color: #ffffff;
      font-family: inherit;
      font-size: 14px;
      outline: none;

      option { background: #18070a; color: #fff; }
    }

    .toggle-row {
      display: flex;
      align-items: center;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;
      color: rgba(235, 217, 182, 0.8);
      cursor: pointer;

      input {
        width: 18px;
        height: 18px;
        accent-color: var(--alic-color-gold-main);
      }
    }
  `],
})
export class FormularioCarteiraComponent {
  readonly carteirasStore = inject(CarteirasStore);
  private readonly overlayService = inject(OverlayService);
  private readonly toastService = inject(ToastService);
  private readonly haptics = inject(HapticsService);
  private readonly fb = inject(FormBuilder);

  readonly form: FormGroup = this.fb.group({
    nome: ['', [Validators.required]],
    tipo: ['CONTA_CORRENTE', [Validators.required]],
    saldoInicial: [0],
    permiteSaldoNegativo: [true],
    padrao: [false],
  });

  async onSubmit(): Promise<void> {
    if (this.form.valid) {
      this.haptics.impactMedium();
      const val = this.form.value;

      const ok = await this.carteirasStore.criarCarteira({
        nome: val.nome,
        tipo: val.tipo,
        saldoInicial: Number(val.saldoInicial || 0),
        permiteSaldoNegativo: val.permiteSaldoNegativo,
        padrao: val.padrao,
      });

      if (ok) {
        this.toastService.showSuccess(`Conta "${val.nome}" cadastrada com sucesso!`);
        this.overlayService.close({ saved: true });
      }
    } else {
      this.form.markAllAsTouched();
    }
  }
}
