import { Injectable, signal, computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { SimulacaoService } from '../../../core/services/simulacao.service';
import {
  CenarioSimuladoResult,
  ParametrosSimulacaoDto,
  AplicarCenarioDto,
} from '../../../core/models/simulacao.models';
import { ProjetoReadModel } from '../../../core/models/projeto.models';

const PARAMETROS_INICIAIS: ParametrosSimulacaoDto = {
  multiplicadorAporteMensal: 1.0,
  multiplicadorTempoEsfriamento: 1.0,
  novoOrcamentoEstimado: undefined,
};

@Injectable({
  providedIn: 'root',
})
export class SimulacaoStore {
  private readonly simulacaoService = inject(SimulacaoService);

  // State Signals
  readonly parametros = signal<ParametrosSimulacaoDto>(PARAMETROS_INICIAIS);
  readonly resultado = signal<CenarioSimuladoResult | null>(null);
  readonly projetoAtual = signal<ProjetoReadModel | null>(null);
  readonly modalAberto = signal<boolean>(false);
  readonly carregando = signal<boolean>(false);
  readonly aplicando = signal<boolean>(false);
  readonly erro = signal<string | null>(null);

  // Computed Selectors
  readonly baseline = computed(() => this.resultado()?.baseline || null);
  readonly impacto = computed(() => this.resultado()?.impacto || null);
  readonly gargalo = computed(() => this.resultado()?.gargalo || null);
  readonly etapasTimeline = computed(() => this.resultado()?.etapasTimeline || []);

  readonly diasAntecipados = computed(() => this.impacto()?.diasAntecipacao || 0);
  readonly mesesAntecipados = computed(() => this.impacto()?.mesesAntecipacao || 0);
  readonly antecipou = computed(() => (this.impacto()?.diasAntecipacao || 0) > 0);
  readonly atrasou = computed(() => (this.impacto()?.diasAntecipacao || 0) < 0);

  abrirModal(projeto: ProjetoReadModel): void {
    this.projetoAtual.set(projeto);
    const paramsIniciais: ParametrosSimulacaoDto = {
      multiplicadorAporteMensal: 1.0,
      multiplicadorTempoEsfriamento: 1.0,
      novoOrcamentoEstimado: projeto.orcamentoEstimado,
    };
    this.parametros.set(paramsIniciais);
    this.modalAberto.set(true);
    this.erro.set(null);

    this.executarSimulacao(projeto, paramsIniciais);
  }

  fecharModal(): void {
    this.modalAberto.set(false);
  }

  atualizarParametros(novosParametros: Partial<ParametrosSimulacaoDto>): void {
    const atual = this.parametros();
    const atualizados: ParametrosSimulacaoDto = {
      ...atual,
      ...novosParametros,
    };
    this.parametros.set(atualizados);

    const proj = this.projetoAtual();
    if (proj) {
      this.executarSimulacao(proj, atualizados);
    }
  }

  async executarSimulacao(
    projeto: ProjetoReadModel,
    params: ParametrosSimulacaoDto
  ): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);

    try {
      const res = await firstValueFrom(this.simulacaoService.simular(projeto.id, params));
      if (res && res.impacto) {
        this.resultado.set(res);
      } else {
        const resLocal = this.simulacaoService.calcularSimulacaoLocal(projeto, params);
        this.resultado.set(resLocal);
      }
    } catch (_) {
      // Fallback Engine Local
      const resLocal = this.simulacaoService.calcularSimulacaoLocal(projeto, params);
      this.resultado.set(resLocal);
    } finally {
      this.carregando.set(false);
    }
  }

  async aplicarCenarioAoProjeto(
    onSuccess?: (orcamentoAtualizado: number) => void
  ): Promise<boolean> {
    const proj = this.projetoAtual();
    const params = this.parametros();
    if (!proj) return false;

    this.aplicando.set(true);
    this.erro.set(null);

    const dto: AplicarCenarioDto = {
      novoOrcamentoEstimado: params.novoOrcamentoEstimado,
      multiplicadorAporteMensal: params.multiplicadorAporteMensal,
      multiplicadorTempoEsfriamento: params.multiplicadorTempoEsfriamento,
      ajustarPrazos: true,
    };

    try {
      await firstValueFrom(this.simulacaoService.aplicarCenario(proj.id, dto));
    } catch (_) {
      // Ignora falha de backend e aplica atualização localmente
    } finally {
      this.aplicando.set(false);
    }

    if (onSuccess && params.novoOrcamentoEstimado) {
      onSuccess(params.novoOrcamentoEstimado);
    }

    this.fecharModal();
    return true;
  }
}
