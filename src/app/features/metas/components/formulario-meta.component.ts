import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MetasStore } from '../store/metas.store';
import { OverlayService } from '../../../core/services/overlay.service';
import { ToastService } from '../../../core/services/toast.service';
import { HapticsService } from '../../../core/platform/haptics.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { Meta } from '../../../core/models/meta.models';

@Component({
  selector: 'app-formulario-meta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, InputComponent],
  template: `
    <div class="form-sheet-container">
      <div class="sheet-title-box">
        <h2>{{ isEdicao ? 'Editar Meta Financeira' : 'Nova Meta Financeira' }}</h2>
        <p>Defina o objetivo, valor alvo e prazo para conquistar seus sonhos</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="meta-form">
        <app-input
          id="nome"
          label="Nome da Meta"
          placeholder="Ex: Reserva de Emergência, Viagem para o Japão"
          icon="flag"
          formControlName="nome"
          [required]="true">
        </app-input>

        <app-input
          id="descricao"
          label="Descrição / Objetivo"
          placeholder="Ex: Guardar 6 meses de custo fixo"
          icon="notes"
          formControlName="descricao">
        </app-input>

        <div class="two-cols">
          <app-input
            id="valorAlvo"
            label="Valor Alvo (R$)"
            type="currency"
            placeholder="R$ 0,00"
            icon="attach_money"
            formControlName="valorAlvo"
            [required]="true">
          </app-input>

          @if (!isEdicao) {
            <app-input
              id="valorInicial"
              label="Aporte Inicial (R$)"
              type="currency"
              placeholder="R$ 0,00"
              icon="savings"
              formControlName="valorInicial">
            </app-input>
          }
        </div>

        <app-input
          id="prazo"
          label="Prazo Final de Conclusão"
          type="date"
          icon="event"
          formControlName="prazo"
          [required]="true">
        </app-input>

        <!-- Seleção de Ícone -->
        <div class="field-group">
          <label class="field-label">Ícone Representativo</label>
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

        <!-- Seleção de Cor -->
        <div class="field-group">
          <label class="field-label">Cor de Destaque</label>
          <div class="color-selector-grid">
            @for (c of coresDisponiveis; track c.hex) {
              <button
                type="button"
                class="color-picker-btn"
                [style.background-color]="c.hex"
                [class.selected]="form.value.cor === c.hex"
                [title]="c.nome"
                (click)="selecionarCor(c.hex)">
              </button>
            }
          </div>
        </div>

        <app-button
          type="submit"
          variant="primary-gold"
          size="lg"
          [loading]="metasStore.carregando()"
          [disabled]="form.invalid">
          {{ isEdicao ? 'Salvar Alterações' : 'Criar Meta Financeira' }}
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

    .meta-form {
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

    .color-selector-grid {
      display: flex;
      gap: 12px;
    }

    .color-picker-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 2px solid transparent;
      cursor: pointer;
      transition: transform 0.2s ease, border-color 0.2s ease;

      &:hover {
        transform: scale(1.1);
      }

      &.selected {
        border-color: #ffffff;
        box-shadow: 0 0 10px rgba(255, 255, 255, 0.6);
        transform: scale(1.15);
      }
    }
  `],
})
export class FormularioMetaComponent implements OnInit {
  readonly metasStore = inject(MetasStore);
  private readonly overlayService = inject(OverlayService);
  private readonly toastService = inject(ToastService);
  private readonly haptics = inject(HapticsService);
  private readonly fb = inject(FormBuilder);

  isEdicao = false;
  metaParaEditar: Meta | null = null;

  readonly iconesDisponiveis = [
    'shield',
    'directions_car',
    'flight_takeoff',
    'home',
    'school',
    'savings',
    'laptop_mac',
    'diamond',
    'beach_access',
    'fitness_center',
    'favorite',
    'flag',
  ];

  readonly coresDisponiveis = [
    { hex: '#C9A74E', nome: 'Dourado Champagne' },
    { hex: '#A13D63', nome: 'Bordô Alicerce' },
    { hex: '#2e7d32', nome: 'Verde Conquista' },
    { hex: '#0288d1', nome: 'Azul Confiança' },
    { hex: '#7b1fa2', nome: 'Roxo Nobre' },
  ];

  readonly form: FormGroup = this.fb.group({
    nome: ['', [Validators.required]],
    descricao: [''],
    valorAlvo: ['', [Validators.required, Validators.min(1)]],
    valorInicial: [0],
    prazo: ['', [Validators.required]],
    icone: ['shield'],
    cor: ['#C9A74E'],
  });

  ngOnInit(): void {
    const data = this.overlayService.activeOverlay()?.data as { meta?: Meta } | undefined;
    if (data?.meta) {
      this.isEdicao = true;
      this.metaParaEditar = data.meta;
      this.form.patchValue({
        nome: data.meta.nome,
        descricao: data.meta.descricao || '',
        valorAlvo: data.meta.valorAlvo,
        prazo: data.meta.prazo,
        icone: data.meta.icone || 'shield',
        cor: data.meta.cor || '#C9A74E',
      });
    } else {
      // Define data padrão de prazo para 1 ano a partir de hoje
      const hoje = new Date();
      hoje.setFullYear(hoje.getFullYear() + 1);
      const dataPrazoPadrao = hoje.toISOString().split('T')[0];
      this.form.patchValue({ prazo: dataPrazoPadrao });
    }
  }

  selecionarIcone(ic: string): void {
    this.form.patchValue({ icone: ic });
  }

  selecionarCor(hex: string): void {
    this.form.patchValue({ cor: hex });
  }

  async onSubmit(): Promise<void> {
    if (this.form.valid) {
      this.haptics.impactMedium();
      const val = this.form.value;

      if (this.isEdicao && this.metaParaEditar) {
        const ok = await this.metasStore.atualizarMeta(this.metaParaEditar.id, {
          nome: val.nome,
          descricao: val.descricao,
          valorAlvo: Number(val.valorAlvo),
          prazo: val.prazo,
          icone: val.icone,
          cor: val.cor,
        });

        if (ok) {
          this.toastService.showSuccess(`Meta "${val.nome}" atualizada com sucesso!`);
          this.overlayService.close({ saved: true });
        }
      } else {
        const valorInicialNum = Number(val.valorInicial || 0);

        // Criar meta com dados padrao (sem valorInicial no POST /metas para compatibilidade total)
        const novaMeta = await this.metasStore.criarMeta({
          nome: val.nome,
          descricao: val.descricao,
          valorAlvo: Number(val.valorAlvo),
          prazo: val.prazo,
          icone: val.icone,
          cor: val.cor,
        });

        if (novaMeta) {
          // Se houver valor inicial > 0, registrar o aporte de abertura
          if (valorInicialNum > 0 && novaMeta.id) {
            await this.metasStore.aportar(novaMeta.id, {
              valor: valorInicialNum,
              data: new Date().toISOString().split('T')[0],
              descricao: 'Aporte inicial de abertura',
            });
          }

          this.toastService.showSuccess(`Meta "${val.nome}" criada com sucesso!`);
          this.overlayService.close({ saved: true });
        }
      }
    } else {
      this.form.markAllAsTouched();
    }
  }
}
