import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { WishlistStore } from '../store/wishlist.store';
import { ProdutosStore } from '../../produtos/store/produtos.store';
import { MetasStore } from '../../metas/store/metas.store';
import { OverlayService } from '../../../core/services/overlay.service';
import { ToastService } from '../../../core/services/toast.service';
import { HapticsService } from '../../../core/platform/haptics.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ItemWishlist, PrioridadeWishlist } from '../../../core/models/wishlist.models';

@Component({
  selector: 'app-formulario-wishlist',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, InputComponent],
  template: `
    <div class="form-sheet-container">
      <div class="sheet-title-box">
        <h2>{{ isEdicao ? 'Editar Desejo' : 'Novo Desejo de Consumo' }}</h2>
        <p>Cadastre o item, defina o tempo de esfriamento para combater compras por impulso</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="wish-form">
        <!-- Seleção de Produto do Catálogo (Opcional) -->
        <div class="field-group">
          <label class="field-label">Vincular a Produto do Catálogo (Opcional)</label>
          <select
            formControlName="produtoId"
            class="custom-select"
            (change)="onProdutoSelected()">
            <option [value]="''">-- Selecionar do Catálogo --</option>
            @for (p of produtosStore.produtosEnriquecidos(); track p.id) {
              <option [value]="p.id">
                {{ p.nome }} {{ p.menorPreco ? '(R$ ' + p.menorPreco + ')' : '' }}
              </option>
            }
          </select>
        </div>

        <app-input
          id="nome"
          label="Nome do Item / Desejo"
          placeholder="Ex: Smartwatch Garmin, Fone Noise Cancelling"
          icon="shopping_bag"
          formControlName="nome"
          [required]="true">
        </app-input>

        <app-input
          id="descricao"
          label="Descrição / Motivo do Desejo"
          placeholder="Ex: Utilizar para monitorar treinos de corrida"
          icon="notes"
          formControlName="descricao">
        </app-input>

        <div class="two-cols">
          <app-input
            id="precoEstimado"
            label="Preço Estimado (R$)"
            type="currency"
            placeholder="R$ 0,00"
            icon="attach_money"
            formControlName="precoEstimado"
            [required]="true">
          </app-input>

          <!-- Seleção de Meta Financeira (Opcional) -->
          <div class="field-group">
            <label class="field-label">Vincular a Meta</label>
            <select formControlName="metaId" class="custom-select">
              <option [value]="''">-- Nenhuma Meta --</option>
              @for (m of metasStore.metas(); track m.id) {
                <option [value]="m.id">{{ m.nome }}</option>
              }
            </select>
          </div>
        </div>

        <!-- Seletor de Prioridade -->
        <div class="field-group">
          <label class="field-label">Nível de Prioridade</label>
          <div class="prioridade-pills-grid">
            @for (p of prioridadesDisponiveis; track p.valor) {
              <button
                type="button"
                class="prio-pill-btn"
                [class.selected]="form.value.prioridade === p.valor"
                [style.--prio-color]="p.cor"
                (click)="selecionarPrioridade(p.valor)">
                <span class="material-symbols-rounded">{{ p.icone }}</span>
                <span>{{ p.label }}</span>
              </button>
            }
          </div>
        </div>

        <!-- Seletor de Dias de Esfriamento (Regra de Consumo Consciente) -->
        <div class="field-group">
          <label class="field-label">Período de Esfriamento (Dias de Reflexão)</label>
          <div class="dias-pills-grid">
            @for (d of opcoesDiasEsfriamento; track d) {
              <button
                type="button"
                class="dia-pill-btn"
                [class.selected]="form.value.diasEsfriamento === d"
                (click)="selecionarDiasEsfriamento(d)">
                <span class="dia-val">{{ d }}</span>
                <span class="dia-lbl">dias</span>
              </button>
            }
          </div>
        </div>

        <app-input
          id="linkUrl"
          label="Link da Oferta / Loja (URL)"
          placeholder="https://..."
          icon="link"
          formControlName="linkUrl">
        </app-input>

        <app-input
          id="imagemUrl"
          label="URL da Imagem do Produto"
          placeholder="https://..."
          icon="image"
          formControlName="imagemUrl">
        </app-input>

        <app-button
          type="submit"
          variant="primary-gold"
          size="lg"
          [loading]="wishlistStore.carregando()"
          [disabled]="form.invalid">
          {{ isEdicao ? 'Salvar Alterações' : 'Iniciar Período de Esfriamento' }}
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

    .wish-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .two-cols {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
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
      width: 100%;
      height: 48px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(216, 184, 126, 0.2);
      border-radius: 12px;
      color: #ffffff;
      padding: 0 12px;
      font-size: 14px;
      outline: none;
      box-sizing: border-box;

      option {
        background: #1f1a1b;
        color: #ffffff;
      }

      &:focus {
        border-color: #d8b87e;
      }
    }

    .prioridade-pills-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;

      @media (max-width: 480px) {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .prio-pill-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 10px 4px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(216, 184, 126, 0.15);
      color: rgba(235, 217, 182, 0.7);
      cursor: pointer;
      transition: all 0.2s ease;

      span:first-child { font-size: 20px; }
      span:last-child { font-size: 10px; font-weight: 700; }

      &:hover {
        background: rgba(216, 184, 126, 0.1);
      }

      &.selected {
        background: var(--prio-color, #d8b87e);
        color: #ffffff;
        border-color: var(--prio-color, #d8b87e);
        box-shadow: 0 0 12px var(--prio-color, #d8b87e);
      }
    }

    .dias-pills-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;

      @media (max-width: 480px) {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .dia-pill-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 8px 4px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(216, 184, 126, 0.2);
      color: rgba(235, 217, 182, 0.8);
      cursor: pointer;
      transition: all 0.2s ease;

      .dia-val { font-size: 16px; font-weight: 800; }
      .dia-lbl { font-size: 10px; color: rgba(235, 217, 182, 0.6); }

      &:hover {
        background: rgba(216, 184, 126, 0.12);
      }

      &.selected {
        background: var(--alic-color-gold-gradient, linear-gradient(135deg, #d8b87e 0%, #c19b56 100%));
        color: #2b0b10;
        border-color: #d8b87e;

        .dia-lbl { color: #2b0b10; font-weight: 700; }
      }
    }
  `],
})
export class FormularioWishlistComponent implements OnInit {
  readonly wishlistStore = inject(WishlistStore);
  readonly produtosStore = inject(ProdutosStore);
  readonly metasStore = inject(MetasStore);
  private readonly overlayService = inject(OverlayService);
  private readonly toastService = inject(ToastService);
  private readonly haptics = inject(HapticsService);
  private readonly fb = inject(FormBuilder);

