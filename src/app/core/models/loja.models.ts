export interface Loja {
  id: string;
  workspaceId?: string | null;
  nome: string;
  urlWebsite?: string | null;
  urlLogo?: string | null;
  sistema: boolean;
  ativo: boolean;
  dataCriacao: string | Date;
}

export interface CriarLojaDto {
  nome: string;
  urlWebsite?: string;
  urlLogo?: string;
}

export interface AtualizarLojaDto {
  nome?: string;
  urlWebsite?: string;
  urlLogo?: string;
}
