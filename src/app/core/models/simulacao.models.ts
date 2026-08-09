import { StatusEtapa } from './projeto.models';

export interface ParametrosSimulacaoDto {
  multiplicadorAporteMensal: number;
  novoOrcamentoEstimado?: number;
  multiplicadorTempoEsfriamento: number;
}

export interface AplicarCenarioDto {
  novoOrcamentoEstimado?: number;
  ajustarPrazos?: boolean;
  multiplicadorAporteMensal?: number;
  multiplicadorTempoEsfriamento?: number;
}

export interface BaselineState {
  dataTerminoEstimada: string;
  duracaoMeses: number;
  custoTotal: number;
  readinessScore: number;
  coberturaFinanceira: number;
}

export interface EtapaTimeline {
  etapaId: string;
  nome: string;
  ordem: number;
  status: StatusEtapa;
  custo: number;
  readinessScore: number;
  dataInicioReal: string;
  dataFimReal: string;
  dataInicioSimulada: string;
  dataFimSimulada: string;
  diasDiferenca: number;
}

export interface ImpactoSimulacao {
  diasAntecipacao: number;
  mesesAntecipacao: number;
  novaDataConclusao: string;
  novoReadinessScore: number;
  novaCoberturaFinanceira: number;
  diferencaOrcamento: number;
}

export interface GargaloSimulacao {
  etapaId?: string;
  nomeEtapa?: string;
  causa: string;
  gravidade: 'ALTA' | 'MEDIA' | 'BAIXA';
  sugestaoAcao: string;
}

export interface CenarioSimuladoResult {
  projetoId: string;
  parametros: ParametrosSimulacaoDto;
  baseline: BaselineState;
  impacto: ImpactoSimulacao;
  gargalo: GargaloSimulacao;
  etapasTimeline: EtapaTimeline[];
}
