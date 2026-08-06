export interface Usuario {
  id: string;
  nome: string;
  email: string;
  avatarUrl?: string;
}

export interface WorkspaceResumo {
  id: string;
  nome: string;
  tipo?: string;
  papel?: string;
}

export interface RespostaAuth {
  usuario: Usuario;
  workspaceAtivo: WorkspaceResumo;
  accessToken: string;
  refreshToken: string;
}

export interface RegistroRequest {
  nome: string;
  email: string;
  senha: string;
}

export interface LoginRequest {
  email: string;
  senha: string;
}
