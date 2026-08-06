import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { UserContextService } from '../../core/services/user-context.service';
import { FabActionRegistryService } from '../../core/services/fab-action-registry.service';
import { ToastService } from '../../core/services/toast.service';
import { OverlayService } from '../../core/services/overlay.service';
import { PlatformService } from '../../core/platform/platform.service';
import { BottomNavigationComponent } from '../../shared/components/bottom-navigation/bottom-navigation.component';
import { FabButtonComponent } from '../../shared/components/fab-button/fab-button.component';
import { BottomSheetComponent } from '../../shared/components/bottom-sheet/bottom-sheet.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { OfflineBannerComponent } from '../../shared/components/offline-banner/offline-banner.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    BottomNavigationComponent,
    FabButtonComponent,
    BottomSheetComponent,
    ToastComponent,
    OfflineBannerComponent,
  ],
  template: `
    <app-offline-banner></app-offline-banner>
    <app-toast></app-toast>
    <app-bottom-sheet></app-bottom-sheet>

    <div class="app-shell-container">
      <!-- Header Bar Encapsulada -->
      <header class="app-header">
        <div class="brand-group">
          <div class="brand-icon-box">
            <span class="material-symbols-rounded">foundation</span>
          </div>
          <div class="brand-title-wrap">
            <span class="brand-title">ALICERCE</span>
            <span class="brand-tag">MOBILE FIRST</span>
          </div>
        </div>

        <div class="workspace-pill">
          <span class="material-symbols-rounded pill-icon">roofing</span>
          <span class="pill-text">{{ userContext.workspaceName() }}</span>
        </div>

        <div class="header-actions">
          <button class="icon-btn" (click)="themeService.toggleTheme()" title="Alternar Tema">
            <span class="material-symbols-rounded">
              {{ themeService.currentTheme() === 'dark' ? 'light_mode' : 'dark_mode' }}
            </span>
          </button>

          <div class="avatar-ring" [title]="userContext.userName()">
            <span>{{ userContext.avatarInitial() }}</span>
          </div>
        </div>
      </header>

      <!-- Área de Conteúdo Principal -->
      <main class="app-content">
        <router-outlet></router-outlet>
      </main>

      <!-- Ações Globais & Navegação Mobile -->
      <app-fab-button></app-fab-button>
      <app-bottom-navigation></app-bottom-navigation>
    </div>
  `,
  styles: [`
    .app-shell-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background-color: var(--alic-color-bg-dark);
      position: relative;
    }

    .app-header {
      height: calc(56px + var(--sat));
      padding-top: var(--sat);
      padding-left: 16px;
      padding-right: 16px;
      background: rgba(24, 7, 10, 0.94);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(216, 184, 126, 0.25);
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 90;
    }

    .brand-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .brand-icon-box {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      background: var(--alic-color-gold-gradient);
      color: #2b0b10;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--alic-shadow-gold-glow);

      span { font-size: 20px; font-weight: 700; }
    }

    .brand-title {
      font-size: 16px;
      font-weight: 800;
      letter-spacing: 2px;
      background: var(--alic-color-gold-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .brand-tag {
      display: block;
      font-size: 8px;
      font-weight: 800;
      letter-spacing: 1px;
      color: rgba(235, 217, 182, 0.6);
    }

    .workspace-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(216, 184, 126, 0.12);
      border: 1px solid rgba(216, 184, 126, 0.3);
      padding: 6px 12px;
      border-radius: 9999px;
      color: var(--alic-color-gold-light);
      font-size: 12px;
      font-weight: 600;

      .pill-icon { font-size: 16px; color: var(--alic-color-gold-main); }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .icon-btn {
      background: none;
      border: none;
      color: var(--alic-color-gold-light);
      cursor: pointer;
      padding: 6px;
      display: flex;
      align-items: center;
      justify-content: center;

      span { font-size: 22px; }
    }

    .avatar-ring {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: rgba(146, 38, 56, 0.5);
      border: 2px solid var(--alic-color-gold-main);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 13px;
      color: #ffffff;
    }

    .app-content {
      flex: 1;
      padding-bottom: calc(70px + var(--sab));
    }
  `],
})
export class AppShellComponent implements OnInit {
  readonly userContext = inject(UserContextService);
  readonly themeService = inject(ThemeService);
  readonly platformService = inject(PlatformService);
  private readonly fabRegistry = inject(FabActionRegistryService);
  private readonly toastService = inject(ToastService);

  ngOnInit(): void {
    // Registro Dinâmico Inicial de Ações do FAB por Prioridade (ADR-025 & Refinamento Sprint 1.5)
    this.fabRegistry.registerAction({
      id: 'nova-despesa',
      label: '+ Nova Despesa',
      icon: 'arrow_downward',
      color: '#4a121a',
      priority: 100,
      execute: () => {
        this.toastService.showWarning('Formulário de Despesa (Sprint 4.1)');
      },
    });

    this.fabRegistry.registerAction({
      id: 'nova-receita',
      label: '+ Nova Receita',
      icon: 'arrow_upward',
      color: '#10b981',
      priority: 90,
      execute: () => {
        this.toastService.showSuccess('Formulário de Receita (Sprint 4.1)', 'DESFAZER', () => {
          this.toastService.showWarning('Ação desfeita!');
        });
      },
    });

    this.fabRegistry.registerAction({
      id: 'nova-meta',
      label: '+ Nova Meta',
      icon: 'flag',
      color: '#d8b87e',
      priority: 80,
      execute: () => {
        this.toastService.showSuccess('Formulário de Meta (Sprint 5.1)');
      },
    });
  }
}
