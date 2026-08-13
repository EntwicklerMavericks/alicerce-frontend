import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserContextService } from '../../../core/services/user-context.service';
import { ThemeService } from '../../../core/services/theme.service';
import { CarteirasStore } from '../../carteiras/store/carteiras.store';
import { AuthStore } from '../../auth/store/auth.store';
import { OverlayService } from '../../../core/services/overlay.service';
import { ToastService } from '../../../core/services/toast.service';
import { UserProfileComponent } from '../../../shared/components/user-profile/user-profile.component';

@Component({
  selector: 'app-mais-hub-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="mais-page-container">
      <!-- Banner Hero -->
      <section class="hero-banner">
        <div class="user-card" (click)="abrirPerfil()">
          <div class="avatar-large">
            <span>{{ userContext.avatarInitial() }}</span>
          </div>
          <div class="user-info">
            <h2 class="user-name">{{ userContext.userName() }}</h2>
            <span class="user-email">{{ userContext.userEmail() }}</span>
            <div class="workspace-pill">
              <span class="material-symbols-rounded">roofing</span>
              <span>{{ userContext.workspaceName() }}</span>
            </div>
          </div>
          <span class="material-symbols-rounded chevron-right">chevron_right</span>
        </div>
      </section>

      <!-- Grid de Ferramentas Estruturais -->
      <section class="section-group">
        <h3 class="group-title">FERRAMENTAS & ESTRUTURA</h3>
        
        <div class="tools-grid">
          <!-- Categorias -->
          <a routerLink="/categorias" class="tool-card">
            <div class="tool-icon-box" style="background: rgba(216, 184, 126, 0.15); color: #d8b87e;">
              <span class="material-symbols-rounded">category</span>
            </div>
            <div class="tool-info">
              <h4 class="tool-name">Categorias</h4>
              <span class="tool-sub">Classificação e regras</span>
            </div>
            <span class="material-symbols-rounded arrow">arrow_forward</span>
          </a>

          <!-- Produtos & Lojas -->
          <a routerLink="/produtos" class="tool-card">
            <div class="tool-icon-box" style="background: rgba(245, 158, 11, 0.15); color: #f59e0b;">
              <span class="material-symbols-rounded">shopping_bag</span>
            </div>
            <div class="tool-info">
              <h4 class="tool-name">Catálogo & Lojas</h4>
              <span class="tool-sub">Cotações e histórico</span>
            </div>
            <span class="material-symbols-rounded arrow">arrow_forward</span>
          </a>

          <!-- Membros & Salários -->
          <a routerLink="/pessoas" class="tool-card">
            <div class="tool-icon-box" style="background: rgba(59, 130, 246, 0.15); color: #3b82f6;">
              <span class="material-symbols-rounded">group</span>
            </div>
            <div class="tool-info">
              <h4 class="tool-name">Membros & Salários</h4>
              <span class="tool-sub">Família e rendimentos</span>
            </div>
            <span class="material-symbols-rounded arrow">arrow_forward</span>
          </a>

          <!-- Relatórios Executivos -->
          <a routerLink="/relatorios" class="tool-card">
            <div class="tool-icon-box" style="background: rgba(16, 185, 129, 0.15); color: #10b981;">
              <span class="material-symbols-rounded">bar_chart</span>
            </div>
            <div class="tool-info">
              <h4 class="tool-name">Relatórios Executivos</h4>
              <span class="tool-sub">Exportação PDF, CSV e auditoria</span>
            </div>
            <span class="material-symbols-rounded arrow">arrow_forward</span>
          </a>

          <!-- Central de Alertas -->
          <a routerLink="/alertas" class="tool-card">
            <div class="tool-icon-box" style="background: rgba(239, 68, 68, 0.15); color: #ef4444;">
              <span class="material-symbols-rounded">notifications</span>
            </div>
            <div class="tool-info">
              <h4 class="tool-name">Central de Alertas</h4>
              <span class="tool-sub">Notificações e varredura</span>
            </div>
            <span class="material-symbols-rounded arrow">arrow_forward</span>
          </a>
        </div>
      </section>

      <!-- Seção Preferências & Ajustes -->
      <section class="section-group">
        <h3 class="group-title">PREFERÊNCIAS & SISTEMA</h3>

        <div class="preferences-list">
          <!-- Alternar Tema -->
          <div class="pref-item" (click)="themeService.toggleTheme()">
            <div class="pref-icon">
              <span class="material-symbols-rounded">
                {{ themeService.currentTheme() === 'dark' ? 'light_mode' : 'dark_mode' }}
              </span>
            </div>
            <div class="pref-info">
              <h4 class="pref-title">Modo de Apresentação</h4>
              <span class="pref-sub">
                {{ themeService.currentTheme() === 'dark' ? 'Tema Escuro Ativo' : 'Tema Claro Ativo' }}
              </span>
            </div>
            <span class="material-symbols-rounded arrow">chevron_right</span>
          </div>

          <!-- Modo Olho Mágico -->
          <div class="pref-item" (click)="carteirasStore.toggleOlhoMagico()">
            <div class="pref-icon">
              <span class="material-symbols-rounded">
                {{ carteirasStore.esconderSaldos() ? 'visibility_off' : 'visibility' }}
              </span>
            </div>
            <div class="pref-info">
              <h4 class="pref-title">Modo Olho Mágico</h4>
              <span class="pref-sub">
                {{ carteirasStore.esconderSaldos() ? 'Valores Privados (Ocultos)' : 'Valores Visíveis' }}
              </span>
            </div>
            <span class="material-symbols-rounded arrow">chevron_right</span>
          </div>

          <!-- Sair da Conta -->
          <div class="pref-item danger" (click)="logout()">
            <div class="pref-icon danger-icon">
              <span class="material-symbols-rounded">logout</span>
            </div>
            <div class="pref-info">
              <h4 class="pref-title danger-text">Sair da Conta</h4>
              <span class="pref-sub">Encerrar sessão com segurança</span>
            </div>
            <span class="material-symbols-rounded arrow danger-text">chevron_right</span>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .mais-page-container {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 800px;
      margin: 0 auto;
      box-sizing: border-box;
    }

    .hero-banner {
      background: linear-gradient(135deg, rgba(74, 18, 26, 0.95) 0%, rgba(24, 7, 10, 0.98) 100%);
      border: 1px solid rgba(216, 184, 126, 0.3);
      border-radius: var(--radius-lg, 16px);
      padding: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.4);
    }

    .user-card {
      display: flex;
      align-items: center;
      gap: 14px;
      cursor: pointer;
    }

    .avatar-large {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: rgba(146, 38, 56, 0.6);
      border: 2px solid var(--alic-color-gold-main, #C9A74E);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: 800;
      color: #ffffff;
      flex-shrink: 0;
    }

    .user-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .user-name {
      font-size: 16px;
      font-weight: 800;
      color: var(--color-champagne-light, #ebd9b6);
      margin: 0;
    }

    .user-email {
      font-size: 12px;
      color: rgba(235, 217, 182, 0.6);
    }

    .workspace-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: rgba(216, 184, 126, 0.12);
      border: 1px solid rgba(216, 184, 126, 0.3);
      padding: 2px 8px;
      border-radius: 99px;
      color: var(--alic-color-gold-light, #ebd9b6);
      font-size: 10px;
      font-weight: 700;
      margin-top: 4px;
      width: fit-content;

      span { font-size: 12px; }
    }

    .chevron-right {
      color: rgba(235, 217, 182, 0.5);
      font-size: 24px;
    }

    .section-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .group-title {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1.2px;
      color: var(--alic-color-gold-main, #C9A74E);
      margin: 0;
    }

    .tools-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 10px;
    }

    .tool-card {
      background: rgba(24, 7, 10, 0.85);
      border: 1px solid rgba(216, 184, 126, 0.2);
      border-radius: var(--radius-md, 12px);
      padding: 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      transition: all 0.2s ease;

      &:hover {
        border-color: rgba(216, 184, 126, 0.5);
        background: rgba(24, 7, 10, 0.95);
      }
    }

    .tool-icon-box {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      span { font-size: 22px; }
    }

    .tool-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .tool-name {
      font-size: 14px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }

    .tool-sub {
      font-size: 11px;
      color: rgba(235, 217, 182, 0.6);
    }

    .arrow {
      color: rgba(235, 217, 182, 0.4);
      font-size: 18px;
    }

    .preferences-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      background: rgba(24, 7, 10, 0.85);
      border: 1px solid rgba(216, 184, 126, 0.2);
      border-radius: var(--radius-md, 12px);
      padding: 6px;
    }

    .pref-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
      border-radius: var(--radius-sm, 8px);
      cursor: pointer;
      transition: background 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.05);
      }
    }

    .pref-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: rgba(216, 184, 126, 0.15);
      color: var(--alic-color-gold-main, #C9A74E);
      display: flex;
      align-items: center;
      justify-content: center;

      span { font-size: 20px; }
    }

    .pref-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .pref-title {
      font-size: 13px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }

    .pref-sub {
      font-size: 11px;
      color: rgba(235, 217, 182, 0.6);
    }

    .danger-icon {
      background: rgba(239, 68, 68, 0.15) !important;
      color: #ef4444 !important;
    }

    .danger-text {
      color: #ef4444 !important;
    }
  `],
})
export class MaisHubPage {
  readonly userContext = inject(UserContextService);
  readonly themeService = inject(ThemeService);
  readonly carteirasStore = inject(CarteirasStore);
  private readonly authStore = inject(AuthStore);
  private readonly overlayService = inject(OverlayService);
  private readonly toastService = inject(ToastService);

  abrirPerfil(): void {
    this.overlayService.openBottomSheet({ component: UserProfileComponent });
  }

  logout(): void {
    this.authStore.logout();
    this.toastService.showSuccess('Sessão encerrada com segurança.');
  }
}
