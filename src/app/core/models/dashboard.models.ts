export type SeveridadeAlerta = 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAIXO' | 'INFO';

export type TipoAlertaDashboard =
  | 'ORCAMENTO_EXCEDIDO'
  | 'FATURA_VENCIMENTO'
  | 'META_ATRASADA'
  | 'SALDO_BAIXO'
  | 'CONTA_VENCENDO'
  | 'RECORRENCIA_PENDENTE'
  | 'OUTRO';

export interface AlertaDashboard {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: TipoAlertaDashboard;
  severidade: SeveridadeAlerta;
  data?: string;
  link?: string;
  lido?: boolean;
}

export interface FaturaAbertaDashboard {
  cartaoId: string;
  nomeCartao: string;
  bandeira: string;
  cor?: string;
  valorFatura: number;
  dataVencimento: string;
  status: 'ABERTA' | 'FECHADA' | 'PAGA' | 'ATRASADA';
  limiteDisponivel: number;
  limiteTotal: number;
  limiteComprometido: number;
}

export interface OrcamentoResumoDashboard {
  id: string;
  categoria: string;
  valorTeto: number;
  valorGasto: number;
  percentualConsumido: number;
  status: 'NORMAL' | 'ALERTA' | 'ATENCAO' | 'EXCEDIDO';
  cor?: string;
  icone?: string;
}

export interface MetaPrioritariaDashboard {
  id: string;
  nome: string;
  valorAlvo: number;
  valorAtual: number;
  percentualConcluido: number;
  prazo: string;
  status: string;
  ritmoMensalEstimado?: number;
  diasRestantes?: number;
  cor?: string;
  icone?: string;
}

export interface DashboardResult {
  competencia: string; // YYYY-MM
  usuarioNome?: string;
  saldoAtual: number;
  saldoProjetado: number;
  receitasPendentes: number;
  despesasPendentes: number;
  receitasLiquidadasMes: number;
  despesasLiquidadasMes: number;
  fluxoDoPeriodo: number;
  variacaoSaldoMesAnterior?: number;
  faturasAbertas: FaturaAbertaDashboard[];
  cartoes?: Array<{
    id: string;
    nome: string;
    bandeira: string;
    cor?: string;
    limiteTotal: number;
    limiteComprometido: number;
    limiteDisponivel: number;
  }>;
  orcamentos: OrcamentoResumoDashboard[];
  metasPrioritarias: MetaPrioritariaDashboard[];
  alertas: AlertaDashboard[];
  resumoExecutivo?: string;
}
