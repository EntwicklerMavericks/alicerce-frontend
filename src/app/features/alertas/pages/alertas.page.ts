import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { AlertasStore, getSeveridadeFromTipo } from '../store/alertas.store';
import { Alerta, SeveridadeAlerta, TipoAlerta } from '../../../core/models/alertas.models';
import { ToastService } from '../../../core/services/toast.service';
import { HapticsService } from '../../../core/platform/haptics.service';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-alertas-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DatePipe, CardComponent, ButtonComponent],
  template: `
    <div class="alertas-page animate-fade-in">
      <!-- Header da Página -->
      <div class="page-header">
        <div class="header-titles">
          <h1 class="page-title">Central de Alertas & Notificações</h1>
          <p class="page-subtitle">Monitore pendências financeiras, desvios de orçamento e oportunidades em tempo real</p>
        </div>

        <div class="header-actions-group">
          <app-button
            variant="secondary-glass"
            size="sm"
            icon="autorenew"
            [loading]="alertasStore.carregando()"
            (btnClick)="verificarAlertas()">
            Verificar
          </app-button>

          @if (alertasStore.temNaoLidos()) {
            <app-button
              variant="primary-gold"
              size="sm"
              icon="done_all"
              (btnClick)="marcarTodosLidos()">
              Marcar Todos Lidos
            </app-button>
          }
        </div>
      </div>

      <!-- Banner de Resumo de Notificações / Hero Stats -->
      <app-card [glow]="true">
        <div class="hero-stats-container">
          <div class="hero-main-stat">
            <span class="stat-label">STATUS DE NOTIFICAÇÕES</span>
            <div class="stat-value-group">
              <span class="stat-big-value" [class.has-unread]="alertasStore.countNaoLidos() > 0">
                {{ alertasStore.countNaoLidos() }}
              </span>
              <span class="stat-subtext">
                {{ alertasStore.countNaoLidos() === 1 ? 'alerta não lido aguardando atenção' : 'alertas não lidos aguardando atenção' }}
              </span>
            </div>
          </div>

          <!-- Grade de Severidade de Alertas -->
          <div class="hero-pills-grid">
            <div class="hero-stat-pill red" (click)="filtrarSeveridade('CRITICO')">
              <div class="pill-header">
                <span class="material-symbols-rounded icon">warning</span>
                <span class="val">{{ alertasStore.countCriticos() }}</span>
              </div>
              <span class="lbl">Críticos</span>
            </div>

            <div class="hero-stat-pill gold" (click)="filtrarSeveridade('ALTO')">
              <div class="pill-header">
                <span class="material-symbols-rounded icon">error_med</span>
                <span class="val">{{ alertasStore.countAltos() }}</span>
              </div>
              <span class="lbl">Altos</span>
            </div>

            <div class="hero-stat-pill blue" (click)="filtrarSeveridade('MEDIO')">
              <div class="pill-header">
                <span class="material-symbols-rounded icon">info</span>
                <span class="val">{{ alertasStore.countMedios() }}</span>
              </div>
              <span class="lbl">Médios</span>
            </div>

            <div class="hero-stat-pill total" (click)="filtrarSeveridade('TODAS')">
              <div class="pill-header">
                <span class="material-symbols-rounded icon">notifications_active</span>
                <span class="val">{{ alertasStore.alertas().length }}</span>
              </div>
              <span class="lbl">Total</span>
            </div>
          </div>
        </div>
      </app-card>

      <!-- Barra de Pílulas de Severidade e Status -->
      <div class="filters-section">
        <!-- Pílulas por Severidade -->
        <div class="severity-pills-row">
          <button
            class="sev-pill all"
            [class.active]="alertasStore.filtroSeveridade() === 'TODAS'"
            (click)="filtrarSeveridade('TODAS')">
            <span class="material-symbols-rounded icon">apps</span>
            <span>Todas</span>
            <span class="pill-badge">{{ alertasStore.alertas().length }}</span>
          </button>

          <button
            class="sev-pill critico"
            [class.active]="alertasStore.filtroSeveridade() === 'CRITICO'"
            (click)="filtrarSeveridade('CRITICO')">
            <span class="material-symbols-rounded icon">report_problem</span>
            <span>CRÍTICO</span>
            @if (alertasStore.countCriticos() > 0) {
              <span class="pill-badge crit">{{ alertasStore.countCriticos() }}</span>
            }
          </button>

          <button
            class="sev-pill alto"
            [class.active]="alertasStore.filtroSeveridade() === 'ALTO'"
            (click)="filtrarSeveridade('ALTO')">
            <span class="material-symbols-rounded icon">priority_high</span>
            <span>ALTO</span>
            @if (alertasStore.countAltos() > 0) {
              <span class="pill-badge alt">{{ alertasStore.countAltos() }}</span>
            }
          </button>

          <button
            class="sev-pill medio"
            [class.active]="alertasStore.filtroSeveridade() === 'MEDIO'"
            (click)="filtrarSeveridade('MEDIO')">
            <span class="material-symbols-rounded icon">info</span>
            <span>MÉDIO</span>
            @if (alertasStore.countMedios() > 0) {
              <span class="pill-badge med">{{ alertasStore.countMedios() }}</span>
            }
          </button>
        </div>

        <!-- Filtro por Status de Leitura -->
        <div class="status-tabs-row">
          <button
            class="status-tab-btn"
            [class.active]="alertasStore.filtroStatusLeitura() === 'TODOS'"
            (click)="filtrarStatusLeitura('TODOS')">
            Todos
          </button>
          <button
            class="status-tab-btn"
            [class.active]="alertasStore.filtroStatusLeitura() === 'NAO_LIDOS'"
            (click)="filtrarStatusLeitura('NAO_LIDOS')">
            Não Lidos
          </button>
          <button
            class="status-tab-btn"
            [class.active]="alertasStore.filtroStatusLeitura() === 'LIDOS'"
            (click)="filtrarStatusLeitura('LIDOS')">
            Lidos
          </button>
        </div>
      </div>

      <!-- Lista de Cards de Alertas -->
      <div class="alertas-list-section">
        @if (alertasStore.carregando()) {
          <div class="loading-state glass-card">
            <span class="spinner"></span>
            <p>Buscando alertas e verificando inteligência financeira...</p>
          </div>
        } @else if (alertasStore.alertasFiltrados().length === 0) {
          <div class="empty-state glass-card">
            <div class="empty-icon-wrapper">
              <span class="material-symbols-rounded empty-icon">notifications_off</span>
            </div>
            <h3>Nenhum alerta encontrado</h3>
            <p>Sua vida financeira está sob controle. Nenhum alerta pendente para o filtro selecionado.</p>
            <app-button variant="primary-gold" (btnClick)="verificarAlertas()">
              Executar Varredura
            </app-button>
          </div>
        } @else {
          <div class="cards-stack">
            @for (alerta of alertasStore.alertasFiltrados(); track alerta.id) {
              <div
                class="alerta-card glass-card animate-slide-up"
                [class.nao-lido]="!alerta.lido"
                [class.sev-critico]="obterSeveridade(alerta) === 'CRITICO'"
                [class.sev-alto]="obterSeveridade(alerta) === 'ALTO'"
                [class.sev-medio]="obterSeveridade(alerta) === 'MEDIO'">

                <!-- Topo do Card: Badge Severidade + Status Lido -->
                <div class="card-top">
                  <div class="sev-tag-box">
                    <span class="sev-badge" [class]="obterSeveridadeClass(alerta)">
                      <span class="material-symbols-rounded icon">{{ obterIconeSeveridade(alerta) }}</span>
                      {{ obterSeveridade(alerta) }}
                    </span>

                    <span class="tipo-tag">
                      <span class="material-symbols-rounded icon">{{ obterIconeTipo(alerta.tipo) }}</span>
                      {{ formatarTipo(alerta.tipo) }}
                    </span>
                  </div>

                  <div class="top-right-meta">
                    @if (!alerta.lido) {
                      <span class="unread-dot-badge" title="Não Lido">
                        <span class="dot"></span>
                        Novo
                      </span>
                    } @else {
                      <span class="read-check-badge" title="Lido">
                        <span class="material-symbols-rounded check-icon">check_circle</span>
                        Lido
                      </span>
                    }
                  </div>
                </div>

                <!-- Corpo do Card -->
                <div class="card-content">
                  <h3 class="alerta-title" [class.bold]="!alerta.lido">{{ alerta.titulo }}</h3>
                  <p class="alerta-msg">{{ alerta.mensagem }}</p>

                  <div class="card-timestamp">
                    <span class="material-symbols-rounded time-icon">schedule</span>
                    <span>Disparado em {{ alerta.dataDisparo | date:'dd/MM/yyyy HH:mm' }}</span>
                  </div>
                </div>

                <!-- Rodapé do Card: Ação de Resolução e Marcar como Lido -->
                <div class="card-actions">
                  <app-button
                    variant="primary-gold"
                    size="sm"
                    [icon]="obterIconeAtalho(alerta)"
                    (btnClick)="navegarParaResolucao(alerta)">
                    {{ obterTextoAtalho(alerta) }}
                  </app-button>

                  @if (!alerta.lido) {
                    <button
                      type="button"
                      class="btn-marcar-lido"
                      (click)="marcarComoLido(alerta)"
                      title="Marcar como Lido">
                      <span class="material-symbols-rounded">check</span>
                      Marcar Lido
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .alertas-page {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 840px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }

    .page-title {
      font-size: 22px;
      font-weight: 800;
      color: var(--alic-color-gold-light, #ebd9b6);
      margin: 0;
    }

    .page-subtitle {
      font-size: 13px;
      color: rgba(235, 217, 182, 0.6);
      margin: 4px 0 0 0;
    }

    .header-actions-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .hero-stats-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .hero-main-stat {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .stat-label {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1px;
      color: rgba(235, 217, 182, 0.6);
    }

    .stat-value-group {
      display: flex;
      align-items: baseline;
      gap: 12px;
      flex-wrap: wrap;
    }

    .stat-big-value {
      font-size: 32px;
      font-weight: 800;
      color: rgba(235, 217, 182, 0.8);

      &.has-unread {
        color: #A13D63;
        text-shadow: 0 0 16px rgba(161, 61, 99, 0.6);
      }
    }

    .stat-subtext {
      font-size: 13px;
      color: rgba(235, 217, 182, 0.7);
    }

    .hero-pills-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      border-top: 1px dashed rgba(216, 184, 126, 0.2);
      padding-top: 14px;
    }

    .hero-stat-pill {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.03);
      padding: 8px 6px;
      border-radius: 12px;
      border: 1px solid rgba(216, 184, 126, 0.15);
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(216, 184, 126, 0.12);
        transform: translateY(-1px);
      }

      .pill-header {
        display: flex;
        align-items: center;
        gap: 4px;

        .icon { font-size: 16px; }
        .val { font-size: 16px; font-weight: 800; }
      }

      .lbl {
        font-size: 10px;
        color: rgba(235, 217, 182, 0.6);
        margin-top: 2px;
      }

      &.red { .pill-header { color: #f44336; } }
      &.gold { .pill-header { color: #d8b87e; } }
      &.blue { .pill-header { color: #0288d1; } }
      &.total { .pill-header { color: #ebd9b6; } }
    }

    .filters-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .severity-pills-row {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 4px;
    }

    .sev-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(216, 184, 126, 0.15);
      color: rgba(235, 217, 182, 0.7);
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s ease;

      .icon { font-size: 16px; }

      &:hover {
        background: rgba(216, 184, 126, 0.12);
        color: #ffffff;
      }

      &.active {
        background: rgba(216, 184, 126, 0.2);
        color: var(--alic-color-gold-light, #ebd9b6);
        border-color: var(--alic-color-gold-main, #c9a74e);
        box-shadow: 0 0 10px rgba(201, 167, 78, 0.25);
      }

      &.critico.active {
        background: rgba(161, 61, 99, 0.25);
        color: #ff80ab;
        border-color: #A13D63;
      }

      &.alto.active {
        background: rgba(201, 167, 78, 0.25);
        color: #ffd54f;
        border-color: #C9A74E;
      }

      &.medio.active {
        background: rgba(2, 136, 209, 0.25);
        color: #81d4fa;
        border-color: #0288d1;
      }
    }

    .pill-badge {
      padding: 2px 6px;
      border-radius: 999px;
      font-size: 10px;
      font-weight: 800;
      background: rgba(255, 255, 255, 0.15);
      color: #ffffff;

      &.crit { background: #A13D63; color: #ffffff; }
      &.alt { background: #C9A74E; color: #2b0b10; }
      &.med { background: #0288d1; color: #ffffff; }
    }

    .status-tabs-row {
      display: flex;
      gap: 6px;
      background: rgba(0, 0, 0, 0.3);
      padding: 4px;
      border-radius: 12px;
      border: 1px solid rgba(216, 184, 126, 0.15);
      align-self: flex-start;
    }

    .status-tab-btn {
      background: transparent;
      border: none;
      color: rgba(235, 217, 182, 0.6);
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover { color: #ffffff; }

      &.active {
        background: rgba(216, 184, 126, 0.2);
        color: var(--alic-color-gold-light);
        font-weight: 700;
      }
    }

    .cards-stack {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .alerta-card {
      padding: 16px;
      border-radius: 18px;
      background: rgba(31, 26, 27, 0.8);
      border: 1px solid rgba(216, 184, 126, 0.2);
      display: flex;
      flex-direction: column;
      gap: 12px;
      position: relative;
      transition: all 0.25s ease;

      &.nao-lido {
        background: rgba(36, 20, 26, 0.95);
        border-color: rgba(161, 61, 99, 0.5);
        box-shadow: 0 0 14px rgba(161, 61, 99, 0.15);
      }

      &.sev-critico {
        border-left: 4px solid #A13D63;
      }

      &.sev-alto {
        border-left: 4px solid #C9A74E;
      }

      &.sev-medio {
        border-left: 4px solid #0288d1;
      }
    }

    .card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .sev-tag-box {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .sev-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px;
      border-radius: 8px;
      font-size: 10px;
      font-weight: 800;

      .icon { font-size: 13px; }

      &.critico {
        background: rgba(161, 61, 99, 0.3);
        color: #ff80ab;
        border: 1px solid rgba(161, 61, 99, 0.5);
      }

      &.alto {
        background: rgba(201, 167, 78, 0.3);
        color: #ffd54f;
        border: 1px solid rgba(201, 167, 78, 0.5);
      }

      &.medio {
        background: rgba(2, 136, 209, 0.3);
        color: #81d4fa;
        border: 1px solid rgba(2, 136, 209, 0.5);
      }
    }

    .tipo-tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      color: rgba(235, 217, 182, 0.6);

      .icon { font-size: 14px; }
    }

    .unread-dot-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: rgba(161, 61, 99, 0.2);
      border: 1px solid rgba(161, 61, 99, 0.5);
      color: #ff80ab;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 10px;
      font-weight: 800;

      .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #ff80ab;
        box-shadow: 0 0 6px #ff80ab;
      }
    }

    .read-check-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: rgba(235, 217, 182, 0.4);
      font-size: 11px;

      .check-icon { font-size: 15px; color: rgba(235, 217, 182, 0.4); }
    }

    .card-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .alerta-title {
      font-size: 15px;
      font-weight: 600;
      color: #ffffff;
      margin: 0;

      &.bold {
        font-weight: 800;
        color: var(--alic-color-gold-light);
      }
    }

    .alerta-msg {
      font-size: 13px;
      color: rgba(235, 217, 182, 0.8);
      margin: 2px 0 6px 0;
      line-height: 1.4;
    }

    .card-timestamp {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      color: rgba(235, 217, 182, 0.45);

      .time-icon { font-size: 14px; }
    }

    .card-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px dashed rgba(216, 184, 126, 0.15);
      padding-top: 10px;
      gap: 8px;
    }

    .btn-marcar-lido {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: transparent;
      border: 1px solid rgba(216, 184, 126, 0.25);
      color: rgba(235, 217, 182, 0.7);
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(216, 184, 126, 0.15);
        color: #ffffff;
      }

      span { font-size: 16px; }
    }

    .loading-state, .empty-state {
      padding: 32px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: 12px;

      h3 { font-size: 18px; margin: 0; color: var(--alic-color-gold-light); }
      p { font-size: 13px; color: rgba(235, 217, 182, 0.6); margin: 0; max-width: 400px; }
    }

    .empty-icon-wrapper {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: rgba(216, 184, 126, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;

      .empty-icon { font-size: 32px; color: var(--alic-color-gold-main); }
    }

    .spinner {
      width: 24px;
      height: 24px;
      border: 3px solid var(--alic-color-gold-main);
      border-right-color: transparent;
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `],
})
export class AlertasPage implements OnInit {
  readonly alertasStore = inject(AlertasStore);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly haptics = inject(HapticsService);

