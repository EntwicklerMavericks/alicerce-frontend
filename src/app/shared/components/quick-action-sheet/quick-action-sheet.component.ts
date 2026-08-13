import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayService } from '../../../core/services/overlay.service';
import { HapticsService } from '../../../core/platform/haptics.service';
import { FormularioDespesaComponent } from '../../../features/lancamentos/components/formulario-despesa.component';
import { FormularioReceitaComponent } from '../../../features/lancamentos/components/formulario-receita.component';
import { FormularioCompraCartaoComponent } from '../../../features/cartoes/components/formulario-compra-cartao.component';
import { FormularioMetaComponent } from '../../../features/metas/components/formulario-meta.component';
import { FormularioProjetoComponent } from '../../../features/projetos/components/formulario-projeto.component';
import { FormularioWishlistComponent } from '../../../features/wishlist/components/formulario-wishlist.component';

export interface QuickActionOption {
  id: string;
  label: string;
  sublabel: string;
  icon: string;
  color: string;
  component: any;
}

@Component({
  selector: 'app-quick-action-sheet',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="quick-action-container">
      <div class="action-header">
        <div class="header-title-box">
          <span class="material-symbols-rounded icon-add">add_circle</span>
          <h3 class="header-title">O que você deseja registrar?</h3>
        </div>
        <button class="close-btn" (click)="fechar()">
          <span class="material-symbols-rounded">close</span>
        </button>
      </div>

      <div class="actions-grid">
        @for (item of acoes; track item.id) {
          <button class="action-card" (click)="executarAcao(item)">
            <div class="action-icon-box" [style.background]="item.color + '22'" [style.color]="item.color">
              <span class="material-symbols-rounded">{{ item.icon }}</span>
            </div>
            <div class="action-info">
              <span class="action-label">{{ item.label }}</span>
              <span class="action-sub">{{ item.sublabel }}</span>
            </div>
            <span class="material-symbols-rounded arrow">chevron_right</span>
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .quick-action-container {
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 16px;
      width: 100%;
      box-sizing: border-box;
    }

    .action-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .header-title-box {
        display: flex;
        align-items: center;
        gap: 8px;

        .icon-add {
          color: var(--alic-color-gold-main, #C9A74E);
          font-size: 24px;
        }

        .header-title {
          font-size: 16px;
          font-weight: 800;
          color: var(--color-champagne-light, #ebd9b6);
          margin: 0;
        }
      }

      .close-btn {
        background: none;
        border: none;
        color: rgba(235, 217, 182, 0.6);
        cursor: pointer;

        span { font-size: 22px; }
      }
    }

    .actions-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .action-card {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px 14px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(216, 184, 126, 0.2);
      border-radius: var(--radius-md, 12px);
      cursor: pointer;
      text-align: left;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

      &:hover, &:active {
        background: rgba(216, 184, 126, 0.12);
        border-color: rgba(216, 184, 126, 0.4);
        transform: translateY(-1px);
      }
    }

    .action-icon-box {
      width: 42px;
      height: 42px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      span { font-size: 22px; }
    }

    .action-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .action-label {
      font-size: 14px;
      font-weight: 700;
      color: #ffffff;
    }

    .action-sub {
      font-size: 11px;
      color: rgba(235, 217, 182, 0.6);
    }

    .arrow {
      color: rgba(235, 217, 182, 0.4);
      font-size: 20px;
    }
  `],
})
export class QuickActionSheetComponent {
  private readonly overlay = inject(OverlayService);
  private readonly haptics = inject(HapticsService);

  readonly acoes: QuickActionOption[] = [
    {
      id: 'despesa',
      label: 'Nova Despesa',
      sublabel: 'Registrar um débito, conta a pagar ou boleto',
      icon: 'arrow_downward',
      color: '#ef4444',
      component: FormularioDespesaComponent,
    },
    {
      id: 'receita',
      label: 'Nova Receita',
      sublabel: 'Registrar salário, venda ou entrada financeira',
      icon: 'arrow_upward',
      color: '#10b981',
      component: FormularioReceitaComponent,
    },
    {
      id: 'compra-cartao',
      label: 'Nova Compra no Cartão',
      sublabel: 'Lançar compra parcelada ou à vista no crédito',
      icon: 'credit_card',
      color: '#f59e0b',
      component: FormularioCompraCartaoComponent,
    },
    {
      id: 'meta',
      label: 'Nova Meta / Sonho',
      sublabel: 'Criar um objetivo financeiro ou reserva especial',
      icon: 'flag',
      color: '#d8b87e',
      component: FormularioMetaComponent,
    },
    {
      id: 'projeto',
      label: 'Novo Projeto',
      sublabel: 'Planejar reforma, viagem ou grande evento',
      icon: 'account_tree',
      color: '#8b5cf6',
      component: FormularioProjetoComponent,
    },
    {
      id: 'desejo',
      label: 'Novo Desejo na Wishlist',
      sublabel: 'Adicionar item para desafio de esfriamento consciente',
      icon: 'favorite',
      color: '#ec4899',
      component: FormularioWishlistComponent,
    },
  ];

  executarAcao(item: QuickActionOption): void {
    this.haptics.impactMedium();
    this.overlay.close();
    setTimeout(() => {
      this.overlay.openBottomSheet({ component: item.component });
    }, 150);
  }

  fechar(): void {
    this.overlay.close();
  }
}
