import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarteirasStore } from '../store/carteiras.store';
import { OverlayService } from '../../../core/services/overlay.service';
import { ToastService } from '../../../core/services/toast.service';
import { HapticsService } from '../../../core/platform/haptics.service';
import { PullToRefreshDirective } from '../../../shared/directives/pull-to-refresh.directive';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { FormularioCarteiraComponent } from '../components/formulario-carteira.component';
import { TransferenciaCarteiraComponent } from '../components/transferencia-carteira.component';
import { Carteira } from '../../../core/models/carteira.models';

@Component({
  selector: 'app-carteiras-page',
  standalone: true,
  imports: [
    CommonModule,
    PullToRefreshDirective,
    SkeletonComponent,
    ButtonComponent,
    BadgeComponent,
  ],
  template: `
    <div class="page-container" appPullToRefresh (refresh)="onRefresh()">
      <!-- Hero Banner Liquidez Total com Olho Mágico -->
      <div class="liquidity-hero-card glass-card gold-border animate-fade-in">
        <div class="hero-top">
          <span class="hero-label">LIQUIDEZ TOTAL CONSOLIDADA</span>
          <button class="eye-toggle-btn" (click)="toggleOlhoMagico()" title="Alternar Visibilidade">
            <span class="material-symbols-rounded">
              {{ carteirasStore.esconderSaldos() ? 'visibility_off' : 'visibility' }}
            </span>
          </button>
        </div>

        <h1 class="hero-total-value">
          @if (carteirasStore.esconderSaldos()) {
            ••••••••
          } @else {
            {{ carteirasStore.saldoTotalConsolidado() | currency:'BRL':'symbol':'1.2-2' }}
          }
        </h1>
        <p class="hero-subtext">Soma do saldo projetado em todas as contas e reservas</p>

        <div class="hero-quick-actions">
          <app-button
            variant="primary-gold"
            size="sm"
            icon="sync_alt"
            (btnClick)="abrirTransferencia()">
            Transferir
          </app-button>

          <app-button
            variant="secondary-glass"
            size="sm"
            icon="add_card"
            (btnClick)="abrirFormulario()">
            + Nova Conta
          </app-button>
        </div>
      </div>

      <!-- Header da Lista -->
      <div class="list-header">
        <div class="header-left">
          <h2>Contas & Carteiras</h2>
          <span class="subtext">Saldos e custódia financeira</span>
        </div>
      </div>

      <!-- Estado de Carregamento Skeleton -->
      @if (carteirasStore.carregando() && carteirasStore.carteiras().length === 0) {
        <div class="skeleton-list">
          <app-skeleton type="card"></app-skeleton>
          <app-skeleton type="card"></app-skeleton>
        </div>
      }

      <!-- Grid de Carteiras -->
      <div class="carteiras-grid">
        @for (carteira of carteirasStore.carteiras(); track carteira.id) {
          <div
            class="carteira-card glass-card touch-active animate-fade-in"
            [class.negative-warning]="carteira.saldoNegativoAlerta">
            <div class="card-left">
              <div class="card-icon-box" [style.background]="carteira.cor">
                <span class="material-symbols-rounded">{{ carteira.icone }}</span>
              </div>
              <div class="card-details">
                <div class="title-row">
                  <h3 class="carteira-name">{{ carteira.nome }}</h3>
                  @if (carteira.padrao) {
                    <app-badge variant="gold">PADRÃO</app-badge>
                  }
                </div>
                <span class="carteira-type">{{ getTipoRotulo(carteira.tipo) }}</span>
              </div>
            </div>

            <div class="card-right">
              <span class="salary-value" [class.negative]="carteira.saldoCalculado < 0">
                @if (carteirasStore.esconderSaldos()) {
                  ••••••
                } @else {
                  {{ carteira.saldoCalculado | currency:'BRL':'symbol':'1.2-2' }}
                }
              </span>

              @if (carteira.saldoNegativoAlerta) {
                <span class="warning-tag">Saldo Negativo</span>
              }
            </div>

            <button class="delete-btn" (click)="removerCarteira(carteira)" title="Remover Conta">
              <span class="material-symbols-rounded">delete</span>
            </button>
          </div>
        } @empty {
          @if (!carteirasStore.carregando()) {
            <div class="empty-state glass-card animate-fade-in">
              <span class="material-symbols-rounded empty-icon">account_balance_wallet</span>
              <h3>Nenhuma carteira cadastrada</h3>
              <p>Cadastre suas contas bancárias, caixinhas ou carteiras digitais.</p>
              <app-button variant="primary-gold" icon="add" (btnClick)="abrirFormulario()">
                Cadastrar Primeira Conta
              </app-button>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      min-height: 100%;
    }

    .liquidity-hero-card {
      padding: 24px 20px;
      background: linear-gradient(135deg, rgba(28, 12, 16, 0.95) 0%, rgba(74, 18, 26, 0.8) 100%);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .hero-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .hero-label {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1.5px;
      color: rgba(235, 217, 182, 0.7);
    }

    .eye-toggle-btn {
      background: none;
      border: none;
      color: var(--alic-color-gold-light);
      cursor: pointer;
      padding: 4px;
      span { font-size: 20px; }
    }

    .hero-total-value {
      font-family: var(--alic-font-family-mono);
      font-size: 32px;
      font-weight: 800;
      margin: 0;
      background: var(--alic-color-gold-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero-subtext {
      font-size: 12px;
      color: rgba(235, 217, 182, 0.6);
      margin: 0;
    }

    .hero-quick-actions {
      display: flex;
      gap: 10px;
      margin-top: 8px;
    }

    .list-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      h2 { font-size: 18px; font-weight: 700; margin: 0; color: #ffffff; }
      .subtext { font-size: 12px; color: var(--color-text-tertiary); display: block; }
    }

    .skeleton-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .carteiras-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .carteira-card {
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      position: relative;

      &.negative-warning {
        border-color: rgba(244, 63, 94, 0.4);
      }
    }

    .card-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .card-icon-box {
      width: 44px;
      height: 44px;
      border-radius: var(--alic-radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      box-shadow: var(--alic-shadow-md);
      span { font-size: 24px; }
    }

    .card-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .title-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .carteira-name {
      font-size: 15px;
      font-weight: 700;
      margin: 0;
      color: #ffffff;
    }

    .carteira-type {
      font-size: 11px;
      color: var(--color-text-tertiary);
    }

    .card-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .salary-value {
      font-family: var(--alic-font-family-mono);
      font-size: 16px;
      font-weight: 700;
      color: var(--alic-color-gold-light);

      &.negative {
        color: #f43f5e;
      }
    }

    .warning-tag {
      font-size: 10px;
      font-weight: 700;
      color: #f43f5e;
    }

    .delete-btn {
      background: none;
      border: none;
      color: rgba(244, 63, 94, 0.6);
      cursor: pointer;
      padding: 6px;
      span { font-size: 18px; }
    }

    .empty-state {
      padding: 40px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 12px;

      .empty-icon { font-size: 48px; color: var(--alic-color-gold-main); }
      h3 { margin: 0; font-size: 18px; color: #ffffff; }
      p { margin: 0; font-size: 13px; color: var(--color-text-tertiary); }
    }
  `],
})
export class CarteirasPage implements OnInit {
  readonly carteirasStore = inject(CarteirasStore);
  private readonly overlayService = inject(OverlayService);
  private readonly toastService = inject(ToastService);
  private readonly haptics = inject(HapticsService);

