import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CenarioSimuladoResult,
  ParametrosSimulacaoDto,
  AplicarCenarioDto,
  BaselineState,
  ImpactoSimulacao,
  GargaloSimulacao,
  EtapaTimeline,
} from '../models/simulacao.models';
import { ProjetoReadModel } from '../models/projeto.models';

@Injectable({
  providedIn: 'root',
})
export class SimulacaoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/projetos`;

  simular(projetoId: string, dto: ParametrosSimulacaoDto): Observable<CenarioSimuladoResult> {
    return this.http.post<CenarioSimuladoResult>(`${this.baseUrl}/${projetoId}/simular`, dto);
  }

  aplicarCenario(projetoId: string, dto: AplicarCenarioDto): Observable<ProjetoReadModel> {
    return this.http.post<ProjetoReadModel>(`${this.baseUrl}/${projetoId}/simular/aplicar`, dto);
  }

  /**
   * Engine de Simulação Local (What-If Analysis Engine)
   * Executado quando a API backend não está disponível ou para preview instantâneo client-side.
   */
  calcularSimulacaoLocal(
    projeto: ProjetoReadModel,
    parametros: ParametrosSimulacaoDto
  ): CenarioSimuladoResult {
    const multAporte = Math.max(0.1, parametros.multiplicadorAporteMensal || 1.0);
    const multEsfriamento = Math.max(0, parametros.multiplicadorTempoEsfriamento ?? 1.0);
    const novoOrcamento = parametros.novoOrcamentoEstimado || projeto.orcamentoEstimado;

    // Baseline calculation
    const dataPrazoOriginal = projeto.prazoEstimado
      ? new Date(projeto.prazoEstimado)
      : new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);
    
    const dataHoje = new Date();
    const duracaoBaseMeses = Math.max(
      1,
      Math.round((dataPrazoOriginal.getTime() - dataHoje.getTime()) / (1000 * 60 * 60 * 24 * 30))
    );

    const baseline: BaselineState = {
      dataTerminoEstimada: dataPrazoOriginal.toISOString(),
      duracaoMeses: duracaoBaseMeses,
      custoTotal: projeto.custoEstimadoCalculado || projeto.orcamentoEstimado,
      readinessScore: projeto.readinessScore || 50,
      coberturaFinanceira: projeto.coberturaFinanceira || 0,
    };

    // Calculate simulation factors
    // Multiplicador de Aporte reduz o tempo total proporcionalmente ao ganho financeiro
    // Multiplicador de Esfriamento altera o tempo de retenção/planejamento de itens wishlist
    const fatorVelocidade = multAporte / (0.3 + 0.7 * (multEsfriamento || 0.1));
    const diasTotaisBase = duracaoBaseMeses * 30;
    const diasSimuladosTotais = Math.max(15, Math.round(diasTotaisBase / fatorVelocidade));

    const diasEconomizados = diasTotaisBase - diasSimuladosTotais;
    const mesesEconomizados = Number((diasEconomizados / 30).toFixed(1));

    const novaDataFimMs = dataHoje.getTime() + diasSimuladosTotais * 24 * 60 * 60 * 1000;
    const novaDataConclusao = new Date(novaDataFimMs).toISOString();

    // Novo Readiness Score & Cobertura
    const difOrcamento = novoOrcamento - projeto.orcamentoEstimado;
    let novaCobertura = projeto.coberturaFinanceira;

    if (novoOrcamento > 0) {
      const valorFinanciado = projeto.valorFinanciado || 0;
      novaCobertura = Math.min(100, Math.round((valorFinanciado / novoOrcamento) * 100));
    }

    const incrementoReadiness = Math.round(
      (multAporte - 1.0) * 18 + (1.0 - multEsfriamento) * 12 + (difOrcamento > 0 ? 5 : -5)
    );
    const novoReadinessScore = Math.max(
      0,
      Math.min(100, (projeto.readinessScore || 50) + incrementoReadiness)
    );

    const impacto: ImpactoSimulacao = {
      diasAntecipacao: diasEconomizados,
      mesesAntecipacao: mesesEconomizados,
      novaDataConclusao,
      novoReadinessScore,
      novaCoberturaFinanceira: novaCobertura,
      diferencaOrcamento: difOrcamento,
    };

    // Timeline per Etapa
    const etapasTimeline: EtapaTimeline[] = (projeto.etapas || []).map((etapa, index) => {
      const numEtapas = Math.max(1, projeto.etapas.length);
      const diasEtapaBase = Math.max(10, Math.round(diasTotaisBase / numEtapas));
      const diasEtapaSimulada = Math.max(5, Math.round(diasSimuladosTotais / numEtapas));

      const offsetRealStart = index * diasEtapaBase;
      const offsetRealEnd = (index + 1) * diasEtapaBase;
      const offsetSimStart = index * diasEtapaSimulada;
      const offsetSimEnd = (index + 1) * diasEtapaSimulada;

      const dataInicioReal = new Date(dataHoje.getTime() + offsetRealStart * 86400000).toISOString();
      const dataFimReal = new Date(dataHoje.getTime() + offsetRealEnd * 86400000).toISOString();

      const dataInicioSimulada = new Date(dataHoje.getTime() + offsetSimStart * 86400000).toISOString();
      const dataFimSimulada = new Date(dataHoje.getTime() + offsetSimEnd * 86400000).toISOString();

      const diffDias = diasEtapaBase - diasEtapaSimulada;

      let rScoreEtapa = etapa.readinessScore || 50;
      if (etapa.status === 'CONCLUIDA') {
        rScoreEtapa = 100;
      } else {
        rScoreEtapa = Math.max(0, Math.min(100, rScoreEtapa + incrementoReadiness));
      }

      return {
        etapaId: etapa.id,
        nome: etapa.nome,
        ordem: etapa.ordem || index + 1,
        status: etapa.status,
        custo: etapa.custoCalculado || etapa.custoEstimado,
        readinessScore: rScoreEtapa,
        dataInicioReal,
        dataFimReal,
        dataInicioSimulada,
        dataFimSimulada,
        diasDiferenca: diffDias,
      };
    });

    // Análise de Gargalo / Caminho Crítico
    const gargalo = this.calcularGargalo(projeto, parametros, etapasTimeline);

    return {
      projetoId: projeto.id,
      parametros,
      baseline,
      impacto,
      gargalo,
      etapasTimeline,
    };
  }

  private calcularGargalo(
    projeto: ProjetoReadModel,
    parametros: ParametrosSimulacaoDto,
    etapas: EtapaTimeline[]
  ): GargaloSimulacao {
    const etapasPendentes = (projeto.etapas || []).filter((e) => e.status !== 'CONCLUIDA');

    if (etapasPendentes.length === 0) {
      return {
        causa: 'Todas as etapas do projeto foram concluídas. Não há gargalos pendentes.',
        gravidade: 'BAIXA',
        sugestaoAcao: 'Projeto em fase final de homologação.',
      };
    }

    // Identificar etapa com menor readiness ou maior custo não financiado
    const etapaGargalo = etapasPendentes.reduce((pior, atual) => {
      const pendentePior = pior.custoCalculado - pior.valorFinanciado;
      const pendenteAtual = atual.custoCalculado - atual.valorFinanciado;
      return pendenteAtual > pendentePior ? atual : pior;
    }, etapasPendentes[0]);

    const pendenciaFinanceira = etapaGargalo.custoCalculado - etapaGargalo.valorFinanciado;

    if (parametros.multiplicadorAporteMensal < 0.8) {
      return {
        etapaId: etapaGargalo.id,
        nomeEtapa: etapaGargalo.nome,
        causa: `Aporte mensal reduzido (${Math.round(parametros.multiplicadorAporteMensal * 100)}%). A etapa "${etapaGargalo.nome}" possui R$ ${pendenciaFinanceira.toLocaleString('pt-BR')} pendentes de financiamento.`,
        gravidade: 'ALTA',
        sugestaoAcao: 'Aumente o multiplicador de aporte para no mínimo 100% para evitar atrasos em cascata.',
      };
    }

    if (parametros.multiplicadorTempoEsfriamento > 1.4) {
      return {
        etapaId: etapaGargalo.id,
        nomeEtapa: etapaGargalo.nome,
        causa: `Tempo de esfriamento elevado (${Math.round(parametros.multiplicadorTempoEsfriamento * 100)}%). Os itens de Wishlist vinculados estão bloqueando a liquidação da etapa "${etapaGargalo.nome}".`,
        gravidade: 'MEDIA',
        sugestaoAcao: 'Reduza o multiplicador de esfriamento dos itens não essenciais para destravar a aquisição.',
      };
    }

    if (pendenciaFinanceira > 0) {
      return {
        etapaId: etapaGargalo.id,
        nomeEtapa: etapaGargalo.nome,
        causa: `Caminho Crítico concentrado na etapa "${etapaGargalo.nome}" devido à pendência de R$ ${pendenciaFinanceira.toLocaleString('pt-BR')} em relação ao valor financiado.`,
        gravidade: 'MEDIA',
        sugestaoAcao: 'Vincule metas de acumulação rápida a esta etapa para acelerar o Readiness Score.',
      };
    }

    return {
      etapaId: etapaGargalo.id,
      nomeEtapa: etapaGargalo.nome,
      causa: `Ritmo de execução condicionado à ordem das etapas sequenciais.`,
      gravidade: 'BAIXA',
      sugestaoAcao: 'Manter acompanhamento mensal dos aportes.',
    };
  }
}
