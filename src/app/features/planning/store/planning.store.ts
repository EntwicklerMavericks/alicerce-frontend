import { Injectable, signal, computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PlanningService } from '../../../core/services/planning.service';
import {
  TimelineForecastResult,
  CompetenciaForecast,
  ExplanationBreakdown,
  ZonaSaudeFinanceira,
  PlanningOverviewResult,
  CalendarioVencimento,
  ProjetoGargalo,
  MetaDestaque,
  OrcamentoAlerta,
  VencimentoStatus,
  VencimentoTipo,
} from '../../../core/models/planning.models';

export type ViewModePlanning = 'CUMULATIVO' | 'ENTRADAS_SAIDAS';

@Injectable({
  providedIn: 'root',
})
export class PlanningStore {
  private readonly planningService = inject(PlanningService);

  // State Signals (Forecast - Sprint 5.1)
  readonly resultado = signal<TimelineForecastResult | null>(null);
  readonly carregando = signal<boolean>(false);
  readonly erro = signal<string | null>(null);
  readonly viewMode = signal<ViewModePlanning>('CUMULATIVO');
  readonly selectedCompetencia = signal<string | null>(null);
  readonly selectedCategory = signal<string | null>(null);
  readonly expandedAccordions = signal<Set<string>>(new Set<string>());

  // State Signals (Overview - Sprint 5.2)
  readonly overviewResult = signal<PlanningOverviewResult | null>(null);
  readonly carregandoOverview = signal<boolean>(false);
  readonly filtroVencimentoStatus = signal<VencimentoStatus | 'TODOS'>('TODOS');
  readonly filtroVencimentoTipo = signal<VencimentoTipo | 'TODOS'>('TODOS');

  // Computed Selectors (Forecast)
  readonly saldoAtual = computed(() => this.resultado()?.saldoAtual ?? 0);
  readonly saldoProjetado12Meses = computed(() => this.resultado()?.saldoProjetado12Meses ?? 0);
  readonly mesMaiorSaldo = computed(() => this.resultado()?.mesMaiorSaldo ?? null);
  readonly mesMaiorAperto = computed(() => this.resultado()?.mesMaiorAperto ?? null);
  readonly zonaGlobal = computed<ZonaSaudeFinanceira>(() => this.resultado()?.zonaGlobal ?? 'VERDE');
  readonly competencias = computed<CompetenciaForecast[]>(() => this.resultado()?.competencias ?? []);
  readonly breakdownConsolidado = computed<ExplanationBreakdown[]>(
    () => this.resultado()?.breakdownConsolidado ?? []
  );

  readonly competenciaSelecionada = computed<CompetenciaForecast | null>(() => {
    const compStr = this.selectedCompetencia();
    if (!compStr) return null;
    return this.competencias().find((c) => c.competencia === compStr) || null;
  });

  readonly breakdownFiltrado = computed<ExplanationBreakdown[]>(() => {
    const compSel = this.competenciaSelecionada();
    const catSel = this.selectedCategory();

    let lista = compSel ? compSel.breakdownCategorias : this.breakdownConsolidado();

    if (catSel) {
      lista = lista.filter((b) => b.categoria === catSel);
    }
    return lista;
  });

  readonly totalEntradas12Meses = computed(() => {
    return this.competencias().reduce((acc, c) => acc + c.totalEntradas, 0);
  });

  readonly totalSaidas12Meses = computed(() => {
    return this.competencias().reduce((acc, c) => acc + c.totalSaidas, 0);
  });

  readonly mediaResultadoMensal = computed(() => {
    const comps = this.competencias();
    if (!comps.length) return 0;
    const total = comps.reduce((acc, c) => acc + c.resultadoMes, 0);
    return Math.round(total / comps.length);
  });

  // Computed Selectors (Overview - Sprint 5.2)
  readonly vencimentos30Dias = computed<CalendarioVencimento[]>(
    () => this.overviewResult()?.vencimentos30Dias ?? []
  );

  readonly vencimentosFiltrados = computed<CalendarioVencimento[]>(() => {
    const todos = this.vencimentos30Dias();
    const fStatus = this.filtroVencimentoStatus();
    const fTipo = this.filtroVencimentoTipo();

    return todos.filter((item) => {
      const matchStatus = fStatus === 'TODOS' || item.status === fStatus;
      const matchTipo = fTipo === 'TODOS' || item.tipo === fTipo;
      return matchStatus && matchTipo;
    });
  });

