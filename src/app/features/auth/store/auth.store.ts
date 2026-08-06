import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { RespostaAuth, Usuario, WorkspaceResumo, LoginRequest, RegistroRequest } from '../../../core/models/auth.models';

const API_URL = 'http://localhost:3000/api/v1/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  // State Signals
  readonly usuario = signal<Usuario | null>(this.obterUsuarioSalvo());
  readonly workspaceAtivo = signal<WorkspaceResumo | null>(this.obterWorkspaceSalvo());
  readonly token = signal<string | null>(localStorage.getItem('alicerce_access_token'));
  readonly refreshToken = signal<string | null>(localStorage.getItem('alicerce_refresh_token'));
  readonly carregando = signal<boolean>(false);
  readonly erro = signal<string | null>(null);

  // Computed Selectors
  readonly estaAutenticado = computed(() => !!this.token() && !!this.usuario());
  readonly nomeUsuario = computed(() => this.usuario()?.nome || '');
  readonly nomeWorkspace = computed(() => this.workspaceAtivo()?.nome || 'Workspace Principal');

  async registrar(dados: RegistroRequest): Promise<boolean> {
    this.carregando.set(true);
    this.erro.set(null);

    try {
      const res = await firstValueFrom(
        this.http.post<RespostaAuth>(`${API_URL}/registro`, dados)
      );

      this.salvarSessao(res);
      this.router.navigate(['/dashboard']);
      return true;
    } catch (err: any) {
      const msg = err?.error?.message || 'Erro ao realizar cadastro. Tente novamente.';
      this.erro.set(msg);
      return false;
    } finally {
      this.carregando.set(false);
    }
  }

  async login(dados: LoginRequest): Promise<boolean> {
    this.carregando.set(true);
    this.erro.set(null);

    try {
      const res = await firstValueFrom(
        this.http.post<RespostaAuth>(`${API_URL}/login`, dados)
      );

      this.salvarSessao(res);
      this.router.navigate(['/dashboard']);
      return true;
    } catch (err: any) {
      const msg = err?.error?.message || 'E-mail ou senha incorretos.';
      this.erro.set(msg);
      return false;
    } finally {
      this.carregando.set(false);
    }
  }

  async renovarToken(): Promise<boolean> {
    const tokenAtual = this.refreshToken();
    if (!tokenAtual) return false;

    try {
      const res = await firstValueFrom(
        this.http.post<{ accessToken: string; refreshToken: string }>(`${API_URL}/refresh`, {
          refreshToken: tokenAtual,
        })
      );

      this.token.set(res.accessToken);
      this.refreshToken.set(res.refreshToken);
      localStorage.setItem('alicerce_access_token', res.accessToken);
      localStorage.setItem('alicerce_refresh_token', res.refreshToken);
      return true;
    } catch {
      this.logout();
      return false;
    }
  }

  async logout(): Promise<void> {
    const tokenAtual = this.refreshToken();
    if (tokenAtual) {
      this.http.post(`${API_URL}/logout`, { refreshToken: tokenAtual }).subscribe();
    }

    this.limparSessao();
    this.router.navigate(['/auth/login']);
  }

  private salvarSessao(res: RespostaAuth): void {
    this.usuario.set(res.usuario);
    this.workspaceAtivo.set(res.workspaceAtivo);
    this.token.set(res.accessToken);
    this.refreshToken.set(res.refreshToken);

    localStorage.setItem('alicerce_usuario', JSON.stringify(res.usuario));
    localStorage.setItem('alicerce_workspace', JSON.stringify(res.workspaceAtivo));
    localStorage.setItem('alicerce_access_token', res.accessToken);
    localStorage.setItem('alicerce_refresh_token', res.refreshToken);
  }

  private limparSessao(): void {
    this.usuario.set(null);
    this.workspaceAtivo.set(null);
    this.token.set(null);
    this.refreshToken.set(null);

    localStorage.removeItem('alicerce_usuario');
    localStorage.removeItem('alicerce_workspace');
    localStorage.removeItem('alicerce_access_token');
    localStorage.removeItem('alicerce_refresh_token');
  }

  private obterUsuarioSalvo(): Usuario | null {
    const json = localStorage.getItem('alicerce_usuario');
    try { return json ? JSON.parse(json) : null; } catch { return null; }
  }

  private obterWorkspaceSalvo(): WorkspaceResumo | null {
    const json = localStorage.getItem('alicerce_workspace');
    try { return json ? JSON.parse(json) : null; } catch { return null; }
  }
}
