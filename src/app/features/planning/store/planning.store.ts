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
  OrcamentoStatus,
  VencimentoStatus,
  VencimentoTipo,
  ProjectedEvent,
  StatMesDestaque,
  TipoEventoProjetado,
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
        const normalizado = this.normalizarForecast(res);
        this.resultado.set(normalizado);
      } else {
        const emptyRes = this.planningService.gerarForecastVazio();
        this.resultado.set(emptyRes);
      }
    } catch (err: any) {
      console.error('Erro ao carregar forecast:', err);
      this.erro.set(err?.message || 'Erro ao carregar forecast');
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
        const normalizado = this.normalizarOverview(res);
        this.overviewResult.set(normalizado);
      } else {
        const emptyRes = this.planningService.gerarOverviewVazio();
        this.overviewResult.set(emptyRes);
      }
    } catch (err: any) {
      console.error('Erro ao carregar overview:', err);
      const emptyRes = this.planningService.gerarOverviewVazio();
      this.overviewResult.set(emptyRes);
    } finally {
      this.carregandoOverview.set(false);
    }
  }

  private normalizarForecast(raw: any): TimelineForecastResult {
    if (!raw) return this.planningService.gerarForecastVazio();

    const saldoAtual = Number(raw.saldoInicial ?? raw.saldoAtual ?? 0);
    const rawComps: any[] = Array.isArray(raw.competencias) ? raw.competencias : [];

    const nomesMeses = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
    ];

    const formatarMesRotulo = (compIso: string, exibicao?: string): string => {
      if (compIso && compIso.includes('-')) {
        const [anoStr, mesStr] = compIso.split('-');
        const ano = parseInt(anoStr, 10);
        const mes = parseInt(mesStr, 10);
        if (mes >= 1 && mes <= 12) {
          return `${nomesMeses[mes - 1]}/${String(ano).slice(2)}`;
        }
      }
      return exibicao || compIso || '';
    };

    const mapZona = (z: string): ZonaSaudeFinanceira => {
      if (z === 'DEFICIT_PROJETADO' || z === 'VERMELHO') return 'VERMELHO';
      if (z === 'ALERTA_APERTO' || z === 'AMARELO') return 'AMARELO';
      return 'VERDE';
    };

    const competencias: CompetenciaForecast[] = rawComps.map((comp: any) => {
      const mesRotulo = formatarMesRotulo(comp.competencia, comp.exibicao);
      const saldoInicial = Number(comp.saldoInicialPeriodo ?? comp.saldoInicial ?? 0);
      const totalEntradas = Number(comp.totalReceitas ?? comp.totalEntradas ?? 0);
      const totalSaidas = Number(comp.totalDespesas ?? comp.totalSaidas ?? 0);
      const resultadoMes = Number(
        comp.fluxoLiquidoMensal ?? comp.resultadoMes ?? (totalEntradas - totalSaidas)
      );
      const saldoProjetado = Number(
        comp.saldoProjetadoFinal ?? comp.saldoProjetado ?? (saldoInicial + resultadoMes)
      );
      const zonaSaude = mapZona(comp.zonaSaude);

      const eventos: ProjectedEvent[] = Array.isArray(comp.eventos)
        ? comp.eventos.map((e: any) => {
            let tipo: TipoEventoProjetado = 'DESPESA';
            if (e.tipo === 'INCOME' || e.fonte === 'SALARIO') {
              tipo = 'RECEITA';
            } else if (e.fonte === 'CARTAO_PARCELA') {
              tipo = 'FATURA';
            } else if (e.fonte === 'DESPESA_RECORRENTE' || e.fonte === 'RECEITA_RECORRENTE') {
              tipo = 'RECORRENCIA';
            } else if (e.fonte === 'META') {
              tipo = 'META';
            } else if (e.fonte === 'PROJETO') {
              tipo = 'PROJETO';
            }

            return {
              id: e.id || `evt-${Math.random()}`,
              competencia: e.competencia || comp.competencia,
              tipo,
              descricao: e.descricao || 'Lançamento',
              categoria: e.categoriaNome || e.categoria || 'Geral',
              valor: Number(e.valor || 0),
              fonte: e.fonte || tipo,
              confirmado: e.confirmado ?? true,
            };
          })
        : [];

      const breakdownCategorias: ExplanationBreakdown[] = Array.isArray(
        comp.breakdown?.porCategoria
      )
        ? comp.breakdown.porCategoria.map((cat: any) => ({
            categoria: cat.categoriaNome || cat.categoria || 'Geral',
            tipo: (cat.tipo === 'INCOME' ? 'RECEITA' : 'DESPESA') as 'RECEITA' | 'DESPESA',
            valorTotal: Number(cat.valor ?? cat.valorTotal ?? 0),
            percentual: Number(cat.percentualDoTotal ?? cat.percentual ?? 0),
            cor: cat.cor || (cat.tipo === 'INCOME' ? '#10B981' : '#C9A74E'),
            icone: cat.icone || (cat.tipo === 'INCOME' ? 'trending_up' : 'trending_down'),
            quantidadeEventos: Number(cat.quantidadeEventos || 1),
            itens: eventos.filter(
              (ev) => ev.categoria === (cat.categoriaNome || cat.categoria)
            ),
          }))
        : [];

      return {
        competencia: comp.competencia,
        mesRotulo,
        saldoInicial,
        totalEntradas,
        totalSaidas,
        resultadoMes,
        saldoProjetado,
        zonaSaude,
        eventos,
        breakdownCategorias,
      };
    });

    const saldoProjetado12Meses =
      competencias.length > 0
        ? competencias[competencias.length - 1].saldoProjetado
        : saldoAtual;

    let mesMaiorSaldo: StatMesDestaque | null = null;
    let mesMaiorAperto: StatMesDestaque | null = null;

    if (competencias.length > 0) {
      let maxC = competencias[0];
      let minC = competencias[0];

      for (const c of competencias) {
        if (c.saldoProjetado > maxC.saldoProjetado) maxC = c;
        if (c.saldoProjetado < minC.saldoProjetado) minC = c;
      }

      mesMaiorSaldo = {
        competencia: maxC.competencia,
        mesRotulo: maxC.mesRotulo,
        valor: maxC.saldoProjetado,
      };

      mesMaiorAperto = {
        competencia: minC.competencia,
        mesRotulo: minC.mesRotulo,
        valor: minC.saldoProjetado,
      };
    }

    let zonaGlobal: ZonaSaudeFinanceira = 'VERDE';
    if (competencias.some((c) => c.zonaSaude === 'VERMELHO')) {
      zonaGlobal = 'VERMELHO';
    } else if (competencias.some((c) => c.zonaSaude === 'AMARELO')) {
      zonaGlobal = 'AMARELO';
    }

    // Breakdown consolidado agrupado por categoria
    const mapaCat = new Map<
      string,
      {
        categoria: string;
        tipo: 'RECEITA' | 'DESPESA';
        valorTotal: number;
        cor: string;
        icone: string;
        quantidadeEventos: number;
        itens: ProjectedEvent[];
      }
    >();

    let totalGeralCategorias = 0;

    for (const comp of competencias) {
      for (const ev of comp.eventos) {
        totalGeralCategorias += ev.valor;
        const catNome = ev.categoria || 'Geral';
        const key = `${ev.tipo}:${catNome}`;
        const existing = mapaCat.get(key);
        if (existing) {
          existing.valorTotal += ev.valor;
          existing.quantidadeEventos += 1;
          existing.itens.push(ev);
        } else {
          mapaCat.set(key, {
            categoria: catNome,
            tipo: ev.tipo === 'RECEITA' ? 'RECEITA' : 'DESPESA',
            valorTotal: ev.valor,
            cor: ev.tipo === 'RECEITA' ? '#10B981' : '#C9A74E',
            icone: ev.tipo === 'RECEITA' ? 'trending_up' : 'trending_down',
            quantidadeEventos: 1,
            itens: [ev],
          });
        }
      }
    }

    const breakdownConsolidado: ExplanationBreakdown[] = Array.from(mapaCat.values())
      .map((item) => ({
        ...item,
        percentual:
          totalGeralCategorias > 0
            ? Math.round((item.valorTotal / totalGeralCategorias) * 100)
            : 0,
      }))
      .sort((a, b) => b.valorTotal - a.valorTotal);

    return {
      saldoAtual,
      saldoProjetado12Meses,
      mesMaiorSaldo,
      mesMaiorAperto,
      zonaGlobal,
      competencias,
      breakdownConsolidado,
    };
  }

  private normalizarOverview(raw: any): PlanningOverviewResult {
    if (!raw) return this.planningService.gerarOverviewVazio();

    const rawVencimentos: any[] = Array.isArray(
      raw.calendarioVencimentos || raw.vencimentos30Dias
    )
      ? raw.calendarioVencimentos || raw.vencimentos30Dias
      : [];

    const hoje = new Date();
    const hojeStr = hoje.toISOString().slice(0, 10);

    const vencimentos30Dias: CalendarioVencimento[] = rawVencimentos.map((v: any) => {
      let tipo: VencimentoTipo = 'DESPESA_FIXA';
      if (v.origem === 'CARTAO' || v.tipo === 'FATURA') {
        tipo = 'FATURA';
      } else if (v.origem === 'RECORRENCIA' || v.tipo === 'RECORRENCIA') {
        tipo = 'RECORRENCIA';
      } else if (v.tipo === 'BOLETO') {
        tipo = 'BOLETO';
      } else if (v.tipo === 'RECEITA') {
        tipo = 'OUTRO';
      }

      const d = v.data ? new Date(v.data) : (v.dataVencimento ? new Date(v.dataVencimento) : hoje);
      const diaDoMes = d.getDate();
      const dataVencimento = !isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : hojeStr;

      let status: VencimentoStatus = 'PENDENTE';
      if (v.status === 'ATRASADO' || v.status === 'VENCIDO') {
        status = 'ATRASADO';
      } else if (v.status === 'PAGO' || v.status === 'LIQUIDADO') {
        status = 'PAGO';
      } else if (v.status === 'HOJE' || v.status === 'VENCENDO_HOJE' || dataVencimento === hojeStr) {
        status = 'VENCENDO_HOJE';
      } else {
        status = 'PENDENTE';
      }

      // Parcela info extraída da descrição caso contenha "(X/Y)"
      let parcelaInfo: string | undefined = undefined;
      const matchParcela = v.descricao?.match(/\((\d+\/\d+)\)/);
      if (matchParcela) {
        parcelaInfo = matchParcela[1];
      }

      return {
        id: v.id || `venc-${Math.random()}`,
        descricao: v.descricao || 'Compromisso',
        categoria: v.categoriaNome || v.categoria || 'Geral',
        valor: Number(v.valor || 0),
        dataVencimento,
        diaDoMes,
        tipo,
        status,
        origemId: v.categoriaId,
        origemNome: v.origemNome || (v.origem === 'CARTAO' ? 'Fatura Cartão' : (v.origem === 'RECORRENCIA' ? 'Recorrência' : undefined)),
        cartaoNome: v.cartaoNome || (v.origem === 'CARTAO' ? 'Cartão de Crédito' : undefined),
        parcelaInfo,
      };
    });

    const totalVencimentos30Dias = vencimentos30Dias.length;
    const valorTotalVencimentos30Dias = vencimentos30Dias.reduce(
      (acc, v) => acc + v.valor,
      0
    );

    const vencidos = vencimentos30Dias.filter((v) => v.status === 'ATRASADO');
    const totalVencidosAtrasados = vencidos.length;
    const valorVencidosAtrasados = vencidos.reduce((acc, v) => acc + v.valor, 0);

    const rawProjetos: any[] = Array.isArray(raw.projetosGargalo)
      ? raw.projetosGargalo
      : [];
    const projetosGargalo: ProjetoGargalo[] = rawProjetos.map((p: any) => {
      const etapaPendente = Array.isArray(p.etapas)
        ? p.etapas.find((e: any) => e.status !== 'CONCLUIDA')
        : null;

      const temCaminhoCritico = p.temCaminhoCritico ?? Boolean(p.etapaGargaloNome || etapaPendente);

      return {
        id: p.id || `proj-${Math.random()}`,
        nome: p.nome || 'Projeto',
        descricao: p.descricao || undefined,
        icone: p.icone || 'rocket_launch',
        cor: p.cor || '#C9A74E',
        orcamentoEstimado: Number(p.orcamentoEstimado || 0),
        valorFinanciado: Number(p.valorFinanciado || 0),
        coberturaFinanceira: Number(p.coberturaFinanceira || 0),
        readinessScore: Number(p.readinessScore || 0),
        temCaminhoCritico,
        motivoGargalo: p.motivoGargalo || (temCaminhoCritico ? 'Etapa pendente necessita atenção no cronograma.' : undefined),
        etapaBloqueada: p.etapaBloqueada || p.etapaGargaloNome || etapaPendente?.nome || undefined,
        prazoEstimado: p.prazoEstimado ? (typeof p.prazoEstimado === 'string' && p.prazoEstimado.includes('T') ? p.prazoEstimado.slice(0, 10) : p.prazoEstimado) : undefined,
        status: p.status || 'EM_ANDAMENTO',
      };
    });

    const totalProjetosGargalo = projetosGargalo.length;
    const readinessMedioProjetos =
      totalProjetosGargalo > 0
        ? Math.round(
            projetosGargalo.reduce((acc, p) => acc + p.readinessScore, 0) /
              totalProjetosGargalo
          )
        : 0;

    const rawMetas: any[] = Array.isArray(raw.metasDestaque)
      ? raw.metasDestaque
      : [];
    const metasDestaque: MetaDestaque[] = rawMetas.map((m: any) => {
      const valorAlvo = Number(m.valorAlvo || 0);
      const valorAtual = Number(m.valorAcumulado ?? m.valorAtual ?? 0);
      const percentualConcluido = Number(m.progressoPercentual ?? m.percentualConcluido ?? (valorAlvo > 0 ? Math.round((valorAtual / valorAlvo) * 100) : 0));
      const diasRestantes = Number(m.diasRestantes ?? 30);
      const statusPrazo = diasRestantes < 0 ? 'ATRASADO' : (percentualConcluido >= 100 ? 'CONCLUIDO' : 'NO_PRAZO');

      return {
        id: m.id || `meta-${Math.random()}`,
        nome: m.nome || 'Meta',
        valorAlvo,
        valorAtual,
        percentualConcluido,
        prazo: m.prazo ? (typeof m.prazo === 'string' && m.prazo.includes('T') ? m.prazo.slice(0, 10) : String(m.prazo)) : '2026-12-31',
        diasRestantes: Math.max(0, diasRestantes),
        statusPrazo,
        ritmoMensalEstimado: Number(m.ritmoMensalEstimado || (valorAlvo > valorAtual ? Math.round((valorAlvo - valorAtual) / Math.max(1, Math.round(diasRestantes / 30))) : 0)),
        cor: m.cor || '#A13D63',
        icone: m.icone || 'flag',
      };
    });

    const totalMetasAtivas = metasDestaque.length;
    const progressoMedioMetas =
      totalMetasAtivas > 0
        ? Math.round(
            metasDestaque.reduce((acc, m) => acc + m.percentualConcluido, 0) /
              totalMetasAtivas
          )
        : 0;

    const rawOrcamentos: any[] = Array.isArray(raw.orcamentosAlerta)
      ? raw.orcamentosAlerta
      : [];
    const orcamentosAlerta: OrcamentoAlerta[] = rawOrcamentos.map((o: any) => {
      const valorTeto = Number(o.limite ?? o.valorTeto ?? 0);
      const valorGasto = Number(o.valorConsumido ?? o.valorGasto ?? 0);
      const percentualConsumido = Number(o.percentualConsumido ?? (valorTeto > 0 ? Math.round((valorGasto / valorTeto) * 100) : 0));

      let status: OrcamentoStatus = 'DENTRO_DO_LIMITE';
      if (percentualConsumido >= 100 || o.estado === 'EXCEDIDO' || o.status === 'EXCEDIDO') {
        status = 'EXCEDIDO';
      } else if (percentualConsumido >= 90 || o.estado === 'ALERTA' || o.status === 'ALERTA') {
        status = 'ALERTA';
      } else if (percentualConsumido >= 70 || o.estado === 'ATENCAO' || o.status === 'ATENCAO') {
        status = 'ATENCAO';
      }

      return {
        id: o.id || `orc-${Math.random()}`,
        categoria: o.categoriaNome || o.categoria || 'Categoria',
        valorTeto,
        valorGasto,
        percentualConsumido,
        status,
        cor: o.categoriaCor || o.cor || '#C9A74E',
        icone: o.categoriaIcone || o.icone || 'pie_chart',
      };
    });

    const totalOrcamentosAlerta = orcamentosAlerta.length;
    const mediaConsumoOrcamentos =
      totalOrcamentosAlerta > 0
        ? Math.round(
            orcamentosAlerta.reduce((acc, o) => acc + o.percentualConsumido, 0) /
              totalOrcamentosAlerta
          )
        : 0;

    const saldoDisponivelTotal = Number(
      raw.resumoForecast?.saldoInicial ??
        raw.resumoFinanceiro?.saldoDisponivelTotal ??
        0
    );
    const primeiroMesFluxo = raw.resumoForecast?.competencias?.[0]?.fluxoLiquidoMensal;
    const capacidadeAporteMensal = Number(
      raw.resumoFinanceiro?.capacidadeAporteMensal ??
        (primeiroMesFluxo !== undefined ? Math.max(0, primeiroMesFluxo) : 0)
    );

    const healthScoreGeral =
      raw.healthScoreGeral !== undefined
        ? Number(raw.healthScoreGeral)
        : totalVencidosAtrasados > 0
        ? 65
        : 90;

    return {
      vencimentos30Dias,
      totalVencimentos30Dias,
      valorTotalVencimentos30Dias,
      totalVencidosAtrasados,
      valorVencidosAtrasados,
      projetosGargalo,
      totalProjetosGargalo,
      readinessMedioProjetos,
      metasDestaque,
      totalMetasAtivas,
      progressoMedioMetas,
      orcamentosAlerta,
      totalOrcamentosAlerta,
      mediaConsumoOrcamentos,
      healthScoreGeral,
      resumoFinanceiro: {
        saldoDisponivelTotal,
        compromissosProximos30Dias: valorTotalVencimentos30Dias,
        capacidadeAporteMensal,
      },
    };
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

