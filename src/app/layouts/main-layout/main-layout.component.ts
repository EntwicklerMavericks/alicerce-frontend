import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { AuthStore } from '../../features/auth/store/auth.store';
import { OfflineBannerComponent } from '../../shared/components/offline-banner/offline-banner.component';
import { PlatformService } from '../../core/platform/platform.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, OfflineBannerComponent],
  template: `
    <app-offline-banner></app-offline-banner>
    <div class="app-container">
      <!-- Top App Bar with Deep Vinho & Champagne Accents -->
      <header class="top-bar">
        <div class="brand-group">
          <div class="brand-icon-wrapper">
            <span class="material-symbols-rounded brand-icon">foundation</span>
          </div>
          <div class="brand-text">
            <span class="brand-title">ALICERCE</span>
            <span class="brand-badge">GOAL-BASED FINANCE</span>
          </div>
        </div>

        <div class="header-center">
          <div class="workspace-chip">
            <span class="material-symbols-rounded chip-icon">roofing</span>
            <span class="chip-label">{{ authStore.nomeWorkspace() }}</span>
            <span class="material-symbols-rounded chip-arrow">arrow_drop_down</span>
          </div>
        </div>

        <div class="top-actions">
          <button class="action-btn theme-toggle" (click)="themeService.toggleTheme()" [title]="'Alternar Tema'">
            <span class="material-symbols-rounded">
              {{ themeService.currentTheme() === 'dark' ? 'light_mode' : 'dark_mode' }}
            </span>
          </button>
          
          <button class="action-btn notification-btn" title="Alertas">
            <span class="material-symbols-rounded">notifications</span>
            <span class="notification-badge">3</span>
          </button>

          <button class="action-btn logout-btn" (click)="authStore.logout()" title="Sair da Conta">
            <span class="material-symbols-rounded">logout</span>
          </button>

          <div class="user-avatar-wrapper" [title]="authStore.nomeUsuario()">
            <div class="avatar-ring">
              <span class="avatar-initials">{{ authStore.nomeUsuario().charAt(0) || 'U' }}</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Layout Body -->
      <div class="main-body">
        <!-- Desktop Sidebar Navigation -->
        <aside class="sidebar desktop-only">
          <div class="nav-section-title">PRINCIPAL</div>
          <nav class="nav-menu">
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
              <div class="nav-icon-box"><span class="material-symbols-rounded">grid_view</span></div>
              <span>Dashboard</span>
            </a>
            <a routerLink="/planning" routerLinkActive="active" class="nav-item">
              <div class="nav-icon-box"><span class="material-symbols-rounded">calendar_month</span></div>
              <span>Planejamento</span>
            </a>
            <a routerLink="/goals" routerLinkActive="active" class="nav-item">
              <div class="nav-icon-box"><span class="material-symbols-rounded">flag</span></div>
              <span>Metas</span>
              <span class="nav-badge">3</span>
            </a>
            <a routerLink="/projects" routerLinkActive="active" class="nav-item">
              <div class="nav-icon-box"><span class="material-symbols-rounded">construction</span></div>
              <span>Projetos</span>
              <span class="nav-pill-gold">Casa</span>
            </a>

            <div class="nav-section-title">FINANCEIRO</div>
            <a routerLink="/wallets" routerLinkActive="active" class="nav-item">
              <div class="nav-icon-box"><span class="material-symbols-rounded">account_balance_wallet</span></div>
              <span>Carteiras</span>
            </a>
            <a routerLink="/cards" routerLinkActive="active" class="nav-item">
              <div class="nav-icon-box"><span class="material-symbols-rounded">credit_card</span></div>
              <span>Cartões</span>
            </a>
            <a routerLink="/wishlist" routerLinkActive="active" class="nav-item">
              <div class="nav-icon-box"><span class="material-symbols-rounded">shopping_bag</span></div>
              <span>Wishlist</span>
              <span class="nav-badge">12</span>
            </a>
          </nav>

          <div class="sidebar-footer">
            <div class="gold-card-mini">
              <span class="gold-card-title">Reserva de Emergência</span>
              <div class="gold-card-progress">
                <div class="progress-bar-inner" style="width: 78%;"></div>
              </div>
              <span class="gold-card-val">78% Atingido</span>
            </div>
          </div>
        </aside>

        <!-- Page Content View -->
        <main class="content-area">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Mobile Bottom Navigation Bar -->
      <nav class="bottom-nav mobile-only">
        <a routerLink="/dashboard" routerLinkActive="active" class="bottom-nav-item">
          <span class="material-symbols-rounded">grid_view</span>
          <span>Início</span>
        </a>
        <a routerLink="/planning" routerLinkActive="active" class="bottom-nav-item">
          <span class="material-symbols-rounded">calendar_month</span>
          <span>Agenda</span>
        </a>
        <div class="fab-slot">
          <button class="fab-button" title="Novo Lançamento">
            <span class="material-symbols-rounded">add</span>
          </button>
        </div>
        <a routerLink="/goals" routerLinkActive="active" class="bottom-nav-item">
          <span class="material-symbols-rounded">flag</span>
          <span>Metas</span>
        </a>
        <a routerLink="/projects" routerLinkActive="active" class="bottom-nav-item">
          <span class="material-symbols-rounded">construction</span>
          <span>Projetos</span>
        </a>
      </nav>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
      background: var(--color-bg-page);
    }

    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 28px;
      background: var(--color-bg-header);
      border-bottom: 1px solid var(--color-border-glass);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
      z-index: 100;
    }

    .brand-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-icon-wrapper {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      background: linear-gradient(135deg, #d8b87e 0%, #9e7d44 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-gold-glow);
    }

    .brand-icon {
      color: #2b0b10;
      font-size: 24px;
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-title {
      font-family: var(--font-primary);
      font-size: 22px;
      font-weight: 800;
      letter-spacing: 2.5px;
      background: linear-gradient(135deg, #ebd9b6 0%, #d8b87e 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .brand-badge {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 1.5px;
      color: rgba(235, 217, 182, 0.7);
    }

    .workspace-chip {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 16px;
      border-radius: var(--radius-full);
      background: rgba(216, 184, 126, 0.12);
      border: 1px solid rgba(216, 184, 126, 0.25);
      color: var(--color-champagne-light);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: rgba(216, 184, 126, 0.22);
        box-shadow: 0 0 15px rgba(216, 184, 126, 0.2);
      }

      .chip-icon { font-size: 18px; color: var(--color-champagne-main); }
      .chip-arrow { font-size: 20px; color: rgba(235, 217, 182, 0.6); }
    }

    .top-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .action-btn {
      position: relative;
      width: 40px;
      height: 40px;
      border-radius: var(--radius-full);
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(216, 184, 126, 0.2);
      color: var(--color-champagne-light);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: rgba(216, 184, 126, 0.2);
        transform: translateY(-2px);
      }
    }

    .notification-badge {
      position: absolute;
      top: 4px;
      right: 4px;
      background: var(--color-negative);
      color: white;
      font-size: 10px;
      font-weight: 700;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .user-avatar-wrapper {
      cursor: pointer;
    }

    .avatar-ring {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #d8b87e 0%, #6b1b27 100%);
      padding: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .avatar-initials {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: #230b10;
      color: var(--color-champagne-main);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 15px;
    }

    .main-body {
      display: flex;
      flex: 1;
      overflow: hidden;
      background: radial-gradient(circle at 80% 20%, rgba(74, 18, 26, 0.25) 0%, transparent 60%);
    }

    .sidebar {
      width: 260px;
      background: var(--color-bg-glass);
      backdrop-filter: var(--glass-blur);
      border-right: 1px solid var(--color-border-glass);
      display: flex;
      flex-direction: column;
      padding: 20px 14px;
    }

    .nav-section-title {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1.5px;
      color: var(--color-text-tertiary);
      padding: 12px 14px 6px 14px;
    }

    .nav-menu {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: var(--radius-md);
      color: var(--color-text-secondary);
      text-decoration: none;
      font-weight: 500;
      font-size: 14px;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;

      .nav-icon-box {
        width: 32px;
        height: 32px;
        border-radius: 10px;
        background: rgba(216, 184, 126, 0.08);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-text-secondary);
        transition: all 0.25s;
        
        span { font-size: 20px; }
      }

      &:hover {
        background: rgba(216, 184, 126, 0.12);
        color: var(--color-text-primary);
        transform: translateX(4px);

        .nav-icon-box {
          background: var(--color-primary-gradient);
          color: var(--color-champagne-light);
        }
      }

      &.active {
        background: var(--color-primary-gradient);
        color: #ffffff;
        font-weight: 700;
        box-shadow: var(--shadow-bordo-glow);

        .nav-icon-box {
          background: rgba(216, 184, 126, 0.25);
          color: var(--color-champagne-main);
        }
      }
    }

    .nav-badge {
      margin-left: auto;
      background: rgba(216, 184, 126, 0.2);
      color: var(--color-champagne-main);
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 12px;
    }

    .nav-pill-gold {
      margin-left: auto;
      background: var(--color-gold-gradient);
      color: #2b0b10;
      font-size: 10px;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 10px;
      text-transform: uppercase;
    }

    .sidebar-footer {
      margin-top: auto;
      padding-top: 16px;
    }

    .gold-card-mini {
      background: linear-gradient(135deg, rgba(74, 18, 26, 0.6) 0%, rgba(30, 10, 14, 0.8) 100%);
      border: 1px solid rgba(216, 184, 126, 0.3);
      border-radius: var(--radius-md);
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      box-shadow: var(--shadow-sm);
    }

    .gold-card-title {
      font-size: 12px;
      font-weight: 700;
      color: var(--color-champagne-light);
    }

    .gold-card-progress {
      height: 6px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-bar-inner {
      height: 100%;
      background: var(--color-gold-gradient);
      border-radius: 4px;
    }

    .gold-card-val {
      font-size: 11px;
      color: var(--color-champagne-main);
      font-weight: 600;
    }

    .content-area {
      flex: 1;
      overflow-y: auto;
      padding: 28px;
    }

    /* Mobile Navigation */
    .mobile-only { display: none; }
    .desktop-only { display: flex; }

    @media (max-width: 768px) {
      .desktop-only { display: none !important; }
      .mobile-only { display: flex !important; }
      .header-center { display: none; }
      
      .content-area {
        padding: 16px;
        padding-bottom: 90px;
      }

      .bottom-nav {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 68px;
        background: var(--color-bg-header);
        border-top: 1px solid var(--color-border-glass);
        display: flex;
        justify-content: space-around;
        align-items: center;
        z-index: 1000;
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.5);
      }

      .bottom-nav-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        font-size: 10px;
        color: var(--color-text-tertiary);
        text-decoration: none;

        span { font-size: 22px; }
        &.active { color: var(--color-champagne-main); font-weight: 700; }
      }

      .fab-slot {
        position: relative;
        top: -18px;
      }

      .fab-button {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background: var(--color-gold-gradient);
        color: #2b0b10;
        border: none;
        box-shadow: var(--shadow-gold-glow);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;

        span { font-size: 28px; font-weight: 700; }
      }
    }
  `],
})
export class MainLayoutComponent {
  readonly themeService = inject(ThemeService);
  readonly authStore = inject(AuthStore);
  readonly platformService = inject(PlatformService);
}