  ngOnInit(): void {
    this.alertasStore.carregarAlertas(1);
  }

  verificarAlertas(): void {
    this.haptics.impactLight();
    this.alertasStore.gerarAlertas();
    this.toast.showSuccess('Varredura de alertas concluída!');
  }

  marcarTodosLidos(): void {
    this.haptics.impactMedium();
    this.alertasStore.marcarTodosComoLidos();
    this.toast.showSuccess('Todos os alertas foram marcados como lidos.');
  }

  marcarComoLido(alerta: Alerta): void {
    this.haptics.impactLight();
    this.alertasStore.marcarComoLido(alerta.id);
  }

  filtrarSeveridade(sev: SeveridadeAlerta | 'TODAS'): void {
    this.haptics.impactLight();
    this.alertasStore.setFiltroSeveridade(sev);
  }

  filtrarStatusLeitura(status: 'TODOS' | 'NAO_LIDOS' | 'LIDOS'): void {
    this.haptics.impactLight();
    this.alertasStore.setFiltroStatusLeitura(status);
  }

  obterSeveridade(alerta: Alerta): SeveridadeAlerta {
    return alerta.severidade || getSeveridadeFromTipo(alerta.tipo);
  }

  obterSeveridadeClass(alerta: Alerta): string {
    const sev = this.obterSeveridade(alerta);
    return sev.toLowerCase();
  }

