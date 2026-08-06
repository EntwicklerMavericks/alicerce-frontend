import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="auth-container">
      <div class="auth-bg-overlay"></div>
      
      <div class="auth-card glass-card animate-fade-in">
        <div class="auth-header">
          <div class="logo-box">
            <span class="material-symbols-rounded logo-icon">foundation</span>
          </div>
          <h1 class="auth-title">ALICERCE</h1>
          <span class="auth-subtitle">FINANÇAS BASEADAS EM OBJETIVOS</span>
        </div>

        <div class="auth-body">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      position: relative;
      min-height: 100vh;
      width: 100vw;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: #120709;
      background-image: 
        radial-gradient(circle at 50% 20%, rgba(146, 38, 56, 0.4) 0%, transparent 60%),
        radial-gradient(circle at 80% 80%, rgba(216, 184, 126, 0.25) 0%, transparent 50%);
      overflow-y: auto;
    }

    .auth-card {
      width: 100%;
      max-width: 440px;
      padding: 40px 32px;
      display: flex;
      flex-direction: column;
      gap: 28px;
      border: 1px solid rgba(216, 184, 126, 0.35);
      box-shadow: 0 16px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(216, 184, 126, 0.2);
    }

    .auth-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .logo-box {
      width: 56px;
      height: 56px;
      border-radius: var(--radius-md);
      background: var(--color-gold-gradient);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-gold-glow);
      margin-bottom: 12px;
    }

    .logo-icon {
      font-size: 32px;
      color: #2b0b10;
    }

    .auth-title {
      font-family: var(--font-primary);
      font-size: 26px;
      font-weight: 800;
      letter-spacing: 3px;
      margin: 0;
      background: linear-gradient(135deg, #ebd9b6 0%, #d8b87e 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .auth-subtitle {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 2px;
      color: rgba(235, 217, 182, 0.7);
      margin-top: 4px;
    }
  `],
})
export class AuthLayoutComponent {}
