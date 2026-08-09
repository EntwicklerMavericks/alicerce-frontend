import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProdutosStore } from '../store/produtos.store';
import { OverlayService } from '../../../core/services/overlay.service';
import { ToastService } from '../../../core/services/toast.service';
import { HapticsService } from '../../../core/platform/haptics.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { Loja } from '../../../core/models/loja.models';

@Component({
  selector: 'app-formulario-loja',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, InputComponent],
  template: `
    <div class="form-sheet-container">
      <div class="sheet-title-box">
        <h2>{{ isEdicao ? 'Editar Loja' : 'Cadastrar Nova Loja' }}</h2>
        <p>Cadastre os e-commerces e parceiros para comparação de preços</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="loja-form">
        <app-input
          id="nome"
          label="Nome da Loja / Parceiro"
          placeholder="Ex: Mercado Livre, Amazon, Leroy Merlin"
          icon="storefront"
          formControlName="nome"
          [required]="true">
        </app-input>

        <app-input
          id="urlWebsite"
          label="Website Oficial (opcional)"
          placeholder="Ex: https://www.mercadolivre.com.br"
          icon="language"
          formControlName="urlWebsite">
        </app-input>

        <app-input
          id="urlLogo"
          label="URL da Logo / Ícone (opcional)"
          placeholder="Ex: https://dominio.com/logo.png"
          icon="image"
          formControlName="urlLogo">
        </app-input>

        <app-button
          type="submit"
          variant="primary-gold"
          size="lg"
          [loading]="produtosStore.carregando()"
          [disabled]="form.invalid">
          {{ isEdicao ? 'Atualizar Loja' : 'Salvar Loja' }}
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

    .loja-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
  `],
})
export class FormularioLojaComponent implements OnInit {
  readonly produtosStore = inject(ProdutosStore);
  private readonly overlayService = inject(OverlayService);
  private readonly toastService = inject(ToastService);
  private readonly haptics = inject(HapticsService);
  private readonly fb = inject(FormBuilder);

  isEdicao = false;
  lojaId?: string;

  readonly form: FormGroup = this.fb.group({
    nome: ['', [Validators.required]],
    urlWebsite: [''],
    urlLogo: [''],
  });

  ngOnInit(): void {
    const data = this.overlayService.activeOverlay()?.data as { loja?: Loja };
    if (data?.loja) {
      this.isEdicao = true;
      this.lojaId = data.loja.id;
      this.form.patchValue({
        nome: data.loja.nome,
        urlWebsite: data.loja.urlWebsite || '',
        urlLogo: data.loja.urlLogo || '',
      });
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.valid) {
      this.haptics.impactMedium();
      const val = this.form.value;

      const ok = await this.produtosStore.criarLoja({
        nome: val.nome,
        urlWebsite: val.urlWebsite || undefined,
        urlLogo: val.urlLogo || undefined,
      });

      if (ok) {
        this.toastService.showSuccess(`Loja "${val.nome}" salva com sucesso!`);
        this.overlayService.close({ saved: true });
      }
    } else {
      this.form.markAllAsTouched();
    }
  }
}
