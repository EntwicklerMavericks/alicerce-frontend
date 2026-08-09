export type TipoPeriodoRelatorio =
  | 'MES_ATUAL'
  | 'ULTIMOS_30_DIAS'
  | 'ULTIMOS_3_MESES'
  | 'ULTIMOS_6_MESES'
  | 'ANO_ATUAL'
  | 'PERSONALIZADO';

export interface FiltroRelatorioPeriodo {
  inicio?: string; // YYYY-MM-DD
  fim?: string; // YYYY-MM-DD
  tipoPeriodo?: TipoPeriodoRelatorio;
  categoriaId?: string;
  carteiraId?: string;
  cartaoId?: string;
}

export interface HistoricoDiarioFluxo {
  data: string; // Ex: '01/08' ou '2026-08-01'
  receita: number;
  despesa: number;
  saldoAcumulado: number;
}

export interface ComparativoMesAnterior {
  receitaVariacaoPct: number;
  despesaVariacaoPct: number;
  saldoVariacaoPct: number;
}

export interface FluxoCaixaRelatorio {
  totalReceitas: number;
  totalDespesas: number;
  saldoLiquido: number;
  taxaPoupanca: number; // Ex: 28.5 (percentual)
  historicoDiario: HistoricoDiarioFluxo[];
  comparativoMesAnterior: ComparativoMesAnterior;
}

export interface CategoriaItemRelatorio {
  categoriaId: string;
  nome: string;
  icone?: string;
  cor?: string;
  valor: number;
  percentual: number;
  quantidadeLancamentos: number;
}

export interface TopDespesaRelatorio {
  descricao: string;
  valor: number;
  data: string;
  categoria: string;
}

export interface CategoriasRelatorio {
  distribuicaoDespesas: CategoriaItemRelatorio[];
  distribuicaoReceitas: CategoriaItemRelatorio[];
  topDespesas: TopDespesaRelatorio[];
}

export interface CartaoItemRelatorio {
  cartaoId: string;
  nomeCartao: string;
  bandeira: string;
  cor?: string;
  limiteTotal: number;
  limiteUsado: number;
  percentualUso: number;
  valorFaturaAtual: number;
}

export interface ProjecaoFaturaRelatorio {
  mesAno: string; // Ex: "Set/2026"
  valorTotal: number;
}

export interface CartoesRelatorio {
  totalFaturas: number;
  totalLimiteComprometido: number;
  usoPorCartao: CartaoItemRelatorio[];
  projecaoProximasFaturas: ProjecaoFaturaRelatorio[];
}

export interface MetaStatusRelatorio {
  metaId: string;
  nome: string;
  valorAtual: number;
  valorAlvo: number;
  percentualConcluido: number;
  status: 'EM_ANDAMENTO' | 'CONCLUIDA' | 'ATRASADA';
}

export interface ProjetoStatusRelatorio {
  projetoId: string;
  titulo: string;
  orcamentoTotal: number;
  valorGasto: number;
  percentualProgresso: number;
  status: 'EM_ANDAMENTO' | 'CONCLUIDO' | 'PAUSADO';
}

export interface MetasProjetosRelatorio {
  totalAportadoMetas: number;
  progressoGeralMetasPct: number;
  totalInvestidoProjetos: number;
  metasStatus: MetaStatusRelatorio[];
  projetosStatus: ProjetoStatusRelatorio[];
}

export interface RelatoriosResult {
  periodo: FiltroRelatorioPeriodo;
  fluxoCaixa: FluxoCaixaRelatorio;
  categorias: CategoriasRelatorio;
  cartoes: CartoesRelatorio;
  metasProjetos: MetasProjetosRelatorio;
  geradoEm: string;
}
