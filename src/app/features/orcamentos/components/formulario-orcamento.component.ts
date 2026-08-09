import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrcamentosStore } from '../store/orcamentos.store';
import { OverlayService } from '../../../core/services/overlay.service';
import { ToastService } from '../../../core/services/toast.service';
import { HapticsService } from '../../../core/platform/haptics.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';

@Component({
  selector: 'app-formulario-orcamento',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, InputComponent],
  template: `
    <div class="form-sheet-container">
      <div class="sheet-title-box">
        <h2>Definir Teto de Gastos</h2>
        <p>Estabeleça um limite financeiro para a categoria no mês</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="orcamento-form">
        <div class="field-group">
          <label class="field-label">Categoria de Despesa</label>
          <select formControlName="categoria" class="custom-select">
            <option value="Alimentação & Supermercado">Alimentação & Supermercado</option>
            <option value="Moradia & Contas">Moradia & Contas</option>
            <option value="Transporte & Combustível">Transporte & Combustível</option>
            <option value="Lazer & Cultura">Lazer & Cultura</option>
            <option value="Saúde & Farmácia">Saúde & Farmácia</option>
            <option value="Educação & Cursos">Educação & Cursos</option>

            <option value="Compras & Vestuário">Compras & Vestuário</option>
            <option value="Outros / Diversos">Outros / Diversos</option>
          </select>
        </div>

        <app-input
          id="valorTeto"
          label="Teto do Orçamento (R$)"
          type="number"
          placeholder="Ex: 1500.00"
          icon="attach_money"
          formControlName="valorTeto"
          [required]="true">
        </app-input>

        <app-input
          id="mesAno"
          label="Competência (Mês/Ano)"
          type="month"
          icon="calendar_today"
          formControlName="mesAno"
          [required]="true">
        </app-input>

        <!-- Seleção Visual de Ícone -->
        <div class="field-group">
          <label class="field-label">Ícone de Identificação</label>
          <div class="icon-selector-grid">
            @for (ic of iconesDisponiveis; track ic) {
              <button
                type="button"
                class="icon-picker-btn"
                [class.selected]="form.value.icone === ic"
                (click)="selecionarIcone(ic)">
                <span class="material-symbols-rounded">{{ ic }}</span>
              </button>
            }
          </div>
        </div>

        <app-button
          type="submit"
          variant="primary-gold"
          size="lg"
          [loading]="orcamentosStore.carregando()"
          [disabled]="form.invalid">
          Salvar Teto de Orçamento
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

    .orcamento-form {
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

    .icon-selector-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 8px;
    }

    .icon-picker-btn {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(216, 184, 126, 0.2);
      color: var(--alic-color-gold-light, #ebd9b6);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;

      span { font-size: 22px; }

      &:hover {
        background: rgba(216, 184, 126, 0.15);
      }

      &.selected {
        background: var(--alic-color-gold-gradient, linear-gradient(135deg, #d8b87e 0%, #c19b56 100%));
        color: #2b0b10;
        border-color: #d8b87e;
        box-shadow: 0 0 12px rgba(216, 184, 126, 0.4);
      }
    }
  `],
})
export class FormularioOrcamentoComponent {
  readonly orcamentosStore = inject(OrcamentosStore);
  private readonly overlayService = inject(OverlayService);
  private readonly toastService = inject(ToastService);
  private readonly haptics = inject(HapticsService);
  private readonly fb = inject(FormBuilder);

  readonly iconesDisponiveis = [
    'restaurant',
    'home',
    'directions_car',
    'sports_esports',
    'local_hospital',
    'school',
    'shopping_bag',
    'flight_takeoff',
    'build',
    'pets',
    'fitness_center',
    'category',
  ];

  readonly form: FormGroup = this.fb.group({
    categoria: ['Alimentação & Supermercado', [Validators.required]],
    valorTeto: ['', [Validators.required, Validators.min(1)]],
    mesAno: [this.orcamentosStore.mesAnoSelecionado(), [Validators.required]],
    icone: ['restaurant'],
    cor: ['#C9A74E'],
  });

  selecionarIcone(ic: string): void {
    this.form.patchValue({ icone: ic });
  }

  async onSubmit(): Promise<void> {
    if (this.form.valid) {
      this.haptics.impactMedium();
      const val = this.form.value;

      const ok = await this.orcamentosStore.criarOrcamento({
        categoria: val.categoria,
        valorTeto: Number(val.valorTeto),
        mesAno: val.mesAno,
        icone: val.icone,
        cor: val.cor,
      });

      if (ok) {
        this.toastService.showSuccess(`Orçamento para "${val.categoria}" definido!`);
        this.overlayService.close({ saved: true });
      }
    } else {
      this.form.markAllAsTouched();
    }
  }
}