  obterIconeSeveridade(alerta: Alerta): string {
    const sev = this.obterSeveridade(alerta);
    switch (sev) {
      case 'CRITICO':
        return 'warning';
      case 'ALTO':
        return 'priority_high';
      case 'MEDIO':
      default:
        return 'info';
    }
  }

  obterIconeTipo(tipo: TipoAlerta): string {
    switch (tipo) {
      case 'CONTA_VENCENDO':
        return 'credit_card_off';
      case 'ORCAMENTO_EXCEDIDO':
        return 'pie_chart';
      case 'QUEDA_PRECO':
        return 'trending_down';
      case 'META_ATINGIDA':
        return 'emoji_events';
      case 'SALARIO_RECEBIDO':
        return 'payments';
      case 'SISTEMA':
      default:
        return 'notifications';
    }
  }

  formatarTipo(tipo: TipoAlerta): string {
    switch (tipo) {
      case 'CONTA_VENCENDO':
        return 'Conta / Fatura Vencendo';
      case 'ORCAMENTO_EXCEDIDO':
        return 'Orçamento Excedido';
      case 'QUEDA_PRECO':
        return 'Queda de Preço';
      case 'META_ATINGIDA':
        return 'Meta Atingida';
      case 'SALARIO_RECEBIDO':
        return 'Salário Recebido';
      case 'SISTEMA':
      default:
        return 'Notificação de Sistema';
    }
  }