  ngOnInit(): void {
    this.carteirasStore.carregarCarteiras();
  }

  onRefresh(): void {
    this.carteirasStore.carregarCarteiras();
  }

  toggleOlhoMagico(): void {
    this.haptics.impactLight();
    this.carteirasStore.toggleOlhoMagico();
  }

  abrirFormulario(): void {
    this.haptics.impactLight();
    this.overlayService.openBottomSheet({
      component: FormularioCarteiraComponent,
      title: 'Nova Carteira / Conta',
    });
  }

  abrirTransferencia(): void {
    this.haptics.impactLight();
    this.overlayService.openBottomSheet({
      component: TransferenciaCarteiraComponent,
      title: 'Transferência Entre Contas',
    });
  }

  async removerCarteira(carteira: Carteira): Promise<void> {
    this.haptics.impactMedium();
    const ok = await this.carteirasStore.removerCarteira(carteira.id);
    if (ok) {
      this.toastService.showSuccess(`Conta "${carteira.nome}" desativada.`, 'DESFAZER');
    }
  }

  getTipoRotulo(tipo: string): string {
    switch (tipo) {
      case 'CARTEIRA_DIGITAL': return 'Carteira Digital';
      case 'POUPANCA': return 'Poupança';
      case 'INVESTIMENTO': return 'Investimentos';
      case 'DINHEIRO': return 'Dinheiro / Caixinha';
      case 'CARTAO_CREDITO': return 'Cartão de Crédito';
      case 'CONTA_CORRENTE':
      default: return 'Conta Corrente';
    }
  }
}