  readonly totalVencimentos30Dias = computed(
    () => this.overviewResult()?.totalVencimentos30Dias ?? 0
  );
  readonly valorTotalVencimentos30Dias = computed(
    () => this.overviewResult()?.valorTotalVencimentos30Dias ?? 0
  );
  readonly totalVencidosAtrasados = computed(
    () => this.overviewResult()?.totalVencidosAtrasados ?? 0
  );
  readonly valorVencidosAtrasados = computed(
    () => this.overviewResult()?.valorVencidosAtrasados ?? 0
  );

  readonly projetosGargalo = computed<ProjetoGargalo[]>(
    () => this.overviewResult()?.projetosGargalo ?? []
  );
  readonly readinessMedioProjetos = computed(
    () => this.overviewResult()?.readinessMedioProjetos ?? 0
  );

  readonly metasDestaque = computed<MetaDestaque[]>(
    () => this.overviewResult()?.metasDestaque ?? []
  );
  readonly progressoMedioMetas = computed(
    () => this.overviewResult()?.progressoMedioMetas ?? 0
  );

  readonly orcamentosAlerta = computed<OrcamentoAlerta[]>(
    () => this.overviewResult()?.orcamentosAlerta ?? []
  );
  readonly mediaConsumoOrcamentos = computed(
    () => this.overviewResult()?.mediaConsumoOrcamentos ?? 0
  );

  readonly healthScoreGeral = computed(
    () => this.overviewResult()?.healthScoreGeral ?? 0
  );
  readonly resumoFinanceiroOverview = computed(
    () => this.overviewResult()?.resumoFinanceiro ?? null
  );

  // Actions (Forecast)
  async carregarForecast(): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);

    try {
      const res = await firstValueFrom(this.planningService.getForecast());
      if (res) {
        this.resultado.set(res);
      } else {
        const emptyRes = this.planningService.gerarForecastVazio();
        this.resultado.set(emptyRes);
      }
    } catch (err: any) {
      const emptyRes = this.planningService.gerarForecastVazio();
      this.resultado.set(emptyRes);
    } finally {
      this.carregando.set(false);
    }
  }

  // Actions (Overview - Sprint 5.2)
  async carregarOverview(): Promise<void> {
    this.carregandoOverview.set(true);
    try {
      const res = await firstValueFrom(this.planningService.getOverview());
      if (res) {
        this.overviewResult.set(res);
      } else {
        const emptyRes = this.planningService.gerarOverviewVazio();
        this.overviewResult.set(emptyRes);
      }
    } catch (err: any) {
      const emptyRes = this.planningService.gerarOverviewVazio();
      this.overviewResult.set(emptyRes);
    } finally {
      this.carregandoOverview.set(false);
    }
  }

  setFiltroVencimentoStatus(status: VencimentoStatus | 'TODOS'): void {
    this.filtroVencimentoStatus.set(status);
  }

  setFiltroVencimentoTipo(tipo: VencimentoTipo | 'TODOS'): void {
    this.filtroVencimentoTipo.set(tipo);
  }

  marcarVencimentoComoPago(id: string): void {
    const atual = this.overviewResult();
    if (!atual) return;

    const listaAtualizada = atual.vencimentos30Dias.map((item) => {
      if (item.id === id) {
        return { ...item, status: 'PAGO' as VencimentoStatus };
      }
      return item;
    });

    const vencidosAtrasados = listaAtualizada.filter((v) => v.status === 'ATRASADO');

    this.overviewResult.set({
      ...atual,
      vencimentos30Dias: listaAtualizada,
      totalVencidosAtrasados: vencidosAtrasados.length,
      valorVencidosAtrasados: vencidosAtrasados.reduce((acc, v) => acc + v.valor, 0),
    });
  }

  setViewMode(mode: ViewModePlanning): void {
    this.viewMode.set(mode);
  }

  selecionarCompetencia(competencia: string | null): void {
    if (this.selectedCompetencia() === competencia) {
      this.selectedCompetencia.set(null);
    } else {
      this.selectedCompetencia.set(competencia);
    }
  }

  selecionarCategoria(categoria: string | null): void {
    if (this.selectedCategory() === categoria) {
      this.selectedCategory.set(null);
    } else {
      this.selectedCategory.set(categoria);
    }
  }

  toggleAccordion(competencia: string): void {
    const atual = new Set(this.expandedAccordions());
    if (atual.has(competencia)) {
      atual.delete(competencia);
    } else {
      atual.add(competencia);
    }
    this.expandedAccordions.set(atual);
  }

  isAccordionExpanded(competencia: string): boolean {
    return this.expandedAccordions().has(competencia);
  }
}

