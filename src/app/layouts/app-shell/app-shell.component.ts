import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { UserContextService } from '../../core/services/user-context.service';
import { FabActionRegistryService } from '../../core/services/fab-action-registry.service';
import { ToastService } from '../../core/services/toast.service';
import { OverlayService } from '../../core/services/overlay.service';
import { PlatformService } from '../../core/platform/platform.service';
import { AlertasStore } from '../../features/alertas/store/alertas.store';
import { BottomNavigationComponent } from '../../shared/components/bottom-navigation/bottom-navigation.component';
import { BottomSheetComponent } from '../../shared/components/bottom-sheet/bottom-sheet.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { OfflineBannerComponent } from '../../shared/components/offline-banner/offline-banner.component';
import { UserProfileComponent } from '../../shared/components/user-profile/user-profile.component';

import { FormularioDespesaComponent } from '../../features/lancamentos/components/formulario-despesa.component';
import { FormularioReceitaComponent } from '../../features/lancamentos/components/formulario-receita.component';
import { FormularioMetaComponent } from '../../features/metas/components/formulario-meta.component';
import { FormularioProjetoComponent } from '../../features/projetos/components/formulario-projeto.component';
import { FormularioWishlistComponent } from '../../features/wishlist/components/formulario-wishlist.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    BottomNavigationComponent,
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

        <div class="workspace-pill" (click)="abrirMenuUsuario()" title="Opções do Workspace">
          <span class="material-symbols-rounded pill-icon">roofing</span>
          <span class="pill-text">{{ userContext.workspaceName() }}</span>
          <span class="material-symbols-rounded pill-arrow">expand_more</span>
        </div>

        <div class="header-actions">
          <button class="icon-btn notification-btn" [routerLink]="['/alertas']" title="Central de Alertas">
            <span class="material-symbols-rounded">notifications</span>
            @if (alertasStore.countNaoLidos() > 0) {
              <span class="badge-count">{{ alertasStore.countNaoLidos() > 99 ? '99+' : alertasStore.countNaoLidos() }}</span>
            }
          </button>

          <button class="icon-btn" (click)="themeService.toggleTheme()" title="Alternar Tema">
            <span class="material-symbols-rounded">
              {{ themeService.currentTheme() === 'dark' ? 'light_mode' : 'dark_mode' }}
            </span>
          </button>

          <div class="avatar-ring" (click)="abrirMenuUsuario()" [title]="userContext.userName()">
            <span>{{ userContext.avatarInitial() }}</span>
          </div>
        </div>
      </header>

      <!-- Área de Conteúdo Principal -->
      <main class="app-content">
        <router-outlet></router-outlet>
      </main>

      <!-- Navegação Mobile -->
      <app-bottom-navigation></app-bottom-navigation>
    </div>
  `,
  styles: [`
    .app-shell-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      height: 100dvh;
      width: 100vw;
      max-width: 100%;
      background-color: var(--alic-color-bg-dark);
      position: relative;
      overflow: hidden;
    }

    .app-header {
      height: calc(56px + var(--sat));
      padding-top: var(--sat);
      padding-left: 8px;
      padding-right: 8px;
      background: rgba(24, 7, 10, 0.94);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(216, 184, 126, 0.25);
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      flex-shrink: 0;
      width: 100%;
      z-index: 100;
      box-sizing: border-box;
      gap: 4px;
    }

    .brand-group {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
      min-width: 0;
    }

    .brand-icon-box {
      width: 30px;
      height: 30px;
      border-radius: 10px;
      background: var(--alic-color-gold-gradient);
      color: #2b0b10;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--alic-shadow-gold-glow);
      flex-shrink: 0;

      span { font-size: 16px; font-weight: 700; }
    }

    .brand-title {
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 1.2px;
      background: var(--alic-color-gold-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .brand-tag {
      display: block;
      font-size: 7px;
      font-weight: 800;
      letter-spacing: 1px;
      color: rgba(235, 217, 182, 0.6);

      @media (max-width: 400px) {
        display: none;
      }
    }

    .workspace-pill {
      display: flex;
      align-items: center;
      gap: 3px;
      background: rgba(216, 184, 126, 0.12);
      border: 1px solid rgba(216, 184, 126, 0.3);
      padding: 3px 6px;
      border-radius: 9999px;
      color: var(--alic-color-gold-light);
      font-size: 10px;
      font-weight: 700;
      cursor: pointer;
      max-width: 100px;
      height: 26px;
      box-sizing: border-box;
      transition: all 0.2s ease;
      flex-shrink: 1;
      min-width: 0;

      &:hover {
        background: rgba(216, 184, 126, 0.22);
      }

      .pill-icon {
        font-size: 13px;
        color: var(--alic-color-gold-main);
        flex-shrink: 0;
      }

      .pill-text {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 1;
        line-height: 1;
        min-width: 0;
      }

      .pill-arrow {
        font-size: 12px;
        color: rgba(235, 217, 182, 0.6);
        flex-shrink: 0;
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }

    .icon-btn {
      background: none;
      border: none;
      color: var(--alic-color-gold-light);
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;

      span { font-size: 20px; }
    }

    .notification-btn {
      position: relative;
    }

    .badge-count {
      position: absolute;
      top: -2px;
      right: -2px;
      background: #A13D63;
      color: #ffffff;
      font-size: 9px;
      font-weight: 800;
      min-width: 15px;
      height: 15px;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 3px;
      box-shadow: 0 0 8px rgba(161, 61, 99, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.3);
      line-height: 1;
    }

    .avatar-ring {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(146, 38, 56, 0.5);
      border: 2px solid var(--alic-color-gold-main);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 12px;
      color: #ffffff;
      cursor: pointer;
      transition: transform 0.2s ease;
      flex-shrink: 0;

      &:hover {
        transform: scale(1.08);
      }
    }

    .app-content {
      flex: 1;
      width: 100%;
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      padding-bottom: calc(200px + var(--sab));
      box-sizing: border-box;
    }
  `],
})
export class AppShellComponent implements OnInit {
  readonly userContext = inject(UserContextService);
  readonly themeService = inject(ThemeService);
  readonly platformService = inject(PlatformService);
  readonly alertasStore = inject(AlertasStore);
  private readonly fabRegistry = inject(FabActionRegistryService);
  private readonly toastService = inject(ToastService);
  private readonly overlayService = inject(OverlayService);

  ngOnInit(): void {
    // Carregar contagem de alertas não lidos no header
    this.alertasStore.carregarContagemNaoLidos();

    // Registro Dinâmico Inicial de Ações do FAB por Prioridade
    this.fabRegistry.registerAction({
      id: 'nova-despesa',
      label: '+ Nova Despesa',
      icon: 'arrow_downward',
      color: '#4a121a',
      priority: 100,
      execute: () => {
        this.overlayService.openBottomSheet({ component: FormularioDespesaComponent });
      },
    });

    this.fabRegistry.registerAction({
      id: 'nova-receita',
      label: '+ Nova Receita',
      icon: 'arrow_upward',
      color: '#10b981',
      priority: 90,
      execute: () => {
        this.overlayService.openBottomSheet({ component: FormularioReceitaComponent });
      },
    });

    this.fabRegistry.registerAction({
      id: 'nova-meta',
      label: '+ Nova Meta',
      icon: 'flag',
      color: '#d8b87e',
      priority: 80,
      execute: () => {
        this.overlayService.openBottomSheet({ component: FormularioMetaComponent });
      },
    });

    this.fabRegistry.registerAction({
      id: 'novo-projeto',
      label: '+ Novo Projeto',
      icon: 'account_tree',
      color: '#F59E0B',
      priority: 70,
      execute: () => {
        this.overlayService.openBottomSheet({ component: FormularioProjetoComponent });
      },
    });

    this.fabRegistry.registerAction({
      id: 'novo-desejo',
      label: '+ Novo Desejo',
      icon: 'favorite',
      color: '#EC4899',
      priority: 60,
      execute: () => {
        this.overlayService.openBottomSheet({ component: FormularioWishlistComponent });
      },
    });
  }

  abrirMenuUsuario(): void {
    this.overlayService.openBottomSheet({ component: UserProfileComponent });
  }
}

