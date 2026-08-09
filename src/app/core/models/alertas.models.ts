export type TipoAlerta =
  | 'CONTA_VENCENDO'
  | 'META_ATINGIDA'
  | 'ORCAMENTO_EXCEDIDO'
  | 'SALARIO_RECEBIDO'
  | 'QUEDA_PRECO'
  | 'SISTEMA';

export type SeveridadeAlerta = 'CRITICO' | 'ALTO' | 'MEDIO';

export interface Alerta {
  id: string;
  usuarioId: string;
  workspaceId?: string | null;
  tipo: TipoAlerta;
  severidade: SeveridadeAlerta;
  titulo: string;
  mensagem: string;
  tipoReferencia?: string | null;
  referenciaId?: string | null;
  chaveIdempotencia?: string | null;
  lido: boolean;
  dataLeitura?: string | null;
  dataDisparo: string;
}

export interface ConfigAlerta {
  id?: string;
  usuarioId?: string;
  tipo: TipoAlerta;
  ativo: boolean;
  limite?: number | null;
  config?: Record<string, any> | null;
}

export interface AlertasPaginadosResult {
  data: Alerta[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface ListarAlertasFiltros {
  page?: number;
  pageSize?: number;
  apenasNaoLidos?: boolean;
  severidade?: SeveridadeAlerta;
}

export interface GerarAlertasDto {
  referenceDate?: string;
  despesas?: any[];
  faturas?: any[];
  orcamentos?: any[];
  metas?: any[];
  salarios?: any[];
  wishlist?: any[];
  sistemas?: any[];
}
