import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  TimelineForecastResult,
  CompetenciaForecast,
  ProjectedEvent,
  ExplanationBreakdown,
  ZonaSaudeFinanceira,
  PlanningOverviewResult,
  CalendarioVencimento,
  ProjetoGargalo,
  MetaDestaque,
  OrcamentoAlerta,
} from '../models/planning.models';

@Injectable({
  providedIn: 'root',
})
export class PlanningService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/planning`;

  getForecast(): Observable<TimelineForecastResult> {
    return this.http.get<TimelineForecastResult>(`${this.baseUrl}/forecast`).pipe(
      catchError(() => {
        return of(this.gerarForecastMockLocal());
      })
    );
  }

  getOverview(): Observable<PlanningOverviewResult> {
    return this.http.get<PlanningOverviewResult>(`${this.baseUrl}/overview`).pipe(
      catchError(() => {
        return of(this.gerarOverviewMockLocal());
      })
    );
  }

  /**
   * Engine de cálculo e geração local de forecast de 12 meses.
   */
  gerarForecastMockLocal(): TimelineForecastResult {
    const hoje = new Date();
    let anoAtual = hoje.getFullYear();
    let mesAtualIndex = hoje.getMonth();

    const nomesMeses = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];

    const competencias: CompetenciaForecast[] = [];
    let saldoAcumulado = 14500;
    const saldoInicialGeral = saldoAcumulado;

    const baseEventosReceita: Array<Omit<ProjectedEvent, 'id' | 'competencia'>> = [
      {
        tipo: 'RECEITA',
        descricao: 'Salário Fixo Mensal',
        categoria: 'Rendimentos',
        valor: 8800,
        fonte: 'CLT principal',
        confirmado: true,
      },
      {
        tipo: 'RECEITA',
        descricao: 'Projeto Freelance UX/Dev',
        categoria: 'Rendimentos Extra',
        valor: 1800,
        fonte: 'Prestação Serviços',
        confirmado: false,
      },
    ];

    const baseEventosDespesa: Array<Omit<ProjectedEvent, 'id' | 'competencia'>> = [
      {
        tipo: 'RECORRENCIA',
        descricao: 'Aluguel & Condomínio',
        categoria: 'Habitação',
        valor: 3200,
        fonte: 'Conta Corrente',
        confirmado: true,
      },
      {
        tipo: 'RECORRENCIA',
        descricao: 'Supermercado e Feira',
        categoria: 'Alimentação',
        valor: 2100,
        fonte: 'Cartão de Crédito',
        confirmado: true,
      },
      {
        tipo: 'FATURA',
        descricao: 'Fatura Cartão Gold',
        categoria: 'Cartão de Crédito',
        valor: 2400,
        fonte: 'Banco Digital',
        confirmado: false,
      },
      {
        tipo: 'META',
        descricao: 'Aporte Reserva Emergência',
        categoria: 'Investimentos & Metas',
        valor: 1500,
        fonte: 'Poupança / Meta',
        confirmado: true,
      },
      {
        tipo: 'DESPESA',
        descricao: 'Contas Fixas (Luz, Água, Net)',
        categoria: 'Serviços Utilitários',
        valor: 450,
        fonte: 'Débito Automático',
        confirmado: true,
      },
    ];

    for (let i = 0; i < 12; i++) {
      const idxMes = (mesAtualIndex + i) % 12;
      const anoCalculado = anoAtual + Math.floor((mesAtualIndex + i) / 12);
      const strMesNum = String(idxMes + 1).padStart(2, '0');
      const competenciaStr = `${anoCalculado}-${strMesNum}`;
      const rotulo = `${nomesMeses[idxMes]}/${String(anoCalculado).slice(2)}`;

      const eventosMes: ProjectedEvent[] = [];
      let totalEntradas = 0;
      let totalSaidas = 0;

      // Injeta receitas base
      baseEventosReceita.forEach((ev, evIdx) => {
        eventosMes.push({
          ...ev,
          id: `evt-${competenciaStr}-rec-${evIdx}`,
          competencia: competenciaStr,
        });
        totalEntradas += ev.valor;
      });

      // Injeta despesas base
      baseEventosDespesa.forEach((ev, evIdx) => {
        eventosMes.push({
          ...ev,
          id: `evt-${competenciaStr}-desp-${evIdx}`,
          competencia: competenciaStr,
        });
        totalSaidas += ev.valor;
      });

      // Eventos Sazonais / Especiais
      if (i === 3) {
        // Mês 4 (Novembro): Bônus Semestral + Black Friday
        const bonus: ProjectedEvent = {
          id: `evt-${competenciaStr}-bonus`,
          competencia: competenciaStr,
          tipo: 'RECEITA',
          descricao: 'Bônus Semestral de Desempenho',
          categoria: 'Rendimentos Extra',
          valor: 6000,
          fonte: 'Empresa CLT',
          confirmado: false,
        };
        const blackFriday: ProjectedEvent = {
          id: `evt-${competenciaStr}-bf`,
          competencia: competenciaStr,
          tipo: 'DESPESA',
          descricao: 'Compras Planejadas Black Friday',
          categoria: 'Bens & Eletrônicos',
          valor: 1800,
          fonte: 'Cartão de Crédito',
          confirmado: false,
        };
        eventosMes.push(bonus, blackFriday);
        totalEntradas += bonus.valor;
        totalSaidas += blackFriday.valor;
      } else if (i === 4) {
        // Mês 5 (Dezembro): 13º Salário + Viagem Fim de Ano + Presentes
        const decimoTerceiro: ProjectedEvent = {
          id: `evt-${competenciaStr}-13sal`,
          competencia: competenciaStr,
          tipo: 'RECEITA',
          descricao: '2ª Parcela 13º Salário',
          categoria: 'Rendimentos',
          valor: 8800,
          fonte: 'CLT principal',
          confirmado: true,
        };
        const viagem: ProjectedEvent = {
          id: `evt-${competenciaStr}-viagem`,
          competencia: competenciaStr,
          tipo: 'PROJETO',
          descricao: 'Reserva & Passagens Viagem Fim de Ano',
          categoria: 'Lazer & Viagens',
          valor: 4500,
          fonte: 'Reserva Específica',
          confirmado: true,
        };
        const presentes: ProjectedEvent = {
          id: `evt-${competenciaStr}-natal`,
          competencia: competenciaStr,
          tipo: 'DESPESA',
          descricao: 'Presentes de Natal & Ceia',
          categoria: 'Lazer & Festas',
          valor: 1200,
          fonte: 'Cartão de Crédito',
          confirmado: false,
        };
        eventosMes.push(decimoTerceiro, viagem, presentes);
        totalEntradas += decimoTerceiro.valor;
        totalSaidas += viagem.valor + presentes.valor;
      } else if (i === 5) {
        // Mês 6 (Janeiro - Mês de Aperto)
        const ipva: ProjectedEvent = {
          id: `evt-${competenciaStr}-ipva`,
          competencia: competenciaStr,
          tipo: 'DESPESA',
          descricao: 'IPVA Veículo & DPVAT (Cota Única)',
          categoria: 'Impostos & Taxas',
          valor: 3800,
          fonte: 'Boleto Detran',
          confirmado: false,
        };
        const iptu: ProjectedEvent = {
          id: `evt-${competenciaStr}-iptu`,
          competencia: competenciaStr,
          tipo: 'DESPESA',
          descricao: 'IPTU Imóvel Residencial',
          categoria: 'Impostos & Taxas',
          valor: 2400,
          fonte: 'Prefeitura',
          confirmado: false,
        };
        const escola: ProjectedEvent = {
          id: `evt-${competenciaStr}-matr`,
          competencia: competenciaStr,
          tipo: 'DESPESA',
          descricao: 'Matrícula & Material Escolar',
          categoria: 'Educação',
          valor: 2200,
          fonte: 'Cartão de Crédito',
          confirmado: false,
        };
        eventosMes.push(ipva, iptu, escola);
        totalSaidas += ipva.valor + iptu.valor + escola.valor;
      } else if (i === 7) {
        // Mês 8 (Março) Restituição IR
        const ir: ProjectedEvent = {
          id: `evt-${competenciaStr}-ir`,
          competencia: competenciaStr,
          tipo: 'RECEITA',
          descricao: 'Restituição Imposto de Renda (1º Lote)',
          categoria: 'Rendimentos Extra',
          valor: 3200,
          fonte: 'Receita Federal',
          confirmado: false,
        };
        eventosMes.push(ir);
        totalEntradas += ir.valor;
      } else if (i === 11) {
        // Mês 12 (Julho) Bônus Semestral
        const bonus2: ProjectedEvent = {
          id: `evt-${competenciaStr}-bonus2`,
          competencia: competenciaStr,
          tipo: 'RECEITA',
          descricao: 'Bônus Semestral de Mid-Year',
          categoria: 'Rendimentos Extra',
          valor: 6000,
          fonte: 'Empresa CLT',
          confirmado: false,
        };
        eventosMes.push(bonus2);
        totalEntradas += bonus2.valor;
      }

      const saldoInicialMes = saldoAcumulado;
      const resultadoMes = totalEntradas - totalSaidas;
      saldoAcumulado = saldoInicialMes + resultadoMes;

      let zonaSaude: ZonaSaudeFinanceira = 'VERDE';
      if (saldoAcumulado < 5000) {
        zonaSaude = 'VERMELHO';
      } else if (saldoAcumulado < 15000 || resultadoMes < -3000) {
        zonaSaude = 'AMARELO';
      }

      const breakdownCategorias = this.calcularBreakdownMes(eventosMes);

      competencias.push({
        competencia: competenciaStr,
        mesRotulo: rotulo,
        saldoInicial: saldoInicialMes,
        totalEntradas,
        totalSaidas,
        resultadoMes,
        saldoProjetado: saldoAcumulado,
        zonaSaude,
        eventos: eventosMes,
        breakdownCategorias,
      });
    }

    // Calcula Destaques
    let mesMaiorSaldo = { competencia: competencias[0].competencia, mesRotulo: competencias[0].mesRotulo, valor: competencias[0].saldoProjetado };
    let mesMaiorAperto = { competencia: competencias[0].competencia, mesRotulo: competencias[0].mesRotulo, valor: competencias[0].resultadoMes };

    competencias.forEach((c) => {
      if (c.saldoProjetado > mesMaiorSaldo.valor) {
        mesMaiorSaldo = { competencia: c.competencia, mesRotulo: c.mesRotulo, valor: c.saldoProjetado };
      }
      if (c.resultadoMes < mesMaiorAperto.valor) {
        mesMaiorAperto = { competencia: c.competencia, mesRotulo: c.mesRotulo, valor: c.resultadoMes };
      }
    });

    const saldoProjetado12Meses = competencias[competencias.length - 1].saldoProjetado;
    let zonaGlobal: ZonaSaudeFinanceira = 'VERDE';
    if (saldoProjetado12Meses < 8000 || mesMaiorAperto.valor < -5000) {
      zonaGlobal = 'AMARELO';
    }
    if (saldoProjetado12Meses < 2000) {
      zonaGlobal = 'VERMELHO';
    }

    const breakdownConsolidado = this.calcularBreakdownConsolidado(competencias);

    return {
      saldoAtual: saldoInicialGeral,
      saldoProjetado12Meses,
      mesMaiorSaldo,
      mesMaiorAperto,
      zonaGlobal,
      competencias,
      breakdownConsolidado,
    };
  }

  private calcularBreakdownMes(eventos: ProjectedEvent[]): ExplanationBreakdown[] {
    const mapa = new Map<string, { tipo: 'RECEITA' | 'DESPESA'; total: number; count: number; eventos: ProjectedEvent[] }>();

    let totalDespesas = 0;
    eventos.forEach((ev) => {
      const tipo: 'RECEITA' | 'DESPESA' = ev.tipo === 'RECEITA' ? 'RECEITA' : 'DESPESA';
      if (tipo === 'DESPESA') {
        totalDespesas += ev.valor;
      }
      const item = mapa.get(ev.categoria) || { tipo, total: 0, count: 0, eventos: [] };
      item.total += ev.valor;
      item.count += 1;
      item.eventos.push(ev);
      mapa.set(ev.categoria, item);
    });

    const cores: Record<string, string> = {
      Habitação: '#A13D63',
      Alimentação: '#C9A74E',
      'Cartão de Crédito': '#e11d48',
      'Investimentos & Metas': '#10b981',
      'Serviços Utilitários': '#3b82f6',
      'Rendimentos': '#059669',
      'Rendimentos Extra': '#34d399',
      'Impostos & Taxas': '#f59e0b',
      'Educação': '#8b5cf6',
      'Lazer & Viagens': '#ec4899',
      'Bens & Eletrônicos': '#6366f1',
    };

    const icones: Record<string, string> = {
      Habitação: 'home',
      Alimentação: 'shopping_cart',
      'Cartão de Crédito': 'credit_card',
      'Investimentos & Metas': 'savings',
      'Serviços Utilitários': 'bolt',
      Rendimentos: 'payments',
      'Rendimentos Extra': 'add_card',
      'Impostos & Taxas': 'account_balance',
      Educação: 'school',
      'Lazer & Viagens': 'flight_takeoff',
      'Bens & Eletrônicos': 'devices',
    };

    const resultado: ExplanationBreakdown[] = [];
    mapa.forEach((val, key) => {
      const pct = totalDespesas > 0 && val.tipo === 'DESPESA' ? (val.total / totalDespesas) * 100 : 0;
      resultado.push({
        categoria: key,
        tipo: val.tipo,
        valorTotal: val.total,
        percentual: Number(pct.toFixed(1)),
        cor: cores[key] || '#C9A74E',
        icone: icones[key] || 'label',
        quantidadeEventos: val.count,
        itens: val.eventos,
      });
    });

    return resultado.sort((a, b) => b.valorTotal - a.valorTotal);
  }

  private calcularBreakdownConsolidado(competencias: CompetenciaForecast[]): ExplanationBreakdown[] {
    const todosEventos: ProjectedEvent[] = [];
    competencias.forEach((c) => todosEventos.push(...c.eventos));
    return this.calcularBreakdownMes(todosEventos);
  }

  /**
   * Mock local para o Planning Overview & Visão Unificada (Sprint 5.2)
   */
  gerarOverviewMockLocal(): PlanningOverviewResult {
    const hoje = new Date();

    const formatDate = (offsetDays: number): { dateStr: string; day: number } => {
      const d = new Date(hoje);
      d.setDate(d.getDate() + offsetDays);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return {
        dateStr: `${year}-${month}-${day}`,
        day: d.getDate(),
      };
    };

    const dMinus2 = formatDate(-2);
    const d0 = formatDate(0);
    const d3 = formatDate(3);
    const d5 = formatDate(5);
    const d10 = formatDate(10);
    const d12 = formatDate(12);
    const d15 = formatDate(15);
    const d20 = formatDate(20);
    const d25 = formatDate(25);

    const vencimentos30Dias: CalendarioVencimento[] = [
      {
        id: 'venc-1',
        descricao: 'IPVA Veículo - Cota 2/3',
        categoria: 'Impostos & Taxas',
        valor: 950,
        dataVencimento: dMinus2.dateStr,
        diaDoMes: dMinus2.day,
        tipo: 'BOLETO',
        status: 'ATRASADO',
        origemNome: 'Detran SP',
      },
      {
        id: 'venc-2',
        descricao: 'Fatura Cartão Gold',
        categoria: 'Cartão de Crédito',
        valor: 3450,
        dataVencimento: d0.dateStr,
        diaDoMes: d0.day,
        tipo: 'FATURA',
        status: 'VENCENDO_HOJE',
        cartaoNome: 'Itaú Personalité Visa',
      },
      {
        id: 'venc-3',
        descricao: 'Aluguel & Condomínio',
        categoria: 'Habitação',
        valor: 3200,
        dataVencimento: d3.dateStr,
        diaDoMes: d3.day,
        tipo: 'DESPESA_FIXA',
        status: 'PENDENTE',
        origemNome: 'Imobiliária Central',
      },
      {
        id: 'venc-4',
        descricao: 'Plano de Saúde Familiar',
        categoria: 'Saúde',
        valor: 1850,
        dataVencimento: d5.dateStr,
        diaDoMes: d5.day,
        tipo: 'RECORRENCIA',
        status: 'PAGO',
        origemNome: 'Bradesco Saúde',
      },
      {
        id: 'venc-5',
        descricao: 'Parcela Reformas (3/10)',
        categoria: 'Projetos',
        valor: 1200,
        dataVencimento: d10.dateStr,
        diaDoMes: d10.day,
        tipo: 'PARCELA',
        status: 'PENDENTE',
        parcelaInfo: '3/10',
      },
      {
        id: 'venc-6',
        descricao: 'Supermercado Mensal (Estimado)',
        categoria: 'Alimentação',
        valor: 2100,
        dataVencimento: d12.dateStr,
        diaDoMes: d12.day,
        tipo: 'DESPESA_FIXA',
        status: 'PENDENTE',
      },
      {
        id: 'venc-7',
        descricao: 'Aporte Meta Reserva Emergência',
        categoria: 'Investimentos & Metas',
        valor: 1500,
        dataVencimento: d15.dateStr,
        diaDoMes: d15.day,
        tipo: 'RECORRENCIA',
        status: 'PENDENTE',
        origemNome: 'Corretora XP',
      },
      {
        id: 'venc-8',
        descricao: 'Escola / Mensalidade',
        categoria: 'Educação',
        valor: 2100,
        dataVencimento: d20.dateStr,
        diaDoMes: d20.day,
        tipo: 'BOLETO',
        status: 'PENDENTE',
      },
      {
        id: 'venc-9',
        descricao: 'Energia Elétrica & Internet',
        categoria: 'Serviços Utilitários',
        valor: 480,
        dataVencimento: d25.dateStr,
        diaDoMes: d25.day,
        tipo: 'DESPESA_FIXA',
        status: 'PENDENTE',
      },
    ];

    const valorTotalVencimentos30Dias = vencimentos30Dias.reduce((acc, v) => acc + v.valor, 0);
    const vencidosAtrasados = vencimentos30Dias.filter((v) => v.status === 'ATRASADO');
    const valorVencidosAtrasados = vencidosAtrasados.reduce((acc, v) => acc + v.valor, 0);

    const projetosGargalo: ProjetoGargalo[] = [
      {
        id: 'proj-1',
        nome: 'Reforma da Cozinha & Varanda',
        descricao: 'Modernização completa com móveis planejados e bancada em quartzo',
        orcamentoEstimado: 25000,
        valorFinanciado: 10500,
        coberturaFinanceira: 42,
        readinessScore: 48,
        temCaminhoCritico: true,
        motivoGargalo: 'Aporte de R$ 4.500 pendente para liberar a Etapa 2 (Marcenaria)',
        etapaBloqueada: 'Marcenaria Sob Medida',
        prazoEstimado: 'Nov/2026',
        cor: '#A13D63',
        icone: 'countertops',
        status: 'EM_ANDAMENTO',
      },
      {
        id: 'proj-2',
        nome: 'Troca do Veículo SUV Familiar',
        descricao: 'Aquisição de SUV seminovo 2024 com baixa quilometragem',
        orcamentoEstimado: 85000,
        valorFinanciado: 21250,
        coberturaFinanceira: 25,
        readinessScore: 32,
        temCaminhoCritico: true,
        motivoGargalo: 'Ritmo de poupança atual 40% abaixo do necessário para entrada',
        etapaBloqueada: 'Quitação da Entrada à Vista',
        prazoEstimado: 'Mar/2027',
        cor: '#e11d48',
        icone: 'directions_car',
        status: 'PLANEJAMENTO',
      },
      {
        id: 'proj-3',
        nome: 'Viagem Internacional Japão',
        descricao: 'Roteiro de 15 dias Tóquio, Quioto e Osaka com passagens já reservadas',
        orcamentoEstimado: 32000,
        valorFinanciado: 24960,
        coberturaFinanceira: 78,
        readinessScore: 84,
        temCaminhoCritico: false,
        prazoEstimado: 'Out/2026',
        cor: '#C9A74E',
        icone: 'flight_takeoff',
        status: 'EM_ANDAMENTO',
      },
    ];

    const readinessMedioProjetos = Math.round(
      projetosGargalo.reduce((acc, p) => acc + p.readinessScore, 0) / projetosGargalo.length
    );

    const metasDestaque: MetaDestaque[] = [
      {
        id: 'meta-1',
        nome: 'Reserva de Emergência (6 Meses)',
        valorAlvo: 50000,
        valorAtual: 37500,
        percentualConcluido: 75,
        prazo: '2026-12-31',
        diasRestantes: 145,
        statusPrazo: 'NO_PRAZO',
        ritmoMensalEstimado: 1500,
        cor: '#10b981',
        icone: 'shield',
      },
      {
        id: 'meta-2',
        nome: 'Fundo Viagem Japão',
        valorAlvo: 25000,
        valorAtual: 16500,
        percentualConcluido: 66,
        prazo: '2026-09-30',
        diasRestantes: 53,
        statusPrazo: 'NO_PRAZO',
        ritmoMensalEstimado: 1200,
        cor: '#C9A74E',
        icone: 'luggage',
      },
      {
        id: 'meta-3',
        nome: 'Entrada Veículo Novo',
        valorAlvo: 30000,
        valorAtual: 6000,
        percentualConcluido: 20,
        prazo: '2027-02-28',
        diasRestantes: 204,
        statusPrazo: 'ATRASADO',
        ritmoMensalEstimado: 2400,
        cor: '#f59e0b',
        icone: 'directions_car',
      },
    ];

    const progressoMedioMetas = Math.round(
      metasDestaque.reduce((acc, m) => acc + m.percentualConcluido, 0) / metasDestaque.length
    );

    const orcamentosAlerta: OrcamentoAlerta[] = [
      {
        id: 'orc-1',
        categoria: 'Lazer & Restaurantes',
        valorTeto: 1200,
        valorGasto: 1380,
        percentualConsumido: 115,
        status: 'EXCEDIDO',
        cor: '#ef4444',
        icone: 'restaurant',
      },
      {
        id: 'orc-2',
        categoria: 'Supermercado & Feira',
        valorTeto: 2500,
        valorGasto: 2400,
        percentualConsumido: 96,
        status: 'ATENCAO',
        cor: '#f59e0b',
        icone: 'shopping_cart',
      },
      {
        id: 'orc-3',
        categoria: 'Habitação & Manutenção',
        valorTeto: 3500,
        valorGasto: 3200,
        percentualConsumido: 91,
        status: 'ALERTA',
        cor: '#f59e0b',
        icone: 'home',
      },
      {
        id: 'orc-4',
        categoria: 'Transporte & Combustível',
        valorTeto: 1000,
        valorGasto: 680,
        percentualConsumido: 68,
        status: 'DENTRO_DO_LIMITE',
        cor: '#10b981',
        icone: 'local_gas_station',
      },
    ];

    const mediaConsumoOrcamentos = Math.round(
      orcamentosAlerta.reduce((acc, o) => acc + o.percentualConsumido, 0) / orcamentosAlerta.length
    );

    return {
      vencimentos30Dias,
      totalVencimentos30Dias: vencimentos30Dias.length,
      valorTotalVencimentos30Dias,
      totalVencidosAtrasados: vencidosAtrasados.length,
      valorVencidosAtrasados,

      projetosGargalo,
      totalProjetosGargalo: projetosGargalo.length,
      readinessMedioProjetos,

      metasDestaque,
      totalMetasAtivas: metasDestaque.length,
      progressoMedioMetas,

      orcamentosAlerta,
      totalOrcamentosAlerta: orcamentosAlerta.filter((o) => o.status !== 'DENTRO_DO_LIMITE').length,
      mediaConsumoOrcamentos,

      healthScoreGeral: 78,
      resumoFinanceiro: {
        saldoDisponivelTotal: 14500,
        compromissosProximos30Dias: valorTotalVencimentos30Dias,
        capacidadeAporteMensal: 2800,
      },
    };
  }
}
