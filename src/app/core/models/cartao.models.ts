export type BandeiraCartao = 'VISA' | 'MASTERCARD' | 'ELO' | 'AMEX' | 'HIPERCARD' | 'OUTRA';
export type StatusFatura = 'ABERTA' | 'FECHADA' | 'PAGA' | 'ATRASADA';
export type StatusParcela = 'PENDENTE' | 'FATURADA' | 'PAGA' | 'CANCELADA';

export interface CartaoCredito {
  id: string;
  workspaceId: string;
  nome: string;
  bandeira: BandeiraCartao;
  ultimosDigitos?: string;
  limiteTotal: number;
  limiteComprometido: number;
  limiteDisponivel: number;
  diaFechamento: number;
  diaVencimento: number;
  cor?: string;
  icone?: string;
  ativo: boolean;
}

export interface ParcelaCartao {
  id: string;
  compraId: string;
  faturaId?: string;
  numero: number;
  valor: number;
  competenciaAno: number;
  competenciaMes: number;
  status: StatusParcela;
  compra?: {
    descricao: string;
    valorTotal: number;
    qtdParcelas: number;
    dataCompra: string;
  };
}

export interface FaturaCartao {
  id: string;
  cartaoId: string;
  mes: number;
  ano: number;
  valorTotal: number;
  dataVencimento: string;
  status: StatusFatura;
  valorPago?: number;
  dataPagamento?: string;
  carteiraId?: string;
  parcelas?: ParcelaCartao[];
}

export interface CriarCartaoRequest {
  nome: string;
  bandeira?: string;
  ultimosDigitos?: string;
  limiteTotal: number;
  diaFechamento: number;
  diaVencimento: number;
  cor?: string;
  icone?: string;
}

export interface CriarCompraCartaoRequest {
  cartaoId: string;
  categoriaId: string;
  descricao: string;
  valorTotal: number;
  qtdParcelas: number;
  dataCompra: string;
  observacoes?: string;
}

export interface PagarFaturaRequest {
  carteiraId: string;
  dataPagamento?: string;
}
