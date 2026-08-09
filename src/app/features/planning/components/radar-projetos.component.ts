import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PlanningStore } from '../store/planning.store';
import { ProjetoGargalo } from '../../../core/models/planning.models';

@Component({
  selector: 'app-radar-projetos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="radar-projetos-card glass-card animate-fade-in">
      <!-- Section Header -->
      <div class="card-header">
        <div>
          <div class="badge-tag bordo">
            <span class="material-symbols-rounded icon-sm">account_tree</span>
            <span>PROJETOS & CAMINHO CRÍTICO</span>
          </div>
          <h2 class="section-title">Radar Executivo de Projetos 🎯</h2>
          <p class="section-subtitle">
            Acompanhamento de readiness score, gargalos operacionais e financiamento acumulado dos seus objetivos.
          </p>
        </div>

        <div class="readiness-global-pill">
          <span class="lbl">Readiness Médio</span>
          <span class="val font-mono" [ngClass]="getReadinessColorClass(store.readinessMedioProjetos())">
            {{ store.readinessMedioProjetos() }}%
          </span>
        </div>
      </div>

      <!-- Grid of Projects -->
      <div class="projetos-grid">
        <div *ngFor="let proj of store.projetosGargalo()" class="projeto-card" [class.has-critical]="proj.temCaminhoCritico">
          <!-- Card Top Bar -->
          <div class="card-top">
            <div class="proj-identity">
              <span class="proj-icon-wrapper" [style.background-color]="proj.cor || '#A13D63'">
                <span class="material-symbols-rounded">{{ proj.icone || 'rocket_launch' }}</span>
              </span>
              <div>
                <h3 class="proj-title">{{ proj.nome }}</h3>
                <span class="proj-deadline" *ngIf="proj.prazoEstimado">Prazo: {{ proj.prazoEstimado }}</span>
              </div>
            </div>

            <div class="readiness-chip" [ngClass]="getReadinessColorClass(proj.readinessScore)">
              <span class="lbl-chip">Readiness</span>
              <span class="score-num font-mono">{{ proj.readinessScore }}%</span>
            </div>
          </div>

          <!-- Description -->
          <p class="proj-desc" *ngIf="proj.descricao">{{ proj.descricao }}</p>

          <!-- Caminho Crítico / Bottleneck Banner -->
          <div *ngIf="proj.temCaminhoCritico" class="bottleneck-banner">
            <div class="banner-hdr">
              <span class="material-symbols-rounded warning-icon">warning</span>
              <span class="banner-title">Gargalo Identificado no Caminho Crítico</span>
            </div>
            <p class="gargalo-text">{{ proj.motivoGargalo }}</p>
            <div *ngIf="proj.etapaBloqueada" class="blocked-stage">
              <span class="lbl-blocked">Etapa Afetada:</span>
              <span class="stage-tag">{{ proj.etapaBloqueada }}</span>
            </div>
          </div>

          <!-- Financial Coverage Progress Bar -->
          <div class="coverage-section">
            <div class="coverage-hdr">
              <span class="cov-lbl">Cobertura Financeira</span>
              <span class="cov-pct font-mono text-gold">{{ proj.coberturaFinanceira }}%</span>
            </div>

            <div class="glass-progress-track">
              <div
                class="glass-progress-fill"
                [style.width.%]="proj.coberturaFinanceira"
                [style.background]="proj.cor || 'var(--color-gold)'"
              ></div>
            </div>

            <div class="coverage-amounts font-mono">
              <span>Financiado: R$ {{ proj.valorFinanciado | number : '1.0-0' }}</span>
              <span>Estimado: R$ {{ proj.orcamentoEstimado | number : '1.0-0' }}</span>
            </div>
          </div>

          <!-- Footer Action Button -->
          <div class="card-footer">
            <a [routerLink]="['/projects', proj.id]" class="detail-link">
              <span>Gerenciar Projeto</span>
              <span class="material-symbols-rounded">arrow_forward</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .radar-projetos-card {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      flex-wrap: wrap;
    }

    .badge-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.5px;
      margin-bottom: 6px;

      &.bordo {
        background: rgba(161, 61, 99, 0.2);
        border: 1px solid rgba(161, 61, 99, 0.4);
        color: #ebd9b6;
      }
    }

    .icon-sm { font-size: 14px; }

    .section-title {
      font-family: var(--font-primary, 'Outfit', sans-serif);
      font-size: 22px;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 4px 0;
    }

    .section-subtitle {
      font-size: 12px;
      color: #9c8e7c;
      margin: 0;
    }

    .readiness-global-pill {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      background: rgba(0, 0, 0, 0.3);
      padding: 6px 14px;
      border-radius: 12px;
      border: 1px solid rgba(216, 184, 126, 0.2);

      .lbl {
        font-size: 10px;
        color: #9c8e7c;
        font-weight: 700;
        text-transform: uppercase;
      }

      .val {
        font-size: 20px;
        font-weight: 800;
      }
    }

    .projetos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 16px;
    }

    .projeto-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(216, 184, 126, 0.18);
      border-radius: 16px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.06);
        transform: translateY(-2px);
      }

      &.has-critical {
        border-color: rgba(239, 68, 68, 0.35);
      }
    }

    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
    }

    .proj-identity {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .proj-icon-wrapper {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

      span { font-size: 22px; }
    }

    .proj-title {
      font-size: 16px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }

    .proj-deadline {
      font-size: 11px;
      color: #9c8e7c;
    }

    .readiness-chip {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 4px 10px;
      border-radius: 8px;
      min-width: 68px;

      .lbl-chip {
        font-size: 9px;
        font-weight: 800;
        text-transform: uppercase;
      }

      .score-num {
        font-size: 14px;
        font-weight: 800;
      }

      &.readiness-high {
        background: rgba(16, 185, 129, 0.15);
        color: #34d399;
        border: 1px solid rgba(16, 185, 129, 0.3);
      }

      &.readiness-med {
        background: rgba(245, 158, 11, 0.15);
        color: #fbbf24;
        border: 1px solid rgba(245, 158, 11, 0.3);
      }

      &.readiness-low {
        background: rgba(239, 68, 68, 0.15);
        color: #f87171;
        border: 1px solid rgba(239, 68, 68, 0.3);
      }
    }

    .proj-desc {
      font-size: 12px;
      color: #9c8e7c;
      margin: 0;
      line-height: 1.4;
    }

    /* Bottleneck Banner */
    .bottleneck-banner {
      background: rgba(239, 68, 68, 0.08);
      border: 1px dashed rgba(239, 68, 68, 0.4);
      border-radius: 10px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .banner-hdr {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #f87171;

      .warning-icon { font-size: 18px; }
      .banner-title { font-size: 11px; font-weight: 800; text-transform: uppercase; }
    }

    .gargalo-text {
      font-size: 12px;
      color: #ebd9b6;
      margin: 0;
    }

    .blocked-stage {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 2px;

      .lbl-blocked { font-size: 10px; color: #9c8e7c; }
      .stage-tag {
        font-size: 10px;
        font-weight: 800;
        background: rgba(239, 68, 68, 0.2);
        color: #f87171;
        padding: 2px 6px;
        border-radius: 4px;
      }
    }

    /* Progress bar */
    .coverage-section {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .coverage-hdr {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;

      .cov-lbl { color: #9c8e7c; font-weight: 700; }
      .cov-pct { font-weight: 800; }
    }

    .glass-progress-track {
      width: 100%;
      height: 8px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 9999px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .glass-progress-fill {
      height: 100%;
      border-radius: 9999px;
      transition: width 0.3s ease;
    }

    .coverage-amounts {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #9c8e7c;
    }

    .card-footer {
      display: flex;
      justify-content: flex-end;
      margin-top: 4px;
    }

    .detail-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 700;
      color: #C9A74E;
      text-decoration: none;
      transition: color 0.2s ease;

      span { font-size: 16px; }

      &:hover {
        color: #ffffff;
      }
    }

    .text-gold { color: #C9A74E !important; }
  `],
})
export class RadarProjetosComponent {
  readonly store = inject(PlanningStore);

  getReadinessColorClass(score: number): string {
    if (score >= 70) return 'readiness-high';
    if (score >= 40) return 'readiness-med';
    return 'readiness-low';
  }
}
