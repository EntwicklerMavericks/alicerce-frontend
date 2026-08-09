import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CartoesStore } from '../store/cartoes.store';
import { CarteirasStore } from '../../carteiras/store/carteiras.store';
import { OverlayService } from '../../../core/services/overlay.service';
import { ToastService } from '../../../core/services/toast.service';
import { FaturaCartao } from '../../../core/models/cartao.models';

@Component({
  selector: 'app-pagamento-fatura',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  template: `
    <div class="form-container">
      <div class="form-header">
        <h3 class="form-title">
          <span class="material-symbols-rounded icon-bordo">account_balance_wallet</span>
          Pagamento da Fatura
        </h3>
        <button class="close-btn" (click)="fechar()">
          <span class="material-symbols-rounded">close</span>
        </button>
      </div>

      @if (fatura) {
        <div class="summary-box">
          <div class="summary-label">Competência da Fatura</div>
          <div class="summary-value">{{ fatura.mes | number:'2.0-0' }}/{{ fatura.ano }}</div>
          <div class="summary-amount">R$ {{ fatura.valorTotal | number:'1.2-2' }}</div>
        </div>

        <form (ngSubmit)="salvar()" class="form-body">
          <div class="form-group">
            <label for="carteiraId">Carteira Pagadora (Caixa Real)</label>
            <select id="carteiraId" [(ngModel)]="carteiraId" name="carteiraId" class="input-field" required>
              <option value="">Selecione a conta para débito...</option>
              @for (c of carteirasStore.carteiras(); track c.id) {
                <option [value]="c.id">{{ c.nome }} (Saldo: R$ {{ c.saldoCalculado | number:'1.2-2' }})</option>
              }
            </select>
          </div>

          <div class="form-group">
            <label for="dataPagamento">Data do Pagamento</label>
            <input
              id="dataPagamento"
              type="date"
              [(ngModel)]="dataPagamento"
              name="dataPagamento"
              required
              class="input-field" />
          </div>

          <div class="form-actions">
            <app-button
              type="submit"
              variant="primary-bordo"
              size="lg"
              [loading]="salvando()"
              icon="check">
              Confirmar Pagamento da Fatura
            </app-button>
          </div>
        </form>
      }
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

        .icon-bordo {
          color: var(--alic-color-bordo-vivid);
        }
      }

      .close-btn {
        background: none;
        border: none;
        color: var(--color-text-secondary);
        cursor: pointer;
      }
    }

    .summary-box {
      background: rgba(216, 184, 126, 0.08);
      border: 1px solid rgba(216, 184, 126, 0.25);
      border-radius: var(--radius-md);
      padding: 16px;
      text-align: center;

      .summary-label {
        font-size: 11px;
        color: var(--color-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .summary-value {
        font-size: 14px;
        font-weight: 700;
        color: var(--color-champagne-light);
        margin-top: 2px;
      }

      .summary-amount {
        font-size: 24px;
        font-weight: 800;
        color: var(--color-champagne-main);
        margin-top: 6px;
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
export class PagamentoFaturaComponent implements OnInit {
  fatura: FaturaCartao | null = null;
  carteiraId = '';
  dataPagamento = new Date().toISOString().substring(0, 10);
  salvando = signal<boolean>(false);

  constructor(
    readonly cartoesStore: CartoesStore,
    readonly carteirasStore: CarteirasStore,
    private readonly overlay: OverlayService,
    private readonly toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.carteirasStore.carregarCarteiras();
    const data: any = this.overlay.activeOverlay()?.data;
    if (data?.fatura) {
      this.fatura = data.fatura;
    }
  }

  async salvar(): Promise<void> {
    if (!this.fatura || !this.carteiraId) {
      this.toast.showWarning('Selecione a carteira para efetuar o pagamento.');
      return;
    }

    this.salvando.set(true);

    const ok = await this.cartoesStore.pagarFatura(this.fatura.id, {
      carteiraId: this.carteiraId,
      dataPagamento: this.dataPagamento,
    });

    this.salvando.set(false);

    if (ok) {
      this.toast.showSuccess('Fatura quitada! Lançamento gravado no Financial Ledger.');
      this.overlay.close(true);
    }
  }

  fechar(): void {
    this.overlay.close(false);
  }
}
