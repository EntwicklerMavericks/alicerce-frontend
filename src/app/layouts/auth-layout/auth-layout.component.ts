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
        radial-gradient(circle at 50% 20%, rgba(146, 38, 56, 0.45) 0%, transparent 65%),
        radial-gradient(circle at 80% 80%, rgba(216, 184, 126, 0.3) 0%, transparent 55%);
      overflow-y: auto;
    }

    .auth-card {
      width: 100%;
      max-width: 440px;
      padding: 40px 32px;
      display: flex;
      flex-direction: column;
      gap: 28px;
      background: linear-gradient(145deg, rgba(32, 11, 16, 0.94) 0%, rgba(20, 7, 10, 0.96) 100%) !important;
      backdrop-filter: blur(24px) !important;
      -webkit-backdrop-filter: blur(24px) !important;
      border-radius: var(--radius-lg) !important;
      border: 1px solid rgba(216, 184, 126, 0.35) !important;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.75), 0 0 35px rgba(216, 184, 126, 0.15) !important;
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
      background: linear-gradient(135deg, #ebd9b6 0%, #d8b87e 50%, #9e7d44 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 25px rgba(216, 184, 126, 0.4);
      margin-bottom: 14px;
    }

    .logo-icon {
      font-size: 32px;
      color: #2b0b10;
    }

    .auth-title {
      font-family: var(--font-primary);
      font-size: 26px;
      font-weight: 800;
      letter-spacing: 4px;
      margin: 0;
      background: linear-gradient(135deg, #ffffff 0%, #ebd9b6 40%, #d8b87e 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 2px 8px rgba(0,0,0,0.5));
    }

    .auth-subtitle {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 2.5px;
      color: #d8b87e;
      margin-top: 6px;
      opacity: 0.95;
      text-shadow: 0 0 10px rgba(216, 184, 126, 0.3);
    }
  `],
})
export class AuthLayoutComponent {}
