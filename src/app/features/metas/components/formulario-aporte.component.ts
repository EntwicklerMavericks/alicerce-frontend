import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MetasStore } from '../store/metas.store';
import { OverlayService } from '../../../core/services/overlay.service';
import { ToastService } from '../../../core/services/toast.service';
import { HapticsService } from '../../../core/platform/haptics.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { Meta } from '../../../core/models/meta.models';

@Component({
  selector: 'app-formulario-aporte',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, ButtonComponent, InputComponent],
  template: `
    <div class="form-sheet-container">
      <div class="sheet-title-box">
        <h2>Registrar Aporte na Meta</h2>
        <p>Adicione valores para acelerar a conquista do seu objetivo</p>
      </div>

      <!-- Card da Meta Selecionada -->
      @if (metaAlvo) {
        <div class="selected-meta-card glass-card">
          <div class="meta-card-header">
            <div
              class="meta-icon"
              [style.background-color]="metaAlvo.cor || '#C9A74E'">
              <span class="material-symbols-rounded">{{ metaAlvo.icone || 'flag' }}</span>
            </div>
            <div class="meta-info">
              <span class="meta-title">{{ metaAlvo.nome }}</span>
              <span class="meta-sub">
                Acumulado: {{ metaAlvo.valorAtual | currency:'BRL':'symbol':'1.2-2':'pt-BR' }} / {{ metaAlvo.valorAlvo | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
              </span>
            </div>
          </div>
          <div class="mini-progress-bar">
            <div class="fill" [style.width.%]="metaAlvo.percentualConcluido" [style.background-color]="metaAlvo.cor || '#C9A74E'"></div>
          </div>
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="aporte-form">
        @if (!metaAlvo) {
          <div class="field-group">
            <label class="field-label">Selecione a Meta</label>
            <select formControlName="metaId" class="custom-select">
              @for (m of metasStore.metas(); track m.id) {
                <option [value]="m.id">{{ m.nome }} ({{ m.percentualConcluido }}%)</option>
              }
            </select>
          </div>
        }

        <app-input
          id="valor"
          label="Valor do Aporte (R$)"
          type="number"
          placeholder="Ex: 500.00"
          icon="attach_money"
          formControlName="valor"
          [required]="true">
        </app-input>

        <app-input
          id="data"
          label="Data do Aporte"
          type="date"
          icon="calendar_today"
          formControlName="data"
          [required]="true">
        </app-input>

        <app-input
          id="observacao"
          label="Observação (Opcional)"
          placeholder="Ex: Sobra do salário, Rendimentos de investimentos"
          icon="edit_note"
          formControlName="observacao">
        </app-input>

        <app-button
          type="submit"
          variant="primary-gold"
          size="lg"
          [loading]="metasStore.carregando()"
          [disabled]="form.invalid">
          Confirmar Aporte
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

    .selected-meta-card {
      padding: 12px 16px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(216, 184, 126, 0.25);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .meta-card-header {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .meta-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      flex-shrink: 0;

      span { font-size: 20px; }
    }

    .meta-info {
      display: flex;
      flex-direction: column;
    }

    .meta-title {
      font-size: 14px;
      font-weight: 700;
      color: #ffffff;
    }

    .meta-sub {
      font-size: 11px;
      color: rgba(235, 217, 182, 0.7);
    }

    .mini-progress-bar {
      width: 100%;
      height: 6px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
      overflow: hidden;

      .fill {
        height: 100%;
        border-radius: 3px;
        transition: width 0.3s ease;
      }
    }

    .aporte-form {
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
      border-radius: var(--alic-radius-md, 12px);
      padding: 12px 14px;
      color: #ffffff;
      font-family: inherit;
      font-size: 14px;
      outline: none;

      option { background: #18070a; color: #fff; }
    }
  `],
})
export class FormularioAporteComponent implements OnInit {
  readonly metasStore = inject(MetasStore);
  private readonly overlayService = inject(OverlayService);
  private readonly toastService = inject(ToastService);
  private readonly haptics = inject(HapticsService);
  private readonly fb = inject(FormBuilder);

  metaAlvo: Meta | null = null;

  readonly form: FormGroup = this.fb.group({
    metaId: ['', [Validators.required]],
    valor: ['', [Validators.required, Validators.min(0.01)]],
    data: [new Date().toISOString().split('T')[0], [Validators.required]],
    observacao: [''],
  });

  ngOnInit(): void {
    const data = this.overlayService.activeOverlay()?.data as { meta?: Meta; metaId?: string } | undefined;
    if (data?.meta) {
      this.metaAlvo = data.meta;
      this.form.patchValue({ metaId: data.meta.id });
    } else if (data?.metaId) {
      const achada = this.metasStore.metas().find((m) => m.id === data.metaId);
      if (achada) {
        this.metaAlvo = achada;
        this.form.patchValue({ metaId: achada.id });
      }
    } else if (this.metasStore.metas().length > 0) {
      const primeira = this.metasStore.metas()[0];
      this.metaAlvo = primeira;
      this.form.patchValue({ metaId: primeira.id });
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.valid) {
      this.haptics.impactMedium();
      const val = this.form.value;
      const targetId = this.metaAlvo ? this.metaAlvo.id : val.metaId;

      const ok = await this.metasStore.aportar(targetId, {
        valor: Number(val.valor),
        data: val.data,
        descricao: val.observacao,
      });

      if (ok) {
        const metaNome = this.metaAlvo?.nome || 'Meta';
        this.toastService.showSuccess(`Aporte de R$ ${val.valor} realizado com sucesso na meta "${metaNome}"!`);
        this.overlayService.close({ saved: true });
      }
    } else {
      this.form.markAllAsTouched();
    }
  }
}
