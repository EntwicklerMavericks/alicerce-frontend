export type ZonaSaudeFinanceira = 'VERDE' | 'AMARELO' | 'VERMELHO';

export type TipoEventoProjetado =
  | 'RECEITA'
  | 'DESPESA'
  | 'META'
  | 'PROJETO'
  | 'RECORRENCIA'
  | 'FATURA';

export interface ProjectedEvent {
  id: string;
  competencia: string; // YYYY-MM
  tipo: TipoEventoProjetado;
  descricao: string;
  categoria: string;
  valor: number;
  fonte: string;
  confirmado?: boolean;
}

export interface ExplanationBreakdown {
  categoria: string;
  tipo: 'RECEITA' | 'DESPESA';
  valorTotal: number;
  percentual: number;
  cor: string;
  icone?: string;
  quantidadeEventos: number;
  itens?: ProjectedEvent[];
}

export interface CompetenciaForecast {
  competencia: string; // YYYY-MM e.g. "2026-08"
  mesRotulo: string; // e.g. "Ago/26"
  saldoInicial: number;
  totalEntradas: number;
  totalSaidas: number;
  resultadoMes: number; // Entradas - Saídas
  saldoProjetado: number; // Saldo Acumulado ao fim do mês
  zonaSaude: ZonaSaudeFinanceira;
  eventos: ProjectedEvent[];
  breakdownCategorias: ExplanationBreakdown[];
}

export interface StatMesDestaque {
  competencia: string;
  mesRotulo: string;
  valor: number;
}

export interface TimelineForecastResult {
  saldoAtual: number;
  saldoProjetado12Meses: number;
  mesMaiorSaldo: StatMesDestaque;
  mesMaiorAperto: StatMesDestaque;
  zonaGlobal: ZonaSaudeFinanceira;
  competencias: CompetenciaForecast[];
  breakdownConsolidado: ExplanationBreakdown[];
}

/* ==========================================
   SPRINT 5.2 — Planning Overview & Visão Unificada
   ========================================== */

export type VencimentoTipo = 'FATURA' | 'DESPESA_FIXA' | 'PARCELA' | 'BOLETO' | 'RECORRENCIA' | 'OUTRO';

export type VencimentoStatus = 'PENDENTE' | 'PAGO' | 'ATRASADO' | 'VENCENDO_HOJE';

export type OrcamentoStatus = 'DENTRO_DO_LIMITE' | 'ATENCAO' | 'ALERTA' | 'EXCEDIDO';

export interface CalendarioVencimento {
  id: string;
  descricao: string;
  categoria: string;
  valor: number;
  dataVencimento: string; // YYYY-MM-DD
  diaDoMes: number;
  tipo: VencimentoTipo;
  status: VencimentoStatus;
  origemId?: string;
  origemNome?: string;
  cartaoNome?: string;
  parcelaInfo?: string; // e.g. "3/10"
}

export interface ProjetoGargalo {
  id: string;
  nome: string;
  descricao?: string;
  orcamentoEstimado: number;
  valorFinanciado: number;
  coberturaFinanceira: number; // 0-100%
  readinessScore: number; // 0-100 score
  temCaminhoCritico: boolean;
  motivoGargalo?: string;
  etapaBloqueada?: string;
  prazoEstimado?: string;
  cor?: string;
  icone?: string;
  status?: string;
}

export interface MetaDestaque {
  id: string;
  nome: string;
  valorAlvo: number;
  valorAtual: number;
  percentualConcluido: number;
  prazo: string;
  diasRestantes: number;
  statusPrazo: 'NO_PRAZO' | 'ATRASADO' | 'CONCLUIDO';
  ritmoMensalEstimado: number;
  cor?: string;
  icone?: string;
}

export interface OrcamentoAlerta {
  id: string;
  categoria: string;
  valorTeto: number;
  valorGasto: number;
  percentualConsumido: number;
  status: OrcamentoStatus;
  cor?: string;
  icone?: string;
}

export interface ResumoFinanceiroOverview {
  saldoDisponivelTotal: number;
  compromissosProximos30Dias: number;
  capacidadeAporteMensal: number;
}

export interface PlanningOverviewResult {
  vencimentos30Dias: CalendarioVencimento[];
  totalVencimentos30Dias: number;
  valorTotalVencimentos30Dias: number;
  totalVencidosAtrasados: number;
  valorVencidosAtrasados: number;
  
  projetosGargalo: ProjetoGargalo[];
  totalProjetosGargalo: number;
  readinessMedioProjetos: number;
  
  metasDestaque: MetaDestaque[];
  totalMetasAtivas: number;
  progressoMedioMetas: number;
  
  orcamentosAlerta: OrcamentoAlerta[];
  totalOrcamentosAlerta: number;
  mediaConsumoOrcamentos: number;
  
  healthScoreGeral: number; // 0-100
  resumoFinanceiro: ResumoFinanceiroOverview;
}