  isEdicao = false;
  itemParaEditar: ItemWishlist | null = null;

  readonly prioridadesDisponiveis: Array<{ valor: PrioridadeWishlist; label: string; icone: string; cor: string }> = [
    { valor: 'BAIXA', label: 'Baixa', icone: 'arrow_downward', cor: '#9e9e9e' },
    { valor: 'MEDIA', label: 'Média', icone: 'remove', cor: '#0288d1' },
    { valor: 'ALTA', label: 'Alta', icone: 'arrow_upward', cor: '#C9A74E' },
    { valor: 'URGENTE', label: 'Urgente', icone: 'priority_high', cor: '#f44336' },
  ];

  readonly opcoesDiasEsfriamento = [3, 7, 14, 30];

  readonly form: FormGroup = this.fb.group({
    produtoId: [''],
    nome: ['', [Validators.required]],
    descricao: [''],
    precoEstimado: ['', [Validators.required, Validators.min(0.01)]],
    prioridade: ['MEDIA' as PrioridadeWishlist, [Validators.required]],
    diasEsfriamento: [7, [Validators.required]],
    metaId: [''],
    linkUrl: [''],
    imagemUrl: [''],
  });

  ngOnInit(): void {
    this.produtosStore.carregarProdutos();
    this.metasStore.carregarMetas();

    const data = this.overlayService.activeOverlay()?.data as { item?: ItemWishlist } | undefined;
    if (data?.item) {
      this.isEdicao = true;
      this.itemParaEditar = data.item;
      this.form.patchValue({
        produtoId: data.item.produtoId || '',
        nome: data.item.nome,
        descricao: data.item.descricao || '',
        precoEstimado: data.item.precoEstimado,
        prioridade: data.item.prioridade || 'MEDIA',
        diasEsfriamento: data.item.diasEsfriamento || 7,
        metaId: data.item.metaId || '',
        linkUrl: data.item.linkUrl || '',
        imagemUrl: data.item.imagemUrl || '',
      });
    }
  }

  selecionarPrioridade(prio: PrioridadeWishlist): void {
    this.form.patchValue({ prioridade: prio });
  }

  selecionarDiasEsfriamento(dias: number): void {
    this.form.patchValue({ diasEsfriamento: dias });
  }

  onProdutoSelected(): void {
    const prodId = this.form.value.produtoId;
    if (prodId) {
      const prod = this.produtosStore.produtosEnriquecidos().find((p) => p.id === prodId);
      if (prod) {
        this.form.patchValue({
          nome: prod.nome,
          descricao: prod.descricao || prod.marca ? `Marca: ${prod.marca || ''}` : '',
          precoEstimado: prod.menorPreco || 0,
          imagemUrl: prod.imagemPrincipalUrl || '',
          linkUrl: prod.links && prod.links.length > 0 ? prod.links[0].url : '',
        });
      }
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.valid) {
      this.haptics.impactMedium();
      const val = this.form.value;

      if (this.isEdicao && this.itemParaEditar) {
        const ok = await this.wishlistStore.atualizarItem(this.itemParaEditar.id, {
          nome: val.nome,
          descricao: val.descricao,
          precoEstimado: Number(val.precoEstimado),
          prioridade: val.prioridade,
          diasEsfriamento: Number(val.diasEsfriamento),
          produtoId: val.produtoId || undefined,
          metaId: val.metaId || undefined,
          linkUrl: val.linkUrl,
          imagemUrl: val.imagemUrl,
        });

        if (ok) {
          this.toastService.showSuccess(`Item "${val.nome}" atualizado!`);
          this.overlayService.close({ saved: true });
        }
      } else {
        const ok = await this.wishlistStore.criarItem({
          nome: val.nome,
          descricao: val.descricao,
          precoEstimado: Number(val.precoEstimado),
          prioridade: val.prioridade,
          diasEsfriamento: Number(val.diasEsfriamento),
          produtoId: val.produtoId || undefined,
          metaId: val.metaId || undefined,
          linkUrl: val.linkUrl,
          imagemUrl: val.imagemUrl,
        });

        if (ok) {
          this.toastService.showSuccess(`Item "${val.nome}" adicionado em esfriamento (${val.diasEsfriamento} dias)!`);
          this.overlayService.close({ saved: true });
        }
      }
    } else {
      this.form.markAllAsTouched();
    }
  }
}
