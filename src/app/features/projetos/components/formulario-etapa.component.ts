import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjetosStore } from '../store/projetos.store';
import { OverlayService } from '../../../core/services/overlay.service';
import { ToastService } from '../../../core/services/toast.service';
import { HapticsService } from '../../../core/platform/haptics.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { EtapaProjetoReadModel } from '../../../core/models/projeto.models';

@Component({
  selector: 'app-formulario-etapa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, InputComponent],
  template: `
    <div class="form-sheet-container">
      <div class="sheet-title-box">
        <h2>{{ isEdicao ? 'Editar Etapa do Projeto' : 'Nova Etapa do Projeto' }}</h2>
        <p>Divida o projeto em fases claras com prazos e custos estimados</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="etapa-form">
        <app-input
          id="nome"
          label="Nome da Etapa"
          placeholder="Ex: Demolição, Marcenaria, Documentação"
          icon="format_list_bulleted"
          formControlName="nome"
          [required]="true">
        </app-input>

        <app-input
          id="descricao"
          label="Descrição da Etapa"
          placeholder="Ex: Detalhes do serviço ou fornecedores envolvidos"
          icon="notes"
          formControlName="descricao">
        </app-input>

        <app-input
          id="custoEstimado"
          label="Custo Estimado da Etapa (R$)"
          type="currency"
          placeholder="R$ 0,00"
          icon="attach_money"
          formControlName="custoEstimado">
        </app-input>

        <app-button
          type="submit"
          variant="primary-gold"
          size="lg"
          [loading]="projetosStore.carregando()"
          [disabled]="form.invalid">
          {{ isEdicao ? 'Salvar Alterações' : 'Adicionar Etapa' }}
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

    .etapa-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
  `],
})
export class FormularioEtapaComponent implements OnInit {
  readonly projetosStore = inject(ProjetosStore);
  private readonly overlayService = inject(OverlayService);
  private readonly toastService = inject(ToastService);
  private readonly haptics = inject(HapticsService);
  private readonly fb = inject(FormBuilder);

  isEdicao = false;
  projetoId = '';
  etapaParaEditar: EtapaProjetoReadModel | null = null;

  readonly form: FormGroup = this.fb.group({
    nome: ['', [Validators.required]],
    descricao: [''],
    custoEstimado: [0, [Validators.min(0)]],
  });

  ngOnInit(): void {
    const data = this.overlayService.activeOverlay()?.data as
      | { projetoId: string; etapa?: EtapaProjetoReadModel }
      | undefined;

    if (data?.projetoId) {
      this.projetoId = data.projetoId;
    }

    if (data?.etapa) {
      this.isEdicao = true;
      this.etapaParaEditar = data.etapa;
      this.form.patchValue({
        nome: data.etapa.nome,
        descricao: data.etapa.descricao || '',
        custoEstimado: data.etapa.custoEstimado || 0,
      });
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.valid && this.projetoId) {
      this.haptics.impactMedium();
      const val = this.form.value;

      if (this.isEdicao && this.etapaParaEditar) {
        const ok = await this.projetosStore.atualizarEtapa(this.projetoId, this.etapaParaEditar.id, {
          nome: val.nome,
          descricao: val.descricao,
          custoEstimado: Number(val.custoEstimado || 0),
        });

        if (ok) {
          this.toastService.showSuccess(`Etapa "${val.nome}" atualizada!`);
          this.overlayService.close({ saved: true });
        }
      } else {
        const ok = await this.projetosStore.adicionarEtapa(this.projetoId, {
          nome: val.nome,
          descricao: val.descricao,
          custoEstimado: Number(val.custoEstimado || 0),
        });

        if (ok) {
          this.toastService.showSuccess(`Etapa "${val.nome}" incluída!`);
          this.overlayService.close({ saved: true });
        }
      }
    } else {
      this.form.markAllAsTouched();
    }
  }
}