  obterTextoAtalho(alerta: Alerta): string {
    const ref = alerta.tipoReferencia || '';
    switch (alerta.tipo) {
      case 'CONTA_VENCENDO':
        return ref === 'FATURA' ? 'Ver Cartões / Faturas' : 'Ver Lançamentos';
      case 'ORCAMENTO_EXCEDIDO':
        return 'Ver Orçamentos';
      case 'QUEDA_PRECO':
        return 'Ver Wishlist';
      case 'META_ATINGIDA':
        return 'Ver Metas';
      case 'SALARIO_RECEBIDO':
        return 'Ver Lançamentos';
      default:
        return 'Resolver Alerta';
    }
  }

  obterIconeAtalho(alerta: Alerta): string {
    switch (alerta.tipo) {
      case 'CONTA_VENCENDO':
        return 'credit_card';
      case 'ORCAMENTO_EXCEDIDO':
        return 'bar_chart';
      case 'QUEDA_PRECO':
        return 'shopping_cart';
      case 'META_ATINGIDA':
        return 'flag';
      case 'SALARIO_RECEBIDO':
        return 'receipt_long';
      default:
        return 'arrow_forward';
    }
  }

  navegarParaResolucao(alerta: Alerta): void {
    if (!alerta.lido) {
      this.alertasStore.marcarComoLido(alerta.id);
    }

    const ref = alerta.tipoReferencia || '';
    switch (alerta.tipo) {
      case 'CONTA_VENCENDO':
        this.router.navigate(ref === 'FATURA' ? ['/cards'] : ['/transactions']);
        break;
      case 'ORCAMENTO_EXCEDIDO':
        this.router.navigate(['/orcamentos']);
        break;
      case 'QUEDA_PRECO':
        this.router.navigate(['/wishlist']);
        break;
      case 'META_ATINGIDA':
        this.router.navigate(['/goals']);
        break;
      case 'SALARIO_RECEBIDO':
        this.router.navigate(['/transactions']);
        break;
      default:
        this.router.navigate(['/dashboard']);
        break;
    }
  }
}

// Alias de exportação para CentralAlertasComponent
export { AlertasPage as CentralAlertasComponent };
