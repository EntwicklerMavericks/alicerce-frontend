import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-futuro-container-page',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="futuro-container">
      <!-- Sub-navegação horizontal por abas -->
      <nav class="sub-nav-tabs">
        <a routerLink="planning" routerLinkActive="active" class="sub-tab">
          <span class="material-symbols-rounded tab-icon">timeline</span>
          <span>Agenda & Forecast</span>
        </a>

        <a routerLink="metas" routerLinkActive="active" class="sub-tab">
          <span class="material-symbols-rounded tab-icon">flag</span>
          <span>Metas</span>
        </a>

        <a routerLink="wishlist" routerLinkActive="active" class="sub-tab">
          <span class="material-symbols-rounded tab-icon">favorite</span>
          <span>Wishlist</span>
        </a>

        <a routerLink="projetos" routerLinkActive="active" class="sub-tab">
          <span class="material-symbols-rounded tab-icon">account_tree</span>
          <span>Projetos</span>
        </a>

        <a routerLink="orcamentos" routerLinkActive="active" class="sub-tab">
          <span class="material-symbols-rounded tab-icon">pie_chart</span>
          <span>Orçamentos</span>
        </a>
      </nav>

      <!-- Conteúdo do sub-módulo selecionado -->
      <div class="futuro-content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .futuro-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      box-sizing: border-box;
    }

    .sub-nav-tabs {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(24, 7, 10, 0.96);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(216, 184, 126, 0.2);
      padding: 6px 12px;
      position: sticky;
      top: 0;
      z-index: 90;
      flex-shrink: 0;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;

      &::-webkit-scrollbar {
        display: none;
      }
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
      flex-shrink: 0;

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

    .futuro-content {
      flex: 1;
      width: 100%;
      box-sizing: border-box;
    }
  `],
})
export class FuturoContainerPage {}
