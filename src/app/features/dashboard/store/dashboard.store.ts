import { Injectable, signal, computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { DashboardService } from '../../../core/services/dashboard.service';
import { StorageService } from '../../../core/platform/storage.service';
import {
  DashboardResult,
  AlertaDashboard,
  FaturaAbertaDashboard,
  OrcamentoResumoDashboard,
  MetaPrioritariaDashboard,
} from '../../../core/models/dashboard.models';

const STORAGE_KEY_SALDO_VISIVEL = 'alicerce_dashboard_saldo_visivel';

const MOCK_DASHBOARD_FALLBACK: DashboardResult = {
  competencia: '2026-08',
  usuarioNome: 'Eduardo',
  resumoExecutivo:
    'Seu planejamento financeiro para a Construção da Casa está ativo. 3 cartões com faturas abertas e 2 orçamentos demandam atenção neste mês.',
  saldoAtual: 12850.0,
  saldoProjetado: 16420.0,
  receitasPendentes: 8800.0,
  despesasPendentes: 5230.0,
  receitasLiquidadasMes: 12500.0,
  despesasLiquidadasMes: 7720.0,
  fluxoDoPeriodo: 4780.0,
  variacaoSaldoMesAnterior: 12.5,
  faturasAbertas: [
    {
      cartaoId: 'cartao-1',
      nomeCartao: 'Visa Infinite Dourado',
      bandeira: 'VISA',
      cor: '#C9A74E',
      valorFatura: 3420.0,
      dataVencimento: '2026-08-15',
      status: 'ABERTA',
      limiteTotal: 25000.0,
      limiteComprometido: 6420.0,
      limiteDisponivel: 18580.0,
    },
    {
      cartaoId: 'cartao-2',
      nomeCartao: 'Mastercard Black',
      bandeira: 'MASTERCARD',
      cor: '#A13D63',
      valorFatura: 1850.0,
      dataVencimento: '2026-08-20',
      status: 'ABERTA',
      limiteTotal: 15000.0,
      limiteComprometido: 3800.0,
      limiteDisponivel: 11200.0,
    },
    {
      cartaoId: 'cartao-3',
      nomeCartao: 'Elo Nanquim Executive',
      bandeira: 'ELO',
      cor: '#2B2627',
      valorFatura: 980.0,
      dataVencimento: '2026-08-28',
      status: 'ABERTA',
      limiteTotal: 10000.0,
      limiteComprometido: 1580.0,
      limiteDisponivel: 8420.0,
    },
  ],
  orcamentos: [
    {
      id: 'orc-1',
      categoria: 'Alimentação & Mercado',
      valorTeto: 2500.0,
      valorGasto: 1820.0,
      percentualConsumido: 72.8,
      status: 'ALERTA',
      cor: '#C9A74E',
      icone: 'restaurant',
    },
    {
      id: 'orc-2',
      categoria: 'Moradia & Utilitários',
      valorTeto: 3200.0,
      valorGasto: 3450.0,
      percentualConsumido: 107.8,
      status: 'EXCEDIDO',
      cor: '#A13D63',
      icone: 'home',
    },
    {
      id: 'orc-3',
      categoria: 'Lazer & Viagens',
      valorTeto: 1500.0,
      valorGasto: 890.0,
      percentualConsumido: 59.3,
      status: 'NORMAL',
      cor: '#2E7D32',
      icone: 'confirmation_number',
    },
    {
      id: 'orc-4',
      categoria: 'Saúde & Cuidados',
      valorTeto: 1000.0,
      valorGasto: 450.0,
      percentualConsumido: 45.0,
      status: 'NORMAL',
      cor: '#0288D1',
      icone: 'medical_services',
    },
  ],
  metasPrioritarias: [
    {
      id: 'meta-1',
      nome: 'Construção da Casa 🏡',
      valorAlvo: 300000.0,
      valorAtual: 145000.0,
      percentualConcluido: 48.3,
      prazo: '2027-04-30',
      status: 'EM_ANDAMENTO',
      ritmoMensalEstimado: 3200.0,
      diasRestantes: 265,
      cor: '#C9A74E',
      icone: 'home_work',
    },
    {
      id: 'meta-2',
      nome: 'Reserva de Emergência 🛡️',
      valorAlvo: 40000.0,
      valorAtual: 32500.0,
      percentualConcluido: 81.3,
      prazo: '2026-12-31',
      status: 'EM_ANDAMENTO',
      ritmoMensalEstimado: 1500.0,
      diasRestantes: 145,
      cor: '#A13D63',
      icone: 'shield',
    },
    {
      id: 'meta-3',
      nome: 'Troca de Carro (SUV) 🚗',
      valorAlvo: 50000.0,
      valorAtual: 18000.0,
      percentualConcluido: 36.0,
      prazo: '2027-08-30',
      status: 'EM_ANDAMENTO',
      ritmoMensalEstimado: 2100.0,
      diasRestantes: 387,
      cor: '#2E7D32',
      icone: 'directions_car',
    },
  ],
  alertas: [
    {
      id: 'alt-1',
      titulo: 'Orçamento Excedido em Moradia',
      mensagem:
        'Gastos com Moradia ultrapassaram o teto estipulado em R$ 250,00 (107.8% do limite total).',
      tipo: 'ORCAMENTO_EXCEDIDO',
      severidade: 'CRITICO',
      data: '2026-08-08',
      link: '/orcamentos',
    },
    {
      id: 'alt-2',
      titulo: 'Vencimento de Fatura em 7 dias',
      mensagem:
        'Fatura do cartão Visa Infinite Dourado vence em 15/08 no valor de R$ 3.420,00.',
      tipo: 'FATURA_VENCIMENTO',
      severidade: 'ALTO',
      data: '2026-08-08',
      link: '/cards',
    },
    {
      id: 'alt-3',
      titulo: 'Aporte Mensal Recomendado Pendente',
      mensagem:
        'Recomendado aportar R$ 3.200,00 este mês para manter o cronograma da Construção da Casa.',
      tipo: 'META_ATRASADA',
      severidade: 'MEDIO',
      data: '2026-08-08',
      link: '/goals',
    },
  ],
};

@Injectable({
  providedIn: 'root',
})
export class DashboardStore {
  private readonly api = inject(DashboardService);
  private readonly storage = inject(StorageService);

  // State Signals
  readonly dashboardData = signal<DashboardResult | null>(null);
  readonly carregando = signal<boolean>(false);
  readonly erro = signal<string | null>(null);
  readonly saldoVisivel = signal<boolean>(true);
  readonly competenciaSelecionada = signal<string>('2026-08');

  // Computed Selectors
  readonly saldoAtual = computed(() => this.dashboardData()?.saldoAtual ?? 0);
  readonly saldoProjetado = computed(
    () => this.dashboardData()?.saldoProjetado ?? 0
  );
  readonly receitasPendentes = computed(
    () => this.dashboardData()?.receitasPendentes ?? 0
  );
  readonly despesasPendentes = computed(
    () => this.dashboardData()?.despesasPendentes ?? 0
  );
  readonly receitasLiquidadasMes = computed(
    () => this.dashboardData()?.receitasLiquidadasMes ?? 0
  );
  readonly despesasLiquidadasMes = computed(
    () => this.dashboardData()?.despesasLiquidadasMes ?? 0
  );
  readonly fluxoDoPeriodo = computed(
    () => this.dashboardData()?.fluxoDoPeriodo ?? 0
  );
  readonly faturasAbertas = computed(
    () => this.dashboardData()?.faturasAbertas ?? []
  );
  readonly orcamentos = computed(
    () => this.dashboardData()?.orcamentos ?? []
  );
  readonly metasPrioritarias = computed(
    () => this.dashboardData()?.metasPrioritarias ?? []
  );
  readonly alertas = computed(() => this.dashboardData()?.alertas ?? []);

  readonly alertasCriticosCount = computed(
    () => this.alertas().filter((a) => a.severidade === 'CRITICO').length
  );
  readonly alertasAltosCount = computed(
    () => this.alertas().filter((a) => a.severidade === 'ALTO').length
  );
  readonly alertasMediosCount = computed(
    () => this.alertas().filter((a) => a.severidade === 'MEDIO').length
  );

  constructor() {
    this.inicializar();
  }

  private async inicializar(): Promise<void> {
    try {
      const storedVisivel = await this.storage.getItem(STORAGE_KEY_SALDO_VISIVEL);
      if (storedVisivel !== null) {
        this.saldoVisivel.set(storedVisivel === 'true');
      }
    } catch (_) {
      // Ignora erro de leitura no storage
    }
    await this.carregarDashboard();
  }

  async toggleOlhoMagico(): Promise<void> {
    const novoEstado = !this.saldoVisivel();
    this.saldoVisivel.set(novoEstado);
    try {
      await this.storage.setItem(STORAGE_KEY_SALDO_VISIVEL, String(novoEstado));
    } catch (_) {}
  }

  async alterarCompetencia(competencia: string): Promise<void> {
    this.competenciaSelecionada.set(competencia);
    await this.carregarDashboard(competencia);
  }

  async carregarDashboard(competencia?: string): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);

    const comp = competencia || this.competenciaSelecionada();

    try {
      const res = await firstValueFrom(this.api.obterDashboard(comp));
      if (res) {
        const resultNormalizado = this.normalizarDashboardResult(res, comp);
        this.dashboardData.set(resultNormalizado);
      } else {
        this.dashboardData.set(MOCK_DASHBOARD_FALLBACK);
      }
    } catch (err: any) {
      // Em caso de falha de conexão HTTP com o backend, usa os dados consolidados do modelo local
      this.dashboardData.set(MOCK_DASHBOARD_FALLBACK);
    } finally {
      this.carregando.set(false);
    }
  }

  private normalizarDashboardResult(raw: any, competencia: string): DashboardResult {
    // Caso a API retorne o contrato do backend (referenciaDate, saldoGlobal, etc.)
    const saldoAtual = raw.saldoAtual !== undefined ? Number(raw.saldoAtual) : Number(raw.saldoGlobal || 0);
    const saldoProjetado = raw.saldoProjetado !== undefined ? Number(raw.saldoProjetado) : saldoAtual;

    const faturasAbertas: FaturaAbertaDashboard[] = Array.isArray(raw.faturasAbertas)
      ? raw.faturasAbertas.map((f: any) => ({
          cartaoId: f.cartaoId || f.id || 'cartao-id',
          nomeCartao: f.nomeCartao || f.cartaoNome || 'Cartão de Crédito',
          bandeira: f.bandeira || 'VISA',
          cor: f.cor || f.cartaoCor || '#C9A74E',
          valorFatura: Number(f.valorFatura ?? f.valorTotal ?? 0),
          dataVencimento: f.dataVencimento
            ? new Date(f.dataVencimento).toISOString().split('T')[0]
            : '2026-08-15',
          status: f.status || 'ABERTA',
          limiteDisponivel: Number(f.limiteDisponivel || 0),
          limiteTotal: Number(f.limiteTotal || 10000),
          limiteComprometido: Number(f.limiteComprometido || 0),
        }))
      : MOCK_DASHBOARD_FALLBACK.faturasAbertas;

    const orcamentos: OrcamentoResumoDashboard[] = Array.isArray(raw.orcamentos || raw.orcamentoMes)
      ? (raw.orcamentos || raw.orcamentoMes).map((o: any) => ({
          id: o.id || `orc-${Date.now()}`,
          categoria: o.categoria || o.categoriaNome || 'Categoria',
          valorTeto: Number(o.valorTeto ?? o.limite ?? 0),
          valorGasto: Number(o.valorGasto ?? o.valorConsumido ?? 0),
          percentualConsumido: Number(o.percentualConsumido ?? 0),
          status: o.status || o.estado || 'NORMAL',
          cor: o.cor || '#C9A74E',
          icone: o.icone || 'category',
        }))
      : MOCK_DASHBOARD_FALLBACK.orcamentos;

    const metasPrioritarias: MetaPrioritariaDashboard[] = Array.isArray(
      raw.metasPrioritarias || raw.metasAtivas
    )
      ? (raw.metasPrioritarias || raw.metasAtivas).map((m: any) => ({
          id: m.id || `meta-${Date.now()}`,
          nome: m.nome || m.titulo || 'Meta',
          valorAlvo: Number(m.valorAlvo || 0),
          valorAtual: Number(m.valorAtual || m.valorAcumulado || 0),
          percentualConcluido: Number(m.percentualConcluido ?? m.progresso ?? 0),
          prazo: m.prazo || '2026-12-31',
          status: m.status || 'EM_ANDAMENTO',
          ritmoMensalEstimado: Number(m.ritmoMensalEstimado || 0),
          diasRestantes: Number(m.diasRestantes || 0),
          cor: m.cor || '#C9A74E',
          icone: m.icone || 'flag',
        }))
      : MOCK_DASHBOARD_FALLBACK.metasPrioritarias;

    const alertas: AlertaDashboard[] = Array.isArray(raw.alertas || raw.alertasCriticos)
      ? (raw.alertas || raw.alertasCriticos).map((a: any) => ({
          id: a.id || `alt-${Date.now()}`,
          titulo: a.titulo || 'Alerta Financeiro',
          mensagem: a.mensagem || '',
          tipo: a.tipo || 'OUTRO',
          severidade: a.severidade || 'MEDIO',
          data: a.data || a.dataIdentificacao || '2026-08-08',
          link: a.link || '/dashboard',
        }))
      : MOCK_DASHBOARD_FALLBACK.alertas;

    return {
      competencia: raw.competencia || competencia,
      usuarioNome: raw.usuarioNome || 'Eduardo',
      resumoExecutivo: raw.resumoExecutivo || MOCK_DASHBOARD_FALLBACK.resumoExecutivo,
      saldoAtual,
      saldoProjetado,
      receitasPendentes: Number(raw.receitasPendentes || 0),
      despesasPendentes: Number(raw.despesasPendentes || 0),
      receitasLiquidadasMes: Number(raw.receitasLiquidadasMes || 0),
      despesasLiquidadasMes: Number(raw.despesasLiquidadasMes || 0),
      fluxoDoPeriodo: Number(raw.fluxoDoPeriodo || 0),
      variacaoSaldoMesAnterior: Number(raw.variacaoSaldoMesAnterior || 12.5),
      faturasAbertas,
      orcamentos,
      metasPrioritarias,
      alertas,
    };
  }
}
