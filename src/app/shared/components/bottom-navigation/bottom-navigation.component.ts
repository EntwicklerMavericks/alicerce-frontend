import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HapticsService } from '../../../core/platform/haptics.service';

@Component({
  selector: 'app-bottom-navigation',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="bottom-nav">
      <a routerLink="/dashboard" routerLinkActive="active" class="nav-item" (click)="onTabClick()">
        <span class="material-symbols-rounded nav-icon">grid_view</span>
        <span class="nav-label">Dashboard</span>
      </a>

      <a routerLink="/transactions" routerLinkActive="active" class="nav-item" (click)="onTabClick()">
        <span class="material-symbols-rounded nav-icon">receipt_long</span>
        <span class="nav-label">Lançamentos</span>
      </a>

      <a routerLink="/calendar" routerLinkActive="active" class="nav-item" (click)="onTabClick()">
        <span class="material-symbols-rounded nav-icon">calendar_month</span>
        <span class="nav-label">Calendário</span>
      </a>

      <a routerLink="/goals" routerLinkActive="active" class="nav-item" (click)="onTabClick()">
        <span class="material-symbols-rounded nav-icon">flag</span>
        <span class="nav-label">Metas</span>
      </a>

      <a routerLink="/menu" routerLinkActive="active" class="nav-item" (click)="onTabClick()">
        <span class="material-symbols-rounded nav-icon">menu</span>
        <span class="nav-label">Menu</span>
      </a>
    </nav>
  `,
  styles: [`
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: calc(60px + var(--sab));
      padding-bottom: var(--sab);
      background: rgba(24, 7, 10, 0.92);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-top: 1px solid rgba(216, 184, 126, 0.25);
      display: flex;
      align-items: center;
      justify-content: space-around;
      z-index: 100;
    }

    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      color: rgba(235, 217, 182, 0.6);
      text-decoration: none;
      font-size: 10px;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 12px;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

      .nav-icon {
        font-size: 22px;
        transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      }

      &.active {
        color: #d8b87e;

        .nav-icon {
          transform: translateY(-2px) scale(1.1);
          color: #ebd9b6;
        }

        &::after {
          content: '';
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--alic-color-gold-main);
          box-shadow: 0 0 8px #d8b87e;
          margin-top: 2px;
        }
      }
    }
  `],
})
export class BottomNavigationComponent {
  private readonly haptics = inject(HapticsService);

  onTabClick(): void {
    this.haptics.impactLight();
  }
}
