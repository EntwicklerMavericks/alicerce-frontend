import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../store/auth.store';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonComponent, InputComponent],
  template: `
    <div class="register-form-container">
      <div class="form-title-group">
        <h2>Criar sua conta no Alicerce</h2>
        <p>Comece com seu Workspace Principal pré-configurado</p>
      </div>

      @if (authStore.erro()) {
        <div class="error-banner">
          <span class="material-symbols-rounded">error</span>
          <span>{{ authStore.erro() }}</span>
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="register-form">
        <app-input
          id="nome"
          label="Nome Completo"
          type="text"
          placeholder="Ex: Eduardo Oliveira"
          icon="person"
          formControlName="nome"
          [required]="true"
          [invalid]="form.get('nome')!.invalid && form.get('nome')!.touched"
          errorMessage="Insira seu nome completo">
        </app-input>

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
          placeholder="Mínimo de 6 caracteres"
          icon="lock"
          formControlName="senha"
          [required]="true"
          [invalid]="form.get('senha')!.invalid && form.get('senha')!.touched"
          errorMessage="A senha deve ter no mínimo 6 caracteres">
        </app-input>

        <div class="onboarding-notice">
          <span class="material-symbols-rounded">verified_user</span>
          <span>Seu <strong>Workspace Principal</strong> e <strong>Conta Corrente</strong> serão criados automaticamente.</span>
        </div>

        <app-button
          type="submit"
          variant="primary-gold"
          size="lg"
          [loading]="authStore.carregando()"
          [disabled]="form.invalid">
          Criar Conta & Workspace
        </app-button>
      </form>

      <div class="form-footer">
        <span>Já possui uma conta?</span>
        <a routerLink="/auth/login" class="link-gold">Fazer Login</a>
      </div>
    </div>
  `,
  styles: [`
    .register-form-container {
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
        color: var(--color-text-primary);
      }
      p {
        font-size: 13px;
        color: var(--color-text-tertiary);
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
      border: 1px solid rgba(244, 63, 94, 0.3);
      color: #fb7185;
      font-size: 13px;
      font-weight: 600;

      span { font-size: 20px; }
    }

    .register-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .onboarding-notice {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 14px;
      border-radius: var(--radius-md);
      background: rgba(216, 184, 126, 0.1);
      border: 1px solid rgba(216, 184, 126, 0.25);
      color: var(--color-champagne-light);
      font-size: 12px;

      span.material-symbols-rounded {
        color: var(--color-champagne-main);
        font-size: 20px;
      }
    }

    .form-footer {
      display: flex;
      justify-content: center;
      gap: 6px;
      font-size: 13px;
      color: var(--color-text-secondary);
      border-top: 1px solid var(--color-border-subtle);
      padding-top: 16px;
    }

    .link-gold {
      color: var(--color-champagne-main);
      font-weight: 700;
      text-decoration: none;
      &:hover { text-decoration: underline; }
    }
  `],
})
export class RegisterPage {
  readonly authStore = inject(AuthStore);
  private readonly fb = inject(FormBuilder);

  readonly form: FormGroup = this.fb.group({
    nome: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
  });

  async onSubmit(): Promise<void> {
    if (this.form.valid) {
      await this.authStore.registrar(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
