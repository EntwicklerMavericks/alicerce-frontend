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
  selector: 'app-transferencia-carteira',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, InputComponent],
  template: `
    <div class="form-sheet-container">
      <div class="sheet-title-box">
        <h2>Transferência Entre Contas</h2>
        <p>Movimente saldo entre suas carteiras sem gerar despesas falsas</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="transfer-form">
        <div class="field-group">
          <label class="field-label">Conta de Origem (Saída)</label>
          <select formControlName="carteiraOrigemId" class="custom-select">
            @for (c of carteirasStore.carteiras(); track c.id) {
              <option [value]="c.id">
                {{ c.nome }} ({{ c.saldoCalculado | currency:'BRL':'symbol':'1.2-2' }})
              </option>
            }
          </select>
        </div>

        <div class="transfer-arrow-icon">
          <span class="material-symbols-rounded">arrow_downward</span>
        </div>

        <div class="field-group">
          <label class="field-label">Conta de Destino (Entrada)</label>
          <select formControlName="carteiraDestinoId" class="custom-select">
            @for (c of carteirasStore.carteiras(); track c.id) {
              <option [value]="c.id">
                {{ c.nome }} ({{ c.saldoCalculado | currency:'BRL':'symbol':'1.2-2' }})
              </option>
            }
          </select>
        </div>

        <app-input
          id="valor"
          label="Valor a Transferir (R$)"
          type="number"
          placeholder="Ex: 500.00"
          icon="payments"
          formControlName="valor"
          [required]="true">
        </app-input>

        <app-input
          id="descricao"
          label="Descrição / Motivo (Opcional)"
          placeholder="Ex: Aporte Reserva de Emergência"
          icon="notes"
          formControlName="descricao">
        </app-input>

        <app-button
          type="submit"
          variant="primary-gold"
          size="lg"
          [loading]="carteirasStore.carregando()"
          [disabled]="form.invalid">
          Confirmar Transferência
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

    .transfer-form {
      display: flex;
      flex-direction: column;
      gap: 14px;
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

    .transfer-arrow-icon {
      display: flex;
      justify-content: center;
      color: var(--alic-color-gold-main);
      span { font-size: 24px; }
    }
  `],
})
export class TransferenciaCarteiraComponent {
  readonly carteirasStore = inject(CarteirasStore);
  private readonly overlayService = inject(OverlayService);
  private readonly toastService = inject(ToastService);
  private readonly haptics = inject(HapticsService);
  private readonly fb = inject(FormBuilder);

  readonly form: FormGroup = this.fb.group({
    carteiraOrigemId: ['', [Validators.required]],
    carteiraDestinoId: ['', [Validators.required]],
    valor: [null, [Validators.required, Validators.min(0.01)]],
    descricao: [''],
  });

  constructor() {
    const lista = this.carteirasStore.carteiras();
    if (lista.length >= 2) {
      this.form.patchValue({
        carteiraOrigemId: lista[0].id,
        carteiraDestinoId: lista[1].id,
      });
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.valid) {
      this.haptics.impactMedium();
      const val = this.form.value;

      if (val.carteiraOrigemId === val.carteiraDestinoId) {
        this.toastService.showError('Escolha contas de origem e destino diferentes.');
        return;
      }

      const res = await this.carteirasStore.transferir({
        carteiraOrigemId: val.carteiraOrigemId,
        carteiraDestinoId: val.carteiraDestinoId,
        valor: Number(val.valor),
        descricao: val.descricao,
      });

      if (res.sucesso) {
        this.toastService.showSuccess('Transferência entre contas realizada com sucesso!');
        if (res.avisoSaldoNegativo) {
          this.toastService.showWarning('Atenção: A conta de origem ficou com saldo negativo!');
        }
        this.overlayService.close({ saved: true });
      }
    } else {
      this.form.markAllAsTouched();
    }
  }
}
