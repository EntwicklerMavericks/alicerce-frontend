export type PrioridadeWishlist = 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';

export type StatusWishlist = 'ESFRIAMENTO' | 'PLANEJADO' | 'COMPRADO' | 'DESISTIDO';

export interface ItemWishlist {
  id: string;
  workspaceId: string;
  nome: string;
  descricao?: string | null;
  precoEstimado: number;
  precoPago?: number | null;
  prioridade: PrioridadeWishlist;
  status: StatusWishlist;
  diasEsfriamento: number;
  dataInicioEsfriamento: string | Date;
  dataFimEsfriamento?: string | Date | null;
  diasRestantesEsfriamento?: number;
  esfriamentoConcluido?: boolean;
  produtoId?: string | null;
  produto?: {
    id: string;
    nome: string;
    imagemPrincipalUrl?: string;
    menorPreco?: number;
  } | null;
  metaId?: string | null;
  meta?: {
    id: string;
    nome: string;
    percentualConcluido?: number;
  } | null;
  categoriaId?: string | null;
  categoria?: {
    id: string;
    nome: string;
    icone?: string;
    cor?: string;
  } | null;
  linkUrl?: string | null;
  imagemUrl?: string | null;
  motivoDesistencia?: string | null;
  economiaEvitada?: number | null;
  quebrouDesafio?: boolean | null;
  dataConclusao?: string | Date | null;
  dataCriacao: string | Date;
  dataAtualizacao?: string | Date;
}

export interface CriarItemWishlistDto {
  nome: string;
  descricao?: string;
  precoEstimado: number;
  prioridade?: PrioridadeWishlist;
  diasEsfriamento?: number;
  produtoId?: string;
  metaId?: string;
  categoriaId?: string;
  linkUrl?: string;
  imagemUrl?: string;
}

export interface AtualizarItemWishlistDto {
  nome?: string;
  descricao?: string;
  precoEstimado?: number;
  prioridade?: PrioridadeWishlist;
  diasEsfriamento?: number;
  produtoId?: string;
  metaId?: string;
  categoriaId?: string;
  linkUrl?: string;
  imagemUrl?: string;
  status?: StatusWishlist;
}

export interface ConcluirCompraWishlistDto {
  precoPago: number;
  carteiraId?: string;
  cartaoId?: string;
  parcelas?: number;
  dataCompra?: string;
  observacoes?: string;
  quebrouDesafio?: boolean;
}

export interface DesistirWishlistDto {
  motivoDesistencia?: string;
  destinarParaMetaId?: string;
  destinarParaCarteiraId?: string;
}

export interface WishlistAnalytics {
  totalItens: number;
  itensEmEsfriamento: number;
  itensPlanejados: number;
  itensComprados: number;
  itensDesistidos: number;
  economiaEvitadaAcumulada: number;
  taxaConclusaoConsciente: number;
  taxaCompraImpulsiva: number;
  valorTotalPlanejado: number;
}
