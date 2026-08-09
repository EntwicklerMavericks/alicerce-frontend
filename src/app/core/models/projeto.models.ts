import { ItemWishlist } from './wishlist.models';
import { Meta } from './meta.models';

export type StatusProjeto = 'PLANEJAMENTO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';
export type StatusEtapa = 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA';
export type TipoItemProjeto = 'WISHLIST' | 'META';

export interface ItemProjeto {
  id: string;
  etapaId: string;
  tipo: TipoItemProjeto;
  referenciaId: string;
  ordem?: number;
  valorCalculado?: number;
  valorFinanciado?: number;
  itemWishlist?: ItemWishlist | null;
  meta?: Meta | null;
  dataCriacao?: string | Date;
}

export interface EtapaProjeto {
  id: string;
  projetoId: string;
  nome: string;
  descricao?: string | null;
  ordem: number;
  status: StatusEtapa;
  custoEstimado: number;
  custoReal?: number;
  itens?: ItemProjeto[];
  dataCriacao?: string | Date;
  dataAtualizacao?: string | Date;
}

export interface EtapaProjetoReadModel extends EtapaProjeto {
  custoCalculado: number;
  valorFinanciado: number;
  coberturaFinanceira: number;
  readinessScore: number;
  itensCount: number;
}

export interface Projeto {
  id: string;
  workspaceId: string;
  nome: string;
  descricao?: string | null;
  orcamentoEstimado: number;
  status: StatusProjeto;
  prazoEstimado?: string | null;
  cor?: string | null;
  icone?: string | null;
  etapas?: EtapaProjeto[];
  dataCriacao?: string | Date;
  dataAtualizacao?: string | Date;
}

export interface ProjetoReadModel extends Projeto {
  etapas: EtapaProjetoReadModel[];
  custoEstimadoCalculado: number;
  valorFinanciado: number;
  coberturaFinanceira: number;
  progressoFisico: number;
  readinessScore: number;
  totalEtapas: number;
  etapasConcluidas: number;
  totalItensVinculados: number;
}

export interface CriarProjetoDto {
  nome: string;
  descricao?: string;
  orcamentoEstimado: number;
  prazoEstimado?: string;
  cor?: string;
  icone?: string;
}

export interface AtualizarProjetoDto {
  nome?: string;
  descricao?: string;
  orcamentoEstimado?: number;
  prazoEstimado?: string;
  cor?: string;
  icone?: string;
  status?: StatusProjeto;
}

export interface CriarEtapaProjetoDto {
  nome: string;
  descricao?: string;
  ordem?: number;
  custoEstimado?: number;
}

export interface AtualizarEtapaProjetoDto {
  nome?: string;
  descricao?: string;
  ordem?: number;
  status?: StatusEtapa;
  custoEstimado?: number;
  custoReal?: number;
}

export interface ReordenarEtapasDto {
  etapaIds: string[];
}

export interface VincularItemDto {
  tipo: TipoItemProjeto;
  referenciaId: string;
  etapaId?: string;
}
