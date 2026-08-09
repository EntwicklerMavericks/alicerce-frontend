import { Loja } from './loja.models';

export interface ImagemProduto {
  id: string;
  produtoId: string;
  url: string;
  ordem: number;
  principal: boolean;
  ativo: boolean;
  dataCriacao: string | Date;
}

export interface HistoricoPreco {
  id: string;
  linkProdutoId: string;
  preco: number;
  data: string | Date;
  lojaNome?: string;
}

export interface LinkProduto {
  id: string;
  produtoId: string;
  lojaId: string;
  url: string;
  preco: number;
  versao: number;
  ativo: boolean;
  ultimaVerificacao?: string | Date | null;
  dataCriacao: string | Date;
  dataAtualizacao?: string | Date;
  loja?: Loja;
  historicoPrecos?: HistoricoPreco[];
}

export interface Produto {
  id: string;
  workspaceId: string;
  nome: string;
  descricao?: string | null;
  marca?: string | null;
  categoriaId?: string | null;
  categoria?: {
    id: string;
    nome: string;
    icone?: string;
    cor?: string;
  } | null;
  observacoes?: string | null;
  ativo: boolean;
  dataCriacao: string | Date;
  dataAtualizacao: string | Date;
  imagens?: ImagemProduto[];
  links?: LinkProduto[];
  
  // Dynamic / computed client-side helpers
  menorPreco?: number | null;
  lojaMenorPreco?: string | null;
  imagemPrincipalUrl?: string | null;
}

export interface CriarProdutoDto {
  nome: string;
  descricao?: string;
  marca?: string;
  categoriaId?: string;
  observacoes?: string;
  imagemInicialUrl?: string;
}

export interface AtualizarProdutoDto {
  nome?: string;
  descricao?: string;
  marca?: string;
  categoriaId?: string;
  observacoes?: string;
}

export interface VincularLinkDto {
  lojaId: string;
  url: string;
  preco: number;
}

export interface AtualizarPrecoLinkDto {
  preco: number;
  url?: string;
}
