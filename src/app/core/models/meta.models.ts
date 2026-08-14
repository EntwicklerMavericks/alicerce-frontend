export type StatusMeta = 'EM_ANDAMENTO' | 'CONCLUIDA' | 'ATRASADA' | 'CANCELADA';

export interface AporteMeta {
  id: string;
  metaId: string;
  valor: number;
  data: string; // YYYY-MM-DD
  observacao?: string;
  dataCriacao?: string;
}

export interface Meta {
  id: string;
  workspaceId: string;
  nome: string;
  descricao?: string;
  valorAlvo: number;
  valorAtual: number;
  percentualConcluido: number; // 0 a 100+
  prazo: string; // YYYY-MM-DD
  status: StatusMeta;
  cor?: string;
  icone?: string;
  ritmoMensalEstimado?: number; // R$/mês necessário para cumprir o prazo
  diasRestantes?: number;
  projetadoPrazo?: boolean; // true = No prazo, false = Atrasado
  aportes?: AporteMeta[];
  dataCriacao?: string;
  dataAtualizacao?: string;
}

export interface CriarMetaDto {
  nome: string;
  descricao?: string;
  valorAlvo: number;
  prazo: string;
  cor?: string;
  icone?: string;
  valorInicial?: number;
}

export interface CriarAporteDto {
  valor: number;
  data?: string;
  descricao?: string;
  observacao?: string;
}

export interface EsforcoMeta {
  metaId: string;
  ritmoNecessario: number;
  progressoEstimado: number;
  mesesRestantes: number;
  statusPrazo: 'NO_PRAZO' | 'ATRASADO' | 'CONCLUIDO';
}
