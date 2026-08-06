export type TipoCarteira =
  | 'CONTA_CORRENTE'
  | 'DINHEIRO'
  | 'CARTEIRA_DIGITAL'
  | 'POUPANCA'
  | 'INVESTIMENTO'
  | 'CARTAO_CREDITO';

export interface Carteira {
  id: string;
  workspaceId: string;
  pessoaId?: string;
  nome: string;
  tipo: TipoCarteira;
  permiteSaldoNegativo: boolean;
  cor: string;
  icone: string;
  padrao: boolean;
  ativo: boolean;
  saldoCalculado: number;
  saldoNegativoAlerta?: boolean;
  pessoa?: { id: string; nome: string };
  dataCriacao?: string;
}

export interface MovimentacaoFinanceira {
  id: string;
  workspaceId: string;
  carteiraId: string;
  criadoPorId?: string;
  tipo: 'SALDO_INICIAL' | 'TRANSFERENCIA_ENTRADA' | 'TRANSFERENCIA_SAIDA' | 'RECEITA' | 'DESPESA' | 'AJUSTE';
  valor: number;
  descricao?: string;
  data: string;
  transferenciaId?: string;
}

export interface ExtratoCarteiraResponse {
  carteira: Carteira;
  movimentacoes: MovimentacaoFinanceira[];
}

export interface ListarCarteirasResponse {
  carteiras: Carteira[];
  saldoTotalConsolidado: number;
}

export interface CriarCarteiraRequest {
  nome: string;
  tipo: TipoCarteira;
  pessoaId?: string;
  saldoInicial?: number;
  permiteSaldoNegativo?: boolean;
  cor?: string;
  icone?: string;
  padrao?: boolean;
}

export interface TransferirFundosRequest {
  carteiraOrigemId: string;
  carteiraDestinoId: string;
  valor: number;
  descricao?: string;
}

export interface TransferenciaResponse {
  sucesso: boolean;
  saldoOrigemAtual: number;
  saldoDestinoAtual: number;
  saldoNegativoAviso: boolean;
}
