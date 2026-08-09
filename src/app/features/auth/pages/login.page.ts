import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../store/auth.store';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonComponent, InputComponent],
  template: `
    <div class="login-form-container">
      <div class="form-title-group">
        <h2>Entrar na sua conta</h2>
        <p>Acesse suas metas e planejamento financeiro</p>
      </div>

      @if (authStore.erro()) {
        <div class="error-banner">
          <span class="material-symbols-rounded">error</span>
          <span>{{ authStore.erro() }}</span>
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="login-form">
        <app-input
          id="email"
          label="E-mail"
          type="email"
          placeholder="seu.email@exemplo.com"
          icon="mail"
          formControlName="email"
          [required]="true"
          [invalid]="form.get('email')!.invalid && form.get('email')!.touched"
          errorMessage="Insira um e-mail válido">
        </app-input>

        <app-input
          id="senha"
          label="Senha"
          type="password"
          placeholder="••••••••"
          icon="lock"
          formControlName="senha"
          [required]="true"
          [invalid]="form.get('senha')!.invalid && form.get('senha')!.touched"
          errorMessage="A senha é obrigatória">
        </app-input>

        <div class="form-options">
          <a class="forgot-link">Esqueceu a senha?</a>
        </div>

        <app-button
          type="submit"
          variant="primary-gold"
          size="lg"
          [loading]="authStore.carregando()"
          [disabled]="form.invalid">
          Entrar no Alicerce
        </app-button>
      </form>

      <div class="form-footer">
        <span>Ainda não tem uma conta?</span>
        <a routerLink="/auth/registro" class="link-gold">Criar conta grátis</a>
      </div>
    </div>
  `,
  styles: [`
    .login-form-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-title-group {
      text-align: center;
      h2 {
        font-family: var(--font-primary);
        font-size: 20px;
        font-weight: 700;
        margin: 0;
        color: #fbf5eb;
      }
      p {
        font-size: 13px;
        color: #d6c8b4;
        margin: 4px 0 0 0;
      }
    }

    .error-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      border-radius: var(--radius-md);
      background: rgba(244, 63, 94, 0.15);
      border: 1px solid rgba(244, 63, 94, 0.35);
      color: #fb7185;
      font-size: 13px;
      font-weight: 600;

      span { font-size: 20px; }
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .form-options {
      display: flex;
      justify-content: flex-end;
    }

    .forgot-link {
      font-size: 13px;
      color: #d8b87e;
      cursor: pointer;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s ease;
      &:hover {
        color: #ebd9b6;
        text-decoration: underline;
        text-shadow: 0 0 8px rgba(216, 184, 126, 0.4);
      }
    }

    .form-footer {
      display: flex;
      justify-content: center;
      gap: 6px;
      font-size: 13px;
      color: #d6c8b4;
      border-top: 1px solid rgba(216, 184, 126, 0.2);
      padding-top: 18px;
    }

    .link-gold {
      color: #ebd9b6;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.2s ease;
      &:hover {
        color: #ffffff;
        text-decoration: underline;
      }
    }
  `],
})
export class LoginPage {
  readonly authStore = inject(AuthStore);
  private readonly fb = inject(FormBuilder);

  readonly form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required]],
  });

  async onSubmit(): Promise<void> {
    if (this.form.valid) {
      await this.authStore.login(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
