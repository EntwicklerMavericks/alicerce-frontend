import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PessoasStore } from '../store/pessoas.store';
import { OverlayService } from '../../../core/services/overlay.service';
import { ToastService } from '../../../core/services/toast.service';
import { HapticsService } from '../../../core/platform/haptics.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';

@Component({
  selector: 'app-formulario-pessoa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, InputComponent],
  template: `
    <div class="form-sheet-container">
      <div class="sheet-title-box">
        <h2>Cadastrar Membro da Família</h2>
        <p>Informe o parentesco e a regra de renda mensal</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="pessoa-form">
        <app-input
          id="nome"
          label="Nome Completo"
          placeholder="Ex: Carla Oliveira"
          icon="person"
          formControlName="nome"
          [required]="true"
          [invalid]="form.get('nome')!.invalid && form.get('nome')!.touched"
          errorMessage="O nome é obrigatório">
        </app-input>

        <div class="field-group">
          <label class="field-label">Grau de Parentesco</label>
          <select formControlName="parentesco" class="custom-select">
            <option value="Titular">Titular</option>
            <option value="Cônjuge">Cônjuge</option>
            <option value="Filho(a)">Filho(a)</option>
            <option value="Dependente">Dependente</option>
            <option value="Outro">Outro</option>
          </select>
        </div>

        <div class="salary-box glass-card">
          <label class="field-label">Tipo de Remuneração</label>
          <div class="radio-pill-group">
            <label class="pill-option" [class.selected]="tipoSalario === 'FIXO'">
              <input type="radio" formControlName="tipoSalario" value="FIXO" />
              <span>Salário Fixo (CLT)</span>
            </label>

            <label class="pill-option" [class.selected]="tipoSalario === 'POR_HORA'">
              <input type="radio" formControlName="tipoSalario" value="POR_HORA" />
              <span>Por Hora (PJ)</span>
            </label>

            <label class="pill-option" [class.selected]="tipoSalario === 'COMISSAO'">
              <input type="radio" formControlName="tipoSalario" value="COMISSAO" />
              <span>Comissão / Vendas</span>
            </label>

            <label class="pill-option" [class.selected]="tipoSalario === 'DIARIO'">
              <input type="radio" formControlName="tipoSalario" value="DIARIO" />
              <span>Diária de Trabalho</span>
            </label>
          </div>

          @if (tipoSalario === 'FIXO' || tipoSalario === 'COMISSAO' || tipoSalario === 'DIARIO') {
            <app-input
              id="valorBase"
              [label]="tipoSalario === 'FIXO' ? 'Valor Bruto Mensal (R$)' : 'Valor Base (R$)'"
              type="number"
              placeholder="Ex: 8500.00"
              icon="attach_money"
              formControlName="valorBase"
              [required]="true">
            </app-input>
          }

          @if (tipoSalario === 'POR_HORA') {
            <div class="row-inputs">
              <app-input
                id="valorHora"
                label="Valor da Hora (R$)"
                type="number"
                placeholder="65.00"
                icon="schedule"
                formControlName="valorHora"
                [required]="true">
              </app-input>

              <app-input
                id="horasDiarias"
                label="Horas/Dia"
                type="number"
                placeholder="8"
                icon="timer"
                formControlName="horasDiarias">
              </app-input>
            </div>
          }
        </div>

        <app-button
          type="submit"
          variant="primary-gold"
          size="lg"
          [loading]="pessoasStore.carregando()"
          [disabled]="form.invalid">
          Salvar Membro
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

    .pessoa-form {
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

    .salary-box {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(216, 184, 126, 0.2);
    }

    .radio-pill-group {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .pill-option {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 10px 8px;
      border-radius: var(--alic-radius-md);
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(216, 184, 126, 0.15);
      color: rgba(235, 217, 182, 0.7);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;

      input { display: none; }

      &.selected {
        background: rgba(216, 184, 126, 0.18);
        border-color: var(--alic-color-gold-main);
        color: var(--alic-color-gold-light);
      }
    }

    .row-inputs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
  `],
})
export class FormularioPessoaComponent {
  readonly pessoasStore = inject(PessoasStore);
  private readonly overlayService = inject(OverlayService);
  private readonly toastService = inject(ToastService);
  private readonly haptics = inject(HapticsService);
  private readonly fb = inject(FormBuilder);

  readonly form: FormGroup = this.fb.group({
    nome: ['', [Validators.required]],
    parentesco: ['Cônjuge', [Validators.required]],
    tipoSalario: ['FIXO', [Validators.required]],
    valorBase: [5000],
    valorHora: [50],
    horasDiarias: [8],
  });

  get tipoSalario(): string {
    return this.form.get('tipoSalario')?.value || 'FIXO';
  }

  async onSubmit(): Promise<void> {
    if (this.form.valid) {
      this.haptics.impactMedium();
      const val = this.form.value;

      const sucesso = await this.pessoasStore.criarPessoa({
        nome: val.nome,
        parentesco: val.parentesco,
        configSalario: {
          tipo: val.tipoSalario,
          valorBase: Number(val.valorBase || 0),
          valorHora: Number(val.valorHora || 0),
          horasDiarias: Number(val.horasDiarias || 8),
          diasTrabalhoMes: 22,
        },
      });

      if (sucesso) {
        this.toastService.showSuccess(`Membro "${val.nome}" cadastrado com sucesso!`);
        this.overlayService.close({ saved: true });
      }
    } else {
      this.form.markAllAsTouched();
    }
  }
}
