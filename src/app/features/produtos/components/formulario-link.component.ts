import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProdutosStore } from '../store/produtos.store';
import { OverlayService } from '../../../core/services/overlay.service';
import { ToastService } from '../../../core/services/toast.service';
import { HapticsService } from '../../../core/platform/haptics.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { FormularioLojaComponent } from './formulario-loja.component';

export interface FormularioLinkData {
  produtoId: string;
  produtoNome?: string;
  linkId?: string;
  lojaId?: string;
  precoAtual?: number;
  urlAtual?: string;
}

@Component({
  selector: 'app-formulario-link',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, InputComponent],
  template: `
    <div class="form-sheet-container">
      <div class="sheet-title-box">
        <h2>{{ isAtualizacaoPreco ? 'Atualizar Preço do Item' : 'Vincular Oferta de Loja' }}</h2>
        <p class="subtext">
          {{ produtoNome ? 'Produto: ' + produtoNome : 'Cadastre a cotação de preço e o link da loja' }}
        </p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="link-form">
        @if (!isAtualizacaoPreco) {
          <div class="field-group">
            <div class="select-label-row">
              <label class="field-label">Selecione a Loja / Parceiro</label>
              <button type="button" class="btn-nova-loja" (click)="abrirNovaLoja()">
                + Cadastrar Nova Loja
              </button>
            </div>

            <select formControlName="lojaId" class="custom-select">
              <option value="" disabled>-- Escolha uma loja --</option>
              @for (loja of produtosStore.lojas(); track loja.id) {
                <option [value]="loja.id">{{ loja.nome }}</option>
              }
            </select>
            @if (produtosStore.lojas().length === 0) {
              <span class="warning-hint">Nenhuma loja cadastrada. Clique acima para cadastrar.</span>
            }
          </div>
        }

        <app-input
          id="preco"
          label="Preço Atual da Oferta (R$)"
          type="number"
          placeholder="Ex: 299.90"
          icon="attach_money"
          formControlName="preco"
          [required]="true">
        </app-input>

        <app-input
          id="url"
          label="Link / URL Direta do Produto na Loja"
          placeholder="Ex: https://www.mercadolivre.com.br/item/123"
          icon="link"
          formControlName="url"
          [required]="true">
        </app-input>

        <app-button
          type="submit"
          variant="primary-gold"
          size="lg"
          [loading]="produtosStore.carregando()"
          [disabled]="form.invalid">
          {{ isAtualizacaoPreco ? 'Atualizar Preço & Histórico' : 'Vincular Oferta' }}
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
      .subtext { font-size: 12px; color: rgba(235, 217, 182, 0.6); margin: 2px 0 0 0; }
    }

    .link-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .select-label-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .field-label {
      font-size: 12px;
      font-weight: 600;
      color: rgba(235, 217, 182, 0.7);
    }

    .btn-nova-loja {
      background: none;
      border: none;
      color: var(--alic-color-gold-light);
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      padding: 0;
      text-decoration: underline;
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

    .warning-hint {
      font-size: 11px;
      color: #f43f5e;
    }
  `],
})
export class FormularioLinkComponent implements OnInit {
  readonly produtosStore = inject(ProdutosStore);
  private readonly overlayService = inject(OverlayService);
  private readonly toastService = inject(ToastService);
  private readonly haptics = inject(HapticsService);
  private readonly fb = inject(FormBuilder);

  isAtualizacaoPreco = false;
  produtoId!: string;
  produtoNome?: string;
  linkId?: string;

  readonly form: FormGroup = this.fb.group({
    lojaId: ['', [Validators.required]],
    preco: [null, [Validators.required, Validators.min(0.01)]],
    url: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.produtosStore.carregarLojas();

    const data = this.overlayService.activeOverlay()?.data as FormularioLinkData;
    if (data) {
      this.produtoId = data.produtoId;
      this.produtoNome = data.produtoNome;
      this.linkId = data.linkId;

      if (this.linkId) {
        this.isAtualizacaoPreco = true;
        this.form.get('lojaId')?.clearValidators();
        this.form.get('lojaId')?.updateValueAndValidity();
        this.form.patchValue({
          preco: data.precoAtual || null,
          url: data.urlAtual || '',
        });
      }
    }
  }

  abrirNovaLoja(): void {
    this.haptics.impactLight();
    this.overlayService.openBottomSheet({
      component: FormularioLojaComponent,
      title: 'Cadastrar Loja',
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.valid) {
      this.haptics.impactMedium();
      const val = this.form.value;

      let ok = false;
      if (this.isAtualizacaoPreco && this.linkId) {
        ok = await this.produtosStore.atualizarPrecoLink(this.produtoId, this.linkId, {
          preco: Number(val.preco),
          url: val.url,
        });
      } else {
        ok = await this.produtosStore.vincularLink(this.produtoId, {
          lojaId: val.lojaId,
          preco: Number(val.preco),
          url: val.url,
        });
      }

      if (ok) {
        this.toastService.showSuccess(
          this.isAtualizacaoPreco ? 'Preço e histórico atualizados!' : 'Oferta vinculada com sucesso!'
        );
        this.overlayService.close({ saved: true });
      }
    } else {
      this.form.markAllAsTouched();
    }
  }
}
