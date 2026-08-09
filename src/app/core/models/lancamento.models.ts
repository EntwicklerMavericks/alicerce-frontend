import { Carteira } from './carteira.models';
import { Pessoa } from './pessoa.models';

export type StatusDocumento = 'ATIVO' | 'CANCELADO';
export type StatusLiquidacao = 'PENDENTE' | 'LIQUIDADO';

export interface Categoria {
  id: string;
  nome: string;
  tipo: 'RECEITA' | 'DESPESA' | 'AMBAS';
  icone?: string;
  cor?: string;
}

export interface Receita {
  id: string;
  workspaceId: string;
  pessoaId?: string;
  carteiraId?: string;
  categoriaId: string;
  descricao: string;
  valor: number;
  data: string;
  statusDocumento: StatusDocumento;
  statusLiquidacao: StatusLiquidacao;
  dataLiquidacao?: string;
  observacoes?: string;
  recorrente: boolean;
  origemRecorrenciaId?: string;
  carteira?: Carteira;
  categoria?: Categoria;
  pessoa?: Pessoa;
}

export interface Despesa {
  id: string;
  workspaceId: string;
  carteiraId?: string;
  cartaoId?: string;
  categoriaId: string;
  metaId?: string;
  parcelamentoId?: string;
  descricao: string;
  valor: number;
  dataVencimento: string;
  dataPagamento?: string;
  statusDocumento: StatusDocumento;
  statusLiquidacao: StatusLiquidacao;
  dataLiquidacao?: string;
  observacoes?: string;
  recorrente: boolean;
  origemRecorrenciaId?: string;
  carteira?: Carteira;
  categoria?: Categoria;
}

export interface CriarReceitaRequest {
  descricao: string;
  valor: number;
  data: string;
  categoriaId: string;
  carteiraId?: string;
  pessoaId?: string;
  statusLiquidacao?: StatusLiquidacao;
  observacoes?: string;
  recorrente?: boolean;
}

export interface CriarDespesaRequest {
  descricao: string;
  valor: number;
  dataVencimento: string;
  categoriaId: string;
  carteiraId?: string;
  cartaoId?: string;
  metaId?: string;
  statusLiquidacao?: StatusLiquidacao;
  observacoes?: string;
  recorrente?: boolean;
}

export interface EstornarLancamentoRequest {
  motivo: string;
  observacao?: string;
}

export interface ResumoFluxoCaixaResponse {
  mes: number;
  ano: number;
  saldoAtualLedger: number;
  totalReceitasLiquidadas: number;
  totalReceitasPendentes: number;
  totalDespesasLiquidadas: number;
  totalDespesasPendentes: number;
  saldoProjetado: number;
  fluxoDoPeriodo: number;
}
