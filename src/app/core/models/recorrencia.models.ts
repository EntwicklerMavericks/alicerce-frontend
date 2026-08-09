export type StatusRecorrencia = 'ATIVA' | 'PAUSADA' | 'CANCELADA';
export type TipoTransacao = 'RECEITA' | 'DESPESA';

export interface RegraRecorrencia {
  id: string;
  workspaceId: string;
  tipo: TipoTransacao;
  descricao: string;
  valor: number;
  diaVencimento: number;
  categoriaId: string;
  carteiraId?: string;
  status: StatusRecorrencia;
  dataInicio: string;
  dataFim?: string;
  categoria?: {
    nome: string;
    icone?: string;
    cor?: string;
  };
  carteira?: {
    nome: string;
  };
}

export interface CriarRegraRecorrenciaRequest {
  tipo: TipoTransacao;
  descricao: string;
  valor: number;
  diaVencimento: number;
  categoriaId: string;
  carteiraId?: string;
  dataInicio: string;
  dataFim?: string;
}
