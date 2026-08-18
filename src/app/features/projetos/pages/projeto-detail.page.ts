import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjetosStore } from '../store/projetos.store';
import { OverlayService } from '../../../core/services/overlay.service';
import { ToastService } from '../../../core/services/toast.service';
import { HapticsService } from '../../../core/platform/haptics.service';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { FormularioProjetoComponent } from '../components/formulario-projeto.component';
import { FormularioEtapaComponent } from '../components/formulario-etapa.component';
import { VincularItemProjetoComponent } from '../components/vincular-item-projeto.component';
import { SimuladorCenariosModalComponent } from '../components/simulador-cenarios-modal.component';
import { SimulacaoStore } from '../store/simulacao.store';
import {
  ProjetoReadModel,
  EtapaProjetoReadModel,
  ItemProjeto,
  StatusProjeto,
  StatusEtapa,
} from '../../../core/models/projeto.models';

@Component({
  selector: 'app-projeto-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    CardComponent,
    ButtonComponent,
    BadgeComponent,
    SimuladorCenariosModalComponent,
  ],
  template: `
    <div class="projeto-detail-page animate-fade-in">
      <!-- Navegação Superior -->
      <div class="top-nav">
        <button class="back-btn" (click)="voltarParaLista()">
          <span class="material-symbols-rounded">arrow_back</span>
          <span>Voltar para Projetos</span>
        </button>
      </div>

      @if (projetosStore.carregando() && !projeto()) {
        <div class="loading-state">
          <span class="spinner"></span>
          <p>Carregando detalhes do projeto...</p>
        </div>
      } @else if (!projeto()) {
        <div class="empty-state glass-card">
          <span class="material-symbols-rounded empty-icon">error_outline</span>
          <h3>Projeto não encontrado</h3>
          <p>O projeto solicitado não existe ou foi removido.</p>
          <app-button variant="primary-gold" (btnClick)="voltarParaLista()">
            Voltar para Projetos
          </app-button>
        </div>
      } @else {
        <!-- BANNER HERO DO PROJETO -->
        <app-card [glow]="true">
          <div class="hero-banner">
            <div class="hero-header">
              <div class="title-group">
                <div
                  class="proj-icon-lg"
                  [style.background-color]="projeto()!.cor || '#C9A74E'">
                  <span class="material-symbols-rounded">{{ projeto()!.icone || 'rocket_launch' }}</span>
                </div>

                <div class="proj-details">
                  <div class="title-row">
                    <h1 class="proj-title">{{ projeto()!.nome }}</h1>
                    <app-badge [variant]="obterStatusBadgeVariant(projeto()!.status)">
                      {{ obterStatusLabel(projeto()!.status) }}
                    </app-badge>
                  </div>
                  @if (projeto()!.descricao) {
                    <p class="proj-desc">{{ projeto()!.descricao }}</p>
                  }
                  @if (projeto()!.prazoEstimado) {
                    <div class="prazo-tag">
                      <span class="material-symbols-rounded">event</span>
                      <span>Prazo Estimado: {{ projeto()!.prazoEstimado | date:'dd/MM/yyyy' }}</span>
                    </div>
                  }
                </div>
              </div>

              <!-- Ações do Banner -->
              <div class="hero-actions">
                <button class="action-chip-btn gold" (click)="abrirSimulacaoCenarios()" title="Simulador de Cenários What-If">
                  <span class="material-symbols-rounded">psychology</span>
                  <span>Simular Cenários</span>
                </button>

                <button class="action-chip-btn" (click)="editarProjeto()" title="Editar Projeto">
                  <span class="material-symbols-rounded">edit</span>
                  <span>Editar</span>
                </button>

                <button class="action-chip-btn gold" (click)="adicionarEtapa()" title="Nova Etapa">
                  <span class="material-symbols-rounded">add_task</span>
                  <span>+ Etapa</span>
                </button>

                @if (projeto()!.status !== 'CONCLUIDO') {
                  <button class="action-chip-btn green" (click)="concluirProjeto()" title="Concluir Projeto">
                    <span class="material-symbols-rounded">check_circle</span>
                    <span>Concluir</span>
                  </button>
                }

                <button class="action-chip-btn danger" (click)="excluirProjeto()" title="Excluir Projeto">
                  <span class="material-symbols-rounded">delete</span>
                </button>
              </div>
            </div>

            <!-- Grade de Métricas Chave -->
            <div class="metrics-grid">
              <div class="metric-card">
                <span class="metric-label">Orçamento Estimado</span>
                <span class="metric-val">{{ projeto()!.orcamentoEstimado | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}</span>
              </div>

              <div class="metric-card">
                <span class="metric-label">Custo Calculado</span>
                <span class="metric-val">{{ projeto()!.custoEstimadoCalculado | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}</span>
              </div>

              <div class="metric-card">
                <span class="metric-label">Valor Financiado</span>
                <span class="metric-val gold">{{ projeto()!.valorFinanciado | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}</span>
              </div>

              <div class="metric-card">
                <span class="metric-label">Cobertura Financeira</span>
                <span class="metric-val gold">{{ projeto()!.coberturaFinanceira }}%</span>
              </div>

              <div class="metric-card">
                <span class="metric-label">Readiness Score</span>
                <span class="metric-val" [class]="obterReadinessClass(projeto()!.readinessScore)">
                  {{ projeto()!.readinessScore }}/100
                </span>
              </div>
            </div>

            <!-- Seção de Progresso Tricolor detalhado -->
            <div class="tricolor-detail-section">
              <div class="bar-group">
                <div class="bar-label-row">
                  <span>Cobertura Financeira (Metas/Compras)</span>
                  <span class="gold">{{ projeto()!.coberturaFinanceira }}%</span>
                </div>
                <div class="bar-track">
                  <div class="bar-fill gold" [style.width.%]="projeto()!.coberturaFinanceira"></div>
                </div>
              </div>

              <div class="bar-group">
                <div class="bar-label-row">
                  <span>Progresso Físico (Etapas Concluídas)</span>
                  <span class="bordeaux">{{ projeto()!.progressoFisico }}%</span>
                </div>
                <div class="bar-track">
                  <div class="bar-fill bordeaux" [style.width.%]="projeto()!.progressoFisico"></div>
                </div>
              </div>

              <div class="bar-group">
                <div class="bar-label-row">
                  <span>Readiness Score (Maturidade Global)</span>
                  <span class="readiness">{{ projeto()!.readinessScore }}/100</span>
                </div>
                <div class="bar-track">
                  <div
                    class="bar-fill readiness"
                    [class]="obterReadinessClass(projeto()!.readinessScore)"
                    [style.width.%]="projeto()!.readinessScore">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </app-card>

        <!-- QUADRO DE ETAPAS E ITENS VINCULADOS -->
        <div class="etapas-section">
          <div class="section-title-row">
            <div class="title-with-subtitle">
              <h2>Linha do Tempo & Etapas ({{ projeto()!.etapas.length }})</h2>
              <p>Etapas sequenciais com acompanhamento de Wishlist e Metas</p>
            </div>

            <app-button
              variant="primary-gold"
              size="sm"
              icon="add"
              (btnClick)="adicionarEtapa()">
              Nova Etapa
            </app-button>
          </div>

          @if (projeto()!.etapas.length === 0) {
            <div class="empty-etapas glass-card">
              <span class="material-symbols-rounded empty-icon">toc</span>
              <h3>Nenhuma etapa criada</h3>
              <p>Divida este projeto em etapas sequenciais (ex: demolição, compras, execução) para calcular o custo real e vincular seus desejos.</p>
              <app-button variant="primary-gold" (btnClick)="adicionarEtapa()">
                Adicionar Primeira Etapa
              </app-button>
            </div>
          } @else {
            <div class="etapas-timeline">
              @for (etapa of projeto()!.etapas; track etapa.id; let idx = $index) {
                <div
                  class="etapa-card glass-card animate-slide-up"
                  [class.conclvida]="etapa.status === 'CONCLUIDA'">
                  <!-- Cabeçalho da Etapa -->
                  <div class="etapa-card-header">
                    <div class="etapa-num-badge">{{ idx + 1 }}</div>

                    <div class="etapa-info">
                      <div class="etapa-title-line">
                        <h3 class="etapa-nome">{{ etapa.nome }}</h3>
                        <app-badge [variant]="obterEtapaStatusBadgeVariant(etapa.status)">
                          {{ obterEtapaStatusLabel(etapa.status) }}
                        </app-badge>
                      </div>

                      @if (etapa.descricao) {
                        <p class="etapa-desc">{{ etapa.descricao }}</p>
                      }
                    </div>

                    <!-- Controles de Reordenação e Ações da Etapa -->
                    <div class="etapa-actions-box">
                      <div class="reorder-btns">
                        <button
                          class="icon-reorder-btn"
                          [disabled]="idx === 0"
                          (click)="moverEtapaParaCima(idx)"
                          title="Mover para cima">
                          <span class="material-symbols-rounded">arrow_upward</span>
                        </button>

                        <button
                          class="icon-reorder-btn"
                          [disabled]="idx === projeto()!.etapas.length - 1"
                          (click)="moverEtapaParaBaixo(idx)"
                          title="Mover para baixo">
                          <span class="material-symbols-rounded">arrow_downward</span>
                        </button>
                      </div>

                      <button class="icon-action-btn" (click)="editarEtapa(etapa)" title="Editar Etapa">
                        <span class="material-symbols-rounded">edit</span>
                      </button>

                      <button class="icon-action-btn delete" (click)="excluirEtapa(etapa.id, etapa.nome)" title="Excluir Etapa">
                        <span class="material-symbols-rounded">delete</span>
                      </button>
                    </div>
                  </div>

                  <!-- Métricas da Etapa -->
                  <div class="etapa-metrics-row">
                    <div class="etapa-metric">
                      <span class="lbl">Custo Estimado</span>
                      <span class="val">{{ etapa.custoEstimado | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}</span>
                    </div>

                    <div class="etapa-metric">
                      <span class="lbl">Custo Calculado</span>
                      <span class="val">{{ etapa.custoCalculado | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}</span>
                    </div>

                    <div class="etapa-metric">
                      <span class="lbl">Financiado</span>
                      <span class="val gold">{{ etapa.valorFinanciado | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}</span>
                    </div>

                    <div class="etapa-metric">
                      <span class="lbl">Readiness Score</span>
                      <span class="val" [class]="obterReadinessClass(etapa.readinessScore)">
                        {{ etapa.readinessScore }}/100
                      </span>
                    </div>
                  </div>

                  <!-- ITENS VINCULADOS Á ETAPA (Wishlist e Metas) -->
                  <div class="linked-items-section">
                    <div class="linked-items-header">
                      <span class="linked-title">
                        <span class="material-symbols-rounded">link</span>
                        Itens Vinculados ({{ etapa.itens?.length || 0 }})
                      </span>

                      <button
                        class="btn-vincular-item"
                        (click)="vincularItem(etapa.id)">
                        <span class="material-symbols-rounded">add_link</span>
                        <span>+ Vincular Item</span>
                      </button>
                    </div>

                    @if (!etapa.itens || etapa.itens.length === 0) {
                      <p class="no-linked-text">Nenhum item da Wishlist ou Meta vinculado a esta etapa.</p>
                    } @else {
                      <div class="linked-chips-grid">
                        @for (item of etapa.itens; track item.id) {
                          <div class="linked-item-chip" [class]="item.tipo.toLowerCase()">
                            <div class="chip-left">
                              @if (item.tipo === 'WISHLIST') {
                                <span class="material-symbols-rounded chip-icon wishlist">shopping_bag</span>
                                <div class="chip-info">
                                  <span class="chip-title">{{ item.itemWishlist?.nome || 'Desejo Wishlist' }}</span>
                                  <span class="chip-val">
                                    {{ (item.itemWishlist?.precoEstimado || item.valorCalculado) | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}
                                  </span>
                                </div>
                              } @else {
                                <span
                                  class="material-symbols-rounded chip-icon meta"
                                  [style.color]="item.meta?.cor || '#C9A74E'">
                                  {{ item.meta?.icone || 'flag' }}
                                </span>
                                <div class="chip-info">
                                  <span class="chip-title">{{ item.meta?.nome || 'Meta Financeira' }}</span>
                                  <span class="chip-val gold">
                                    {{ (item.meta?.valorAtual || item.valorFinanciado) | currency:'BRL':'symbol':'1.0-0':'pt-BR' }} / {{ (item.meta?.valorAlvo || item.valorCalculado) | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}
                                  </span>
                                </div>
                              }
                            </div>

                            <button
                              class="btn-remove-link"
                              (click)="desvincularItem(etapa.id, item.id)"
                              title="Remover vínculo">
                              <span class="material-symbols-rounded">close</span>
                            </button>
                          </div>
                        }
                      </div>
                    }
                  </div>

                  <!-- Rodapé da Etapa -->
                  <div class="etapa-card-footer">
                    @if (etapa.status !== 'CONCLUIDA') {
                      <app-button
                        variant="primary-gold"
                        size="sm"
                        icon="check_circle"
                        (btnClick)="concluirEtapa(etapa.id)">
                        Concluir Etapa
                      </app-button>
                    } @else {
                      <span class="etapa-concluida-tag">
                        <span class="material-symbols-rounded">verified</span>
                        Etapa Concluída
                      </span>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- MODAL DE SIMULAÇÃO DE CENÁRIOS WHAT-IF -->
      <app-simulador-cenarios-modal></app-simulador-cenarios-modal>
    </div>
  `,
  styles: [`
    .projeto-detail-page {
      padding: 16px 16px 120px 16px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 850px;
      margin: 0 auto;
      min-height: 100%;
      box-sizing: border-box;
    }

    .top-nav {
      display: flex;
      align-items: center;
    }

    .back-btn {
      background: none;
      border: none;
      color: var(--alic-color-gold-light, #ebd9b6);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      border-radius: 8px;
      transition: background 0.2s ease;

      &:hover {
        background: rgba(216, 184, 126, 0.15);
      }

      span { font-size: 20px; }
    }

    .hero-banner {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .hero-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }

    .title-group {
      display: flex;
      align-items: flex-start;
      gap: 14px;
    }

    .proj-icon-lg {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      flex-shrink: 0;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);

      span { font-size: 30px; }
    }

    .proj-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .title-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .proj-title {
      font-size: 20px;
      font-weight: 800;
      color: #ffffff;
      margin: 0;
    }

    .proj-desc {
      font-size: 13px;
      color: rgba(235, 217, 182, 0.7);
      margin: 0;
    }

    .prazo-tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      color: var(--alic-color-gold-light, #ebd9b6);
      margin-top: 2px;

      span { font-size: 14px; }
    }

    .hero-actions {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
      width: 100%;
    }

    .action-chip-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(216, 184, 126, 0.2);
      color: rgba(235, 217, 182, 0.8);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;

      span { font-size: 16px; }

      &:hover {
        background: rgba(216, 184, 126, 0.15);
        color: #ffffff;
      }

      &.gold {
        background: rgba(216, 184, 126, 0.2);
        color: #d8b87e;
        border-color: #d8b87e;
      }

      &.green {
        background: rgba(46, 125, 50, 0.2);
        color: #4caf50;
        border-color: rgba(76, 175, 80, 0.4);
      }

      &.danger {
        &:hover {
          background: rgba(244, 67, 54, 0.2);
          color: #f44336;
          border-color: #f44336;
        }
      }
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(125px, 1fr));
      gap: 8px;
      border-top: 1px dashed rgba(216, 184, 126, 0.2);
      padding-top: 14px;
      width: 100%;
      box-sizing: border-box;
    }

    .metric-card {
      display: flex;
      flex-direction: column;
      background: rgba(255, 255, 255, 0.03);
      padding: 8px 10px;
      border-radius: 10px;
      border: 1px solid rgba(216, 184, 126, 0.15);
    }

    .metric-label {
      font-size: 10px;
      color: rgba(235, 217, 182, 0.6);
      white-space: nowrap;
    }

    .metric-val {
      font-size: 15px;
      font-weight: 800;
      color: #ffffff;
      margin-top: 2px;

      &.gold { color: #d8b87e; }
      &.high { color: #4caf50; }
      &.medium { color: #d8b87e; }
      &.low { color: #f44336; }
    }

    .tricolor-detail-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
      background: rgba(0, 0, 0, 0.25);
      padding: 12px;
      border-radius: 12px;
      border: 1px solid rgba(216, 184, 126, 0.15);
    }

    .bar-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .bar-label-row {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      font-weight: 600;
      color: rgba(235, 217, 182, 0.7);

      .gold { color: #d8b87e; }
      .bordeaux { color: #e91e63; }
      .readiness { color: #ffffff; }
    }

    .bar-track {
      width: 100%;
      height: 8px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 4px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.4s ease;

      &.gold { background: linear-gradient(90deg, #d8b87e, #c19b56); }
      &.bordeaux { background: linear-gradient(90deg, #A13D63, #e91e63); }
      &.readiness {
        &.high { background: linear-gradient(90deg, #2e7d32, #4caf50); }
        &.medium { background: linear-gradient(90deg, #d8b87e, #c19b56); }
        &.low { background: linear-gradient(90deg, #c62828, #f44336); }
      }
    }

    .etapas-section {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .section-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;

      h2 { font-size: 17px; font-weight: 700; color: #ebd9b6; margin: 0; }
      p { font-size: 12px; color: rgba(235, 217, 182, 0.6); margin: 2px 0 0 0; }
    }

    .etapas-timeline {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .etapa-card {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      border-radius: 18px;
      background: rgba(31, 26, 27, 0.7);
      border: 1px solid rgba(216, 184, 126, 0.25);
      position: relative;

      &.conclvida {
        border-color: rgba(76, 175, 80, 0.4);
      }
    }

    .etapa-card-header {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      min-width: 0;
      width: 100%;
      box-sizing: border-box;
    }

    .etapa-num-badge {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--alic-color-gold-gradient);
      color: #2b0b10;
      font-weight: 800;
      font-size: 13px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .etapa-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
      overflow: hidden;
    }

    .etapa-title-line {
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 0;
      flex-wrap: wrap;
    }

    .etapa-nome {
      font-size: 14px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }

    .etapa-desc {
      font-size: 11px;
      color: rgba(235, 217, 182, 0.6);
      margin: 0;
    }

    .etapa-actions-box {
      display: flex;
      align-items: center;
      gap: 3px;
      flex-shrink: 0;
    }

    .reorder-btns {
      display: flex;
      align-items: center;
      gap: 2px;
      background: rgba(255, 255, 255, 0.04);
      border-radius: 6px;
      padding: 2px;
    }

    .icon-reorder-btn {
      background: none;
      border: none;
      color: rgba(235, 217, 182, 0.6);
      cursor: pointer;
      padding: 2px;
      display: flex;
      align-items: center;

      &:hover:not(:disabled) {
        color: #d8b87e;
      }

      &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }

      span { font-size: 16px; }
    }

    .icon-action-btn {
      background: none;
      border: none;
      color: rgba(235, 217, 182, 0.5);
      cursor: pointer;
      padding: 4px;
      border-radius: 6px;

      &:hover {
        color: var(--alic-color-gold-light);
        background: rgba(216, 184, 126, 0.15);
      }

      &.delete:hover {
        color: #f44336;
        background: rgba(244, 67, 54, 0.15);
      }

      span { font-size: 18px; }
    }

    .etapa-metrics-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
      gap: 8px;
      background: rgba(0, 0, 0, 0.2);
      padding: 8px 10px;
      border-radius: 10px;
    }

    .etapa-metric {
      display: flex;
      flex-direction: column;
    }

    .lbl {
      font-size: 10px;
      color: rgba(235, 217, 182, 0.5);
    }

    .val {
      font-size: 12px;
      font-weight: 700;
      color: #ffffff;

      &.gold { color: #d8b87e; }
      &.high { color: #4caf50; }
      &.medium { color: #d8b87e; }
      &.low { color: #f44336; }
    }

    .linked-items-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
      background: rgba(255, 255, 255, 0.03);
      padding: 10px 12px;
      border-radius: 12px;
      border: 1px dashed rgba(216, 184, 126, 0.2);
    }

    .linked-items-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .linked-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 700;
      color: var(--alic-color-gold-light, #ebd9b6);

      span { font-size: 16px; }
    }

    .btn-vincular-item {
      background: rgba(216, 184, 126, 0.12);
      border: 1px solid rgba(216, 184, 126, 0.3);
      color: #d8b87e;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(216, 184, 126, 0.25);
      }

      span { font-size: 14px; }
    }

    .no-linked-text {
      font-size: 11px;
      color: rgba(235, 217, 182, 0.45);
      margin: 0;
    }

    .linked-chips-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .linked-item-chip {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      background: rgba(31, 26, 27, 0.8);
      border: 1px solid rgba(216, 184, 126, 0.2);
      padding: 6px 10px;
      border-radius: 10px;

      &.wishlist {
        border-color: rgba(2, 136, 209, 0.3);
      }

      &.meta {
        border-color: rgba(201, 167, 78, 0.3);
      }
    }

    .chip-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .chip-icon {
      font-size: 18px;

      &.wishlist { color: #0288d1; }
      &.meta { color: #C9A74E; }
    }

    .chip-info {
      display: flex;
      flex-direction: column;
    }

    .chip-title {
      font-size: 12px;
      font-weight: 700;
      color: #ffffff;
    }

    .chip-val {
      font-size: 10px;
      color: rgba(235, 217, 182, 0.6);

      &.gold { color: #d8b87e; }
    }

    .btn-remove-link {
      background: none;
      border: none;
      color: rgba(235, 217, 182, 0.4);
      cursor: pointer;
      padding: 2px;
      display: flex;
      align-items: center;

      &:hover { color: #f44336; }
      span { font-size: 15px; }
    }

    .etapa-card-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      border-top: 1px solid rgba(216, 184, 126, 0.12);
      padding-top: 10px;
    }

    .etapa-concluida-tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: #4caf50;
      font-size: 12px;
      font-weight: 700;

      span { font-size: 16px; }
    }

    .empty-etapas {
      padding: 32px 20px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      border-radius: 20px;

      .empty-icon { font-size: 44px; color: var(--alic-color-gold-main, #d8b87e); }
      h3 { font-size: 17px; color: #ebd9b6; margin: 0; }
      p { font-size: 12px; color: rgba(235, 217, 182, 0.6); margin: 0; max-width: 320px; }
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px;
      gap: 12px;
      color: var(--alic-color-gold-light);

      .spinner {
        width: 24px;
        height: 24px;
        border: 2px solid currentColor;
        border-right-color: transparent;
        border-radius: 50%;
        animation: spin 0.75s linear infinite;
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `],
})
export class ProjetoDetailPage implements OnInit {
  readonly projetosStore = inject(ProjetosStore);
  readonly simulacaoStore = inject(SimulacaoStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly overlayService = inject(OverlayService);
  private readonly toastService = inject(ToastService);
  private readonly haptics = inject(HapticsService);

  readonly projeto = this.projetosStore.projetoSelecionado;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.projetosStore.obterProjetoPorId(id);
    }
  }

  abrirSimulacaoCenarios(): void {
    const proj = this.projeto();
    if (!proj) return;
    this.haptics.impactMedium();
    this.simulacaoStore.abrirModal(proj);
  }

  voltarParaLista(): void {
    this.haptics.impactLight();
    this.router.navigate(['/projects']);
  }

  editarProjeto(): void {
    const proj = this.projeto();
    if (!proj) return;
    this.haptics.impactMedium();
    this.overlayService.openBottomSheet({
      component: FormularioProjetoComponent,
      title: 'Editar Projeto',
      data: { projeto: proj },
    });
  }

  async concluirProjeto(): Promise<void> {
    const proj = this.projeto();
    if (!proj) return;
    this.haptics.impactMedium();
    const ok = await this.projetosStore.concluirProjeto(proj.id);
    if (ok) {
      this.toastService.showSuccess(`Projeto "${proj.nome}" marcado como CONCLUÍDO!`);
    }
  }

  async excluirProjeto(): Promise<void> {
    const proj = this.projeto();
    if (!proj) return;
    this.haptics.impactMedium();
    if (confirm(`Deseja realmente excluir o projeto "${proj.nome}"?`)) {
      const ok = await this.projetosStore.removerProjeto(proj.id);
      if (ok) {
        this.toastService.showSuccess(`Projeto "${proj.nome}" excluído com sucesso.`);
        this.voltarParaLista();
      }
    }
  }

  adicionarEtapa(): void {
    const proj = this.projeto();
    if (!proj) return;
    this.haptics.impactMedium();
    this.overlayService.openBottomSheet({
      component: FormularioEtapaComponent,
      title: 'Nova Etapa',
      data: { projetoId: proj.id },
    });
  }

  editarEtapa(etapa: EtapaProjetoReadModel): void {
    const proj = this.projeto();
    if (!proj) return;
    this.haptics.impactMedium();
    this.overlayService.openBottomSheet({
      component: FormularioEtapaComponent,
      title: 'Editar Etapa',
      data: { projetoId: proj.id, etapa },
    });
  }

  async excluirEtapa(etapaId: string, etapaNome: string): Promise<void> {
    const proj = this.projeto();
    if (!proj) return;
    this.haptics.impactMedium();
    if (confirm(`Excluir a etapa "${etapaNome}"?`)) {
      const ok = await this.projetosStore.removerEtapa(proj.id, etapaId);
      if (ok) {
        this.toastService.showSuccess(`Etapa "${etapaNome}" removida.`);
      }
    }
  }

  async concluirEtapa(etapaId: string): Promise<void> {
    const proj = this.projeto();
    if (!proj) return;
    this.haptics.impactMedium();
    const ok = await this.projetosStore.concluirEtapa(proj.id, etapaId);
    if (ok) {
      this.toastService.showSuccess('Etapa concluída!');
    }
  }

  async moverEtapaParaCima(idx: number): Promise<void> {
    const proj = this.projeto();
    if (!proj || idx <= 0) return;
    const etapas = [...proj.etapas];
    const temp = etapas[idx];
    etapas[idx] = etapas[idx - 1];
    etapas[idx - 1] = temp;

    const ids = etapas.map((e) => e.id);
    await this.projetosStore.reordenarEtapas(proj.id, ids);
  }

  async moverEtapaParaBaixo(idx: number): Promise<void> {
    const proj = this.projeto();
    if (!proj || idx >= proj.etapas.length - 1) return;
    const etapas = [...proj.etapas];
    const temp = etapas[idx];
    etapas[idx] = etapas[idx + 1];
    etapas[idx + 1] = temp;

    const ids = etapas.map((e) => e.id);
    await this.projetosStore.reordenarEtapas(proj.id, ids);
  }

  vincularItem(etapaId: string): void {
    const proj = this.projeto();
    if (!proj) return;
    this.haptics.impactMedium();
    this.overlayService.openBottomSheet({
      component: VincularItemProjetoComponent,
      title: 'Vincular Item',
      data: { projetoId: proj.id, etapaId },
    });
  }

  async desvincularItem(etapaId: string, itemId: string): Promise<void> {
    const proj = this.projeto();
    if (!proj) return;
    this.haptics.impactLight();
    const ok = await this.projetosStore.desvincularItemEtapa(proj.id, etapaId, itemId);
    if (ok) {
      this.toastService.showSuccess('Vínculo removido.');
    }
  }

  obterStatusBadgeVariant(status: StatusProjeto): 'gold' | 'bordo' | 'positive' | 'negative' | 'neutral' {
    switch (status) {
      case 'CONCLUIDO': return 'positive';
      case 'EM_ANDAMENTO': return 'gold';
      case 'PLANEJAMENTO': return 'bordo';
      case 'CANCELADO': return 'negative';
      default: return 'gold';
    }
  }

  obterStatusLabel(status: StatusProjeto): string {
    switch (status) {
      case 'CONCLUIDO': return 'Concluído';
      case 'EM_ANDAMENTO': return 'Em Andamento';
      case 'PLANEJAMENTO': return 'Planejamento';
      case 'CANCELADO': return 'Cancelado';
      default: return status;
    }
  }

  obterEtapaStatusBadgeVariant(status: StatusEtapa): 'gold' | 'bordo' | 'positive' | 'negative' | 'neutral' {
    switch (status) {
      case 'CONCLUIDA': return 'positive';
      case 'EM_ANDAMENTO': return 'gold';
      case 'PENDENTE': return 'bordo';
      default: return 'bordo';
    }
  }

  obterEtapaStatusLabel(status: StatusEtapa): string {
    switch (status) {
      case 'CONCLUIDA': return 'Concluída';
      case 'EM_ANDAMENTO': return 'Em Andamento';
      case 'PENDENTE': return 'Pendente';
      default: return status;
    }
  }

  obterReadinessClass(score: number): 'high' | 'medium' | 'low' {
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }
}
