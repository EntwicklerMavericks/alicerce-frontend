import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PessoasStore } from '../store/pessoas.store';
import { OverlayService } from '../../../core/services/overlay.service';
import { ToastService } from '../../../core/services/toast.service';
import { HapticsService } from '../../../core/platform/haptics.service';
import { PullToRefreshDirective } from '../../../shared/directives/pull-to-refresh.directive';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { FormularioPessoaComponent } from '../components/formulario-pessoa.component';
import { Pessoa } from '../../../core/models/pessoa.models';

@Component({
  selector: 'app-pessoas-page',
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
      <!-- Hero Banner Renda Familiar -->
      <div class="income-hero-card glass-card gold-border animate-fade-in">
        <div class="hero-top">
          <span class="hero-label">RENDA FAMILIAR ESTIMADA</span>
          <span class="hero-chip">{{ pessoasStore.qtdMembros() }} Membros Ativos</span>
        </div>
        <h1 class="hero-total-value">
          {{ pessoasStore.totalRendaPrevista() | currency:'BRL':'symbol':'1.2-2' }}
        </h1>
        <p class="hero-subtext">Soma das remunerações vigentes cadastradas no workspace</p>
      </div>

      <!-- Header da Lista -->
      <div class="list-header">
        <div class="header-left">
          <h2>Membros & Salários</h2>
          <span class="subtext">Controle de rendas familiares</span>
        </div>

        <app-button
          variant="primary-gold"
          size="sm"
          icon="person_add"
          (btnClick)="abrirFormulario()">
          + Adicionar
        </app-button>
      </div>

      <!-- Estado de Carregamento Skeleton -->
      @if (pessoasStore.carregando() && pessoasStore.pessoas().length === 0) {
        <div class="skeleton-list">
          <app-skeleton type="card"></app-skeleton>
          <app-skeleton type="card"></app-skeleton>
        </div>
      }

      <!-- Lista de Pessoas -->
      <div class="pessoas-grid">
        @for (pessoa of pessoasStore.pessoas(); track pessoa.id) {
          <div class="pessoa-card glass-card touch-active animate-fade-in">
            <div class="card-avatar">
              <span>{{ pessoa.nome.charAt(0) }}</span>
            </div>

            <div class="card-info">
              <div class="info-top">
                <h3 class="member-name">{{ pessoa.nome }}</h3>
                <app-badge variant="gold">{{ pessoa.parentesco }}</app-badge>
              </div>

              <div class="salary-details">
                <span class="salary-type">
                  {{ getTipoRotulo(pessoa.configSalario?.tipo) }}
                </span>
                <span class="salary-value">
                  {{ pessoa.rendaEstimadaMensal | currency:'BRL':'symbol':'1.2-2' }} / mês
                </span>
              </div>
            </div>

            <button class="delete-btn" (click)="removerPessoa(pessoa)" title="Remover Membro">
              <span class="material-symbols-rounded">delete</span>
            </button>
          </div>
        } @empty {
          @if (!pessoasStore.carregando()) {
            <div class="empty-state glass-card animate-fade-in">
              <span class="material-symbols-rounded empty-icon">group_off</span>
              <h3>Nenhum membro cadastrado</h3>
              <p>Cadastre os membros da sua família para calcular a renda familiar total.</p>
              <app-button variant="primary-gold" icon="add" (btnClick)="abrirFormulario()">
                Cadastrar Primeiro Membro
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

    .income-hero-card {
      padding: 24px 20px;
      background: linear-gradient(135deg, rgba(74, 18, 26, 0.6) 0%, rgba(24, 7, 10, 0.9) 100%);
      display: flex;
      flex-direction: column;
      gap: 8px;
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

    .hero-chip {
      font-size: 11px;
      font-weight: 700;
      background: rgba(216, 184, 126, 0.15);
      color: var(--alic-color-gold-light);
      padding: 4px 10px;
      border-radius: var(--alic-radius-full);
      border: 1px solid rgba(216, 184, 126, 0.3);
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

    .pessoas-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .pessoa-card {
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 14px;
      position: relative;
    }

    .card-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--alic-color-primary-gradient);
      border: 2px solid var(--alic-color-gold-main);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: 700;
      color: #ffffff;
      box-shadow: var(--alic-shadow-gold-glow);
    }

    .card-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-top {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .member-name {
      font-size: 16px;
      font-weight: 700;
      margin: 0;
      color: #ffffff;
    }

    .salary-details {
      display: flex;
      flex-direction: column;
    }

    .salary-type {
      font-size: 11px;
      color: var(--color-text-tertiary);
    }

    .salary-value {
      font-family: var(--alic-font-family-mono);
      font-size: 15px;
      font-weight: 700;
      color: var(--alic-color-gold-light);
    }

    .delete-btn {
      background: none;
      border: none;
      color: rgba(244, 63, 94, 0.6);
      cursor: pointer;
      padding: 8px;
      &:hover { color: #f43f5e; }
      span { font-size: 20px; }
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
export class PessoasPage implements OnInit {
  readonly pessoasStore = inject(PessoasStore);
  private readonly overlayService = inject(OverlayService);
  private readonly toastService = inject(ToastService);
  private readonly haptics = inject(HapticsService);

  ngOnInit(): void {
    this.pessoasStore.carregarPessoas();
  }

  onRefresh(): void {
    this.pessoasStore.carregarPessoas();
  }

  abrirFormulario(): void {
    this.haptics.impactLight();
    this.overlayService.openBottomSheet({
      component: FormularioPessoaComponent,
      title: 'Membro da Família',
    });
  }

  async removerPessoa(pessoa: Pessoa): Promise<void> {
    this.haptics.impactMedium();
    const ok = await this.pessoasStore.removerPessoa(pessoa.id);
    if (ok) {
      this.toastService.showSuccess(`Membro "${pessoa.nome}" desativado.`, 'DESFAZER');
    }
  }

  getTipoRotulo(tipo?: string): string {
    switch (tipo) {
      case 'POR_HORA': return 'Contrato por Hora (PJ)';
      case 'COMISSAO': return 'Comissão / Variável';
      case 'DIARIO': return 'Diária de Trabalho';
      case 'FIXO':
      default: return 'Salário Fixo (CLT)';
    }
  }
}
