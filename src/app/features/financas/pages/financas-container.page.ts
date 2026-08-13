import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-financas-container-page',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="financas-container">
      <!-- Sub-navegação por abas de segmento -->
      <nav class="sub-nav-tabs">
        <a routerLink="transacoes" routerLinkActive="active" class="sub-tab">
          <span class="material-symbols-rounded tab-icon">receipt_long</span>
          <span>Lançamentos</span>
        </a>

        <a routerLink="cartoes" routerLinkActive="active" class="sub-tab">
          <span class="material-symbols-rounded tab-icon">credit_card</span>
          <span>Cartões</span>
        </a>

        <a routerLink="carteiras" routerLinkActive="active" class="sub-tab">
          <span class="material-symbols-rounded tab-icon">account_balance_wallet</span>
          <span>Carteiras</span>
        </a>
      </nav>

      <!-- Conteúdo do sub-módulo selecionado -->
      <div class="financas-content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .financas-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      box-sizing: border-box;
    }

    .sub-nav-tabs {
      display: flex;
      align-items: center;
      justify-content: space-around;
      background: rgba(24, 7, 10, 0.96);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(216, 184, 126, 0.2);
      padding: 6px 12px;
      position: sticky;
      top: 0;
      z-index: 90;
      flex-shrink: 0;
    }

    .sub-tab {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 999px;
      color: rgba(235, 217, 182, 0.6);
      text-decoration: none;
      font-size: 12px;
      font-weight: 700;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      white-space: nowrap;

      .tab-icon {
        font-size: 18px;
        transition: transform 0.2s ease;
      }

      &:hover {
        color: var(--alic-color-gold-light, #ebd9b6);
        background: rgba(216, 184, 126, 0.1);
      }

      &.active {
        background: var(--alic-color-gold-gradient, linear-gradient(135deg, #d8b87e 0%, #c9a74e 100%));
        color: #2b0b10;
        box-shadow: 0 4px 12px rgba(201, 167, 78, 0.3);

        .tab-icon {
          color: #2b0b10;
          transform: scale(1.1);
        }
      }
    }

    .financas-content {
      flex: 1;
      width: 100%;
      box-sizing: border-box;
    }
  `],
})
export class FinancasContainerPage {}
