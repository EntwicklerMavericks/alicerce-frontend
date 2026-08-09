import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CotacoesStore } from '../store/cotacoes.store';
import { OverlayService } from '../../../core/services/overlay.service';
import { ToastService } from '../../../core/services/toast.service';
import { HapticsService } from '../../../core/platform/haptics.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';

@Component({
  selector: 'app-formulario-cotacao-avulsa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, InputComponent],
  template: `
    <div class="form-sheet-container">
      <div class="sheet-title-box">
        <div class="title-with-icon">
          <span class="material-symbols-rounded icon-gold">price_change</span>
          <h2>Registrar Cotação Avulsa</h2>
        </div>
        <p>Adicione um preço encontrado em loja física ou site sem integração direta</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="cotacao-form">
        <app-input
          id="lojaNome"
          label="Nome da Loja / Vendedor"
          placeholder="Ex: Magazine Luiza, Kabum, Fast Shop, Feira Central"
          icon="storefront"
          formControlName="lojaNome"
          [required]="true">
        </app-input>

        <app-input
          id="preco"
          label="Preço Encontrado (R$)"
          type="number"
          placeholder="Ex: 1999.90"
          icon="attach_money"
          formControlName="preco"
          [required]="true">
        </app-input>

        <app-input
          id="lojaUrl"
          label="Link da Oferta / Loja (URL - Opcional)"
          placeholder="https://www.loja.com.br/produto/123"
          icon="link"
          formControlName="lojaUrl">
        </app-input>

        <app-input
          id="observacao"
          label="Observações / Condições (Opcional)"
          placeholder="Ex: Preço no Pix com cupom DESCONTO10, válido até amanhã"
          icon="notes"
          formControlName="observacao">
        </app-input>

        <div class="form-actions">
          <app-button
            type="button"
            variant="secondary-glass"
            size="lg"
            (btnClick)="cancelar()">
            Cancelar
          </app-button>

          <app-button
            type="submit"
            variant="primary-gold"
            size="lg"
            [loading]="cotacoesStore.carregando()"
            [disabled]="form.invalid">
            Salvar Cotação
          </app-button>
        </div>
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
      display: flex;
      flex-direction: column;
      gap: 4px;

      .title-with-icon {
        display: flex;
        align-items: center;
        gap: 8px;

        .icon-gold {
          font-size: 24px;
          color: var(--alic-color-gold-main, #c9a74e);
        }

        h2 {
          font-size: 18px;
          font-weight: 700;
          margin: 0;
          color: var(--alic-color-gold-light, #ebd9b6);
        }
      }

      p {
        font-size: 12px;
        color: rgba(235, 217, 182, 0.6);
        margin: 0;
      }
    }

    .cotacao-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-actions {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 12px;
      margin-top: 8px;
    }
  `],
})
export class FormularioCotacaoAvulsaComponent implements OnInit {
  readonly cotacoesStore = inject(CotacoesStore);
  private readonly overlayService = inject(OverlayService);
  private readonly toastService = inject(ToastService);
  private readonly haptics = inject(HapticsService);
  private readonly fb = inject(FormBuilder);

  itemWishlistId!: string;

  readonly form: FormGroup = this.fb.group({
    lojaNome: ['', [Validators.required]],
    preco: ['', [Validators.required, Validators.min(0.01)]],
    lojaUrl: [''],
    observacao: [''],
  });

  ngOnInit(): void {
    const data = this.overlayService.activeOverlay()?.data as { itemWishlistId?: string } | undefined;
    this.itemWishlistId = data?.itemWishlistId || this.cotacoesStore.itemWishlistId() || `wish-${Date.now()}`;
  }

  async onSubmit(): Promise<void> {
    if (this.form.valid) {
      this.haptics.impactMedium();
      const val = this.form.value;

      const ok = await this.cotacoesStore.registrarCotacaoAvulsa({
        itemWishlistId: this.itemWishlistId,
        lojaNome: val.lojaNome,
        preco: Number(val.preco),
        lojaUrl: val.lojaUrl || undefined,
        observacao: val.observacao || undefined,
      });

      if (ok) {
        this.toastService.showSuccess(`Cotação da loja "${val.lojaNome}" registrada com sucesso!`);
        this.overlayService.close({ success: true });
      }
    } else {
      this.form.markAllAsTouched();
    }
  }

  cancelar(): void {
    this.haptics.impactLight();
    this.overlayService.close(undefined);
  }
}
