import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { UserContextService } from '../../../core/services/user-context.service';
import { ThemeService } from '../../../core/services/theme.service';
import { WorkspaceService } from '../../../core/services/workspace.service';
import { AuthStore } from '../../../features/auth/store/auth.store';
import { CarteirasStore } from '../../../features/carteiras/store/carteiras.store';
import { FluxoCaixaStore } from '../../../features/lancamentos/store/fluxo-caixa.store';
import { DashboardStore } from '../../../features/dashboard/store/dashboard.store';
import { OverlayService } from '../../../core/services/overlay.service';
import { ToastService } from '../../../core/services/toast.service';
import { HapticsService } from '../../../core/platform/haptics.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="user-menu-container">
      <!-- Perfil Header -->
      <div class="user-header-card">
        <div class="avatar-large">
          <span>{{ userContext.avatarInitial() }}</span>
        </div>
        <div class="user-info">
          <h3 class="user-name">{{ userContext.userName() }}</h3>
          <span class="user-email">{{ userContext.currentUser()?.email || 'usuario@alicerce.app' }}</span>
          <div class="workspace-badge">
            <span class="material-symbols-rounded icon-ws">roofing</span>
            <span>{{ userContext.workspaceName() }}</span>
          </div>
        </div>
        <button class="close-btn" (click)="fechar()">
          <span class="material-symbols-rounded">close</span>
        </button>
      </div>

      <!-- Menu Items -->
      <div class="menu-sections">
        <div class="menu-group">
          <span class="group-title">PREFERÊNCIAS VISUAIS</span>

          <div class="menu-item" (click)="themeService.toggleTheme()">
            <div class="item-icon">
              <span class="material-symbols-rounded">
                {{ themeService.currentTheme() === 'dark' ? 'light_mode' : 'dark_mode' }}
              </span>
            </div>
            <div class="item-text">
              <span class="item-title">Modo de Apresentação</span>
              <span class="item-sub">
                {{ themeService.currentTheme() === 'dark' ? 'Tema Escuro Ativo' : 'Tema Claro Ativo' }}
              </span>
            </div>
            <span class="material-symbols-rounded arrow">chevron_right</span>
          </div>

          <div class="menu-item" (click)="carteirasStore.toggleOlhoMagico()">
            <div class="item-icon">
              <span class="material-symbols-rounded">
                {{ carteirasStore.esconderSaldos() ? 'visibility_off' : 'visibility' }}
              </span>
            </div>
            <div class="item-text">
              <span class="item-title">Modo Olho Mágico</span>
              <span class="item-sub">
                {{ carteirasStore.esconderSaldos() ? 'Valores Privados (Ocultos)' : 'Valores Visíveis' }}
              </span>
            </div>
            <span class="material-symbols-rounded arrow">chevron_right</span>
          </div>
        </div>

        <div class="menu-group">
          <span class="group-title">GERENCIAMENTO DE DADOS</span>

          @if (!confirmandoReset()) {
            <div class="menu-item warning" (click)="confirmandoReset.set(true)">
              <div class="item-icon reset-icon">
                <span class="material-symbols-rounded">restart_alt</span>
              </div>
              <div class="item-text">
                <span class="item-title warning-text">Zerar Dados do Workspace</span>
                <span class="item-sub">Limpar todos os saldos e lançamentos</span>
              </div>
              <span class="material-symbols-rounded arrow warning-text">chevron_right</span>
            </div>
          } @else {
            <div class="reset-confirm-box">
              <div class="confirm-header">
                <span class="material-symbols-rounded warning-icon">warning</span>
                <h4>Zerar todos os dados?</h4>
              </div>
              <p class="confirm-desc">
                Esta ação é <strong>irreversível</strong>. Todos os lançamentos, despesas, receitas, metas, projetos e saldos deste workspace serão apagados, retornando-o ao estado zerado (R$ 0,00).
              </p>
              <div class="confirm-actions">
                <button class="btn-cancel" [disabled]="resetando()" (click)="confirmandoReset.set(false)">
                  Cancelar
                </button>
                <button class="btn-danger" [disabled]="resetando()" (click)="executarReset()">
                  @if (resetando()) {
                    <span class="material-symbols-rounded spin">progress_activity</span>
                    Zerando...
                  } @else {
                    <span class="material-symbols-rounded">delete_forever</span>
                    Sim, Zerar Tudo
                  }
                </button>
              </div>
            </div>
          }
        </div>

        <div class="menu-group">
          <span class="group-title">CONTA & SESSÃO</span>

          <div class="menu-item danger" (click)="logout()">
            <div class="item-icon logout-icon">
              <span class="material-symbols-rounded">logout</span>
            </div>
            <div class="item-text">
              <span class="item-title danger-text">Sair da Conta</span>
              <span class="item-sub">Encerrar sessão com segurança</span>
            </div>
            <span class="material-symbols-rounded arrow danger-text">chevron_right</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .user-menu-container {
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .user-header-card {
      background: var(--color-primary-gradient);
      border: 1px solid rgba(216, 184, 126, 0.3);
      border-radius: var(--radius-lg);
      padding: 18px;
      display: flex;
      align-items: center;
      gap: 16px;
      position: relative;
    }

    .avatar-large {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: rgba(146, 38, 56, 0.6);
      border: 2px solid var(--color-champagne-main);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      font-weight: 800;
      color: #ffffff;
      box-shadow: var(--shadow-gold-glow);
    }

    .user-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .user-name {
      margin: 0;
      font-size: 18px;
      font-weight: 800;
      color: #ffffff;
    }

    .user-email {
      font-size: 13px;
      color: var(--color-text-secondary);
    }

    .workspace-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(216, 184, 126, 0.15);
      border: 1px solid rgba(216, 184, 126, 0.3);
      padding: 3px 10px;
      border-radius: 12px;
      color: var(--color-champagne-light);
      font-size: 11px;
      font-weight: 700;
      margin-top: 6px;
      width: fit-content;

      .icon-ws { font-size: 14px; color: var(--color-champagne-main); }
    }

    .close-btn {
      position: absolute;
      top: 14px;
      right: 14px;
      background: none;
      border: none;
      color: var(--color-text-secondary);
      cursor: pointer;
    }

    .menu-sections {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .menu-group {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .group-title {
        font-size: 11px;
        font-weight: 800;
        color: var(--color-text-secondary);
        letter-spacing: 1px;
      }
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(216, 184, 126, 0.15);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(216, 184, 126, 0.12);
        border-color: rgba(216, 184, 126, 0.3);
      }

      &.danger {
        background: rgba(198, 40, 40, 0.1);
        border-color: rgba(198, 40, 40, 0.25);

        &:hover {
          background: rgba(198, 40, 40, 0.2);
        }
      }

      &.warning {
        background: rgba(245, 158, 11, 0.08);
        border-color: rgba(245, 158, 11, 0.25);

        &:hover {
          background: rgba(245, 158, 11, 0.15);
        }
      }

      .item-icon {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: rgba(216, 184, 126, 0.15);
        color: var(--color-champagne-main);
        display: flex;
        align-items: center;
        justify-content: center;

        &.logout-icon {
          background: rgba(198, 40, 40, 0.2);
          color: #ef5350;
        }

        &.reset-icon {
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
        }
      }

      .item-text {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .item-title {
        font-size: 14px;
        font-weight: 700;
        color: var(--color-text-primary);

        &.danger-text { color: #ef5350; }
        &.warning-text { color: #f59e0b; }
      }

      .item-sub {
        font-size: 12px;
        color: var(--color-text-secondary);
      }

      .arrow {
        color: var(--color-text-secondary);
        font-size: 20px;

        &.warning-text { color: #f59e0b; }
      }
    }

    .reset-confirm-box {
      background: rgba(161, 61, 99, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.4);
      border-radius: var(--radius-md);
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .confirm-header {
      display: flex;
      align-items: center;
      gap: 8px;

      .warning-icon {
        color: #ef4444;
        font-size: 22px;
      }

      h4 {
        margin: 0;
        font-size: 15px;
        font-weight: 700;
        color: #ffffff;
      }
    }

    .confirm-desc {
      margin: 0;
      font-size: 12px;
      line-height: 1.5;
      color: var(--color-text-secondary);

      strong {
        color: #ef4444;
      }
    }

    .confirm-actions {
      display: flex;
      gap: 10px;
      margin-top: 4px;
    }

    .btn-cancel {
      flex: 1;
      padding: 10px 14px;
      border-radius: var(--radius-sm);
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: var(--color-text-primary);
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      transition: background 0.2s;

      &:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.15);
      }
    }

    .btn-danger {
      flex: 1.3;
      padding: 10px 14px;
      border-radius: var(--radius-sm);
      background: #dc2626;
      border: 1px solid #ef4444;
      color: #ffffff;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: background 0.2s;

      &:hover:not(:disabled) {
        background: #b91c1c;
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .spin {
        animation: spin 1s linear infinite;
        font-size: 18px;
      }
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `],
})
export class UserProfileComponent {
  readonly userContext = inject(UserContextService);
  readonly themeService = inject(ThemeService);
  readonly authStore = inject(AuthStore);
  readonly carteirasStore = inject(CarteirasStore);
  readonly fluxoCaixaStore = inject(FluxoCaixaStore);
  readonly dashboardStore = inject(DashboardStore);
  private readonly workspaceService = inject(WorkspaceService);
  private readonly overlay = inject(OverlayService);
  private readonly toast = inject(ToastService);
  private readonly haptics = inject(HapticsService);

  readonly confirmandoReset = signal<boolean>(false);
  readonly resetando = signal<boolean>(false);

  fechar(): void {
    this.overlay.close();
  }

  async executarReset(): Promise<void> {
    const ws = this.authStore.workspaceAtivo();
    if (!ws?.id) {
      this.toast.showError('Nenhum workspace ativo selecionado.');
      return;
    }

    this.resetando.set(true);
    await this.haptics.impactMedium();

    try {
      await firstValueFrom(this.workspaceService.resetarDadosWorkspace(ws.id));
      this.toast.showSuccess('Dados do workspace zerados com sucesso!');

      // Recarregar os dados das stores para sincronizar a tela imediatamente
      await Promise.allSettled([
        this.fluxoCaixaStore.carregarDados(),
        this.carteirasStore.carregarCarteiras(),
        this.dashboardStore.carregarDashboard(),
      ]);

      this.overlay.close();
    } catch (err: any) {
      this.toast.showError(
        err?.error?.message || 'Erro ao zerar dados do workspace. Tente novamente.',
      );
    } finally {
      this.resetando.set(false);
      this.confirmandoReset.set(false);
    }
  }

  async logout(): Promise<void> {
    await this.haptics.impactLight();
    this.overlay.close();
    await this.authStore.logout();
    this.toast.showSuccess('Sessão encerrada com segurança.');
  }
}
