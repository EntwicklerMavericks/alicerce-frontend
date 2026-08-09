import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProdutosStore } from '../store/produtos.store';
import { OverlayService } from '../../../core/services/overlay.service';
import { ToastService } from '../../../core/services/toast.service';
import { HapticsService } from '../../../core/platform/haptics.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { Produto } from '../../../core/models/produto.models';

@Component({
  selector: 'app-formulario-produto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, InputComponent],
  template: `
    <div class="form-sheet-container">
      <div class="sheet-title-box">
        <h2>{{ isEdicao ? 'Editar Produto' : 'Novo Produto no Catálogo' }}</h2>
        <p>Cadastre materiais, móveis, eletros ou itens para cotações</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="produto-form">
        <app-input
          id="nome"
          label="Nome do Produto"
          placeholder="Ex: Porcelanato 80x80 Polido, Torneira Monocomando"
          icon="inventory_2"
          formControlName="nome"
          [required]="true">
        </app-input>

        <div class="form-row">
          <app-input
            id="marca"
            label="Marca / Fabricante (opcional)"
            placeholder="Ex: Eliane, Docol, Bosch"
            icon="label"
            formControlName="marca">
          </app-input>

          <app-input
            id="categoriaId"
            label="Categoria (opcional)"
            placeholder="Ex: Revestimentos, Metais, Eletros"
            icon="category"
            formControlName="categoriaId">
          </app-input>
        </div>

        <app-input
          id="descricao"
          label="Descrição Detalhada (opcional)"
          placeholder="Ex: Modelo acabamento mate, 110V, 50kg"
          icon="notes"
          formControlName="descricao">
        </app-input>

        @if (!isEdicao) {
          <app-input
            id="imagemInicialUrl"
            label="URL da Imagem / Foto do Produto (opcional)"
            placeholder="Ex: https://dominio.com/foto.jpg"
            icon="image"
            formControlName="imagemInicialUrl">
          </app-input>
        }

        <app-input
          id="observacoes"
          label="Observações / Especificações (opcional)"
          placeholder="Ex: Comprar apenas na promoção abaixo de R$ 150"
          icon="help_outline"
          formControlName="observacoes">
        </app-input>

        <app-button
          type="submit"
          variant="primary-gold"
          size="lg"
          [loading]="produtosStore.carregando()"
          [disabled]="form.invalid">
          {{ isEdicao ? 'Salvar Alterações' : 'Cadastrar Produto' }}
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

    .produto-form {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    @media (max-width: 600px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class FormularioProdutoComponent implements OnInit {
  readonly produtosStore = inject(ProdutosStore);
  private readonly overlayService = inject(OverlayService);
  private readonly toastService = inject(ToastService);
  private readonly haptics = inject(HapticsService);
  private readonly fb = inject(FormBuilder);

  isEdicao = false;
  produtoId?: string;

  readonly form: FormGroup = this.fb.group({
    nome: ['', [Validators.required]],
    marca: [''],
    categoriaId: [''],
    descricao: [''],
    imagemInicialUrl: [''],
    observacoes: [''],
  });

  ngOnInit(): void {
    const data = this.overlayService.activeOverlay()?.data as { produto?: Produto };
    if (data?.produto) {
      this.isEdicao = true;
      this.produtoId = data.produto.id;
      this.form.patchValue({
        nome: data.produto.nome,
        marca: data.produto.marca || '',
        categoriaId: data.produto.categoriaId || '',
        descricao: data.produto.descricao || '',
        observacoes: data.produto.observacoes || '',
      });
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.valid) {
      this.haptics.impactMedium();
      const val = this.form.value;

      let ok = false;
      if (this.isEdicao && this.produtoId) {
        ok = await this.produtosStore.atualizarProduto(this.produtoId, {
          nome: val.nome,
          marca: val.marca || undefined,
          categoriaId: val.categoriaId || undefined,
          descricao: val.descricao || undefined,
          observacoes: val.observacoes || undefined,
        });
      } else {
        ok = await this.produtosStore.criarProduto({
          nome: val.nome,
          marca: val.marca || undefined,
          categoriaId: val.categoriaId || undefined,
          descricao: val.descricao || undefined,
          observacoes: val.observacoes || undefined,
          imagemInicialUrl: val.imagemInicialUrl || undefined,
        });
      }

      if (ok) {
        this.toastService.showSuccess(
          `Produto "${val.nome}" ${this.isEdicao ? 'atualizado' : 'cadastrado'} com sucesso!`
        );
        this.overlayService.close({ saved: true });
      }
    } else {
      this.form.markAllAsTouched();
    }
  }
}
