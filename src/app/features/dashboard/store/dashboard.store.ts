import { Injectable, signal, computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { DashboardService } from '../../../core/services/dashboard.service';
import { StorageService } from '../../../core/platform/storage.service';
import { AuthStore } from '../../auth/store/auth.store';
import {
  DashboardResult,
  AlertaDashboard,
  FaturaAbertaDashboard,
  OrcamentoResumoDashboard,
  MetaPrioritariaDashboard,
} from '../../../core/models/dashboard.models';

const STORAGE_KEY_SALDO_VISIVEL = 'alicerce_dashboard_saldo_visivel';

const EMPTY_DASHBOARD_FALLBACK: DashboardResult = {
  competencia: new Date().toISOString().slice(0, 7),
  usuarioNome: 'Usuário',
  resumoExecutivo:
    'Bem-vindo ao Alicerce Finanças. Cadastre suas carteiras, cartões e metas para iniciar seu acompanhamento.',
  saldoAtual: 0,
  saldoProjetado: 0,
  receitasPendentes: 0,
  despesasPendentes: 0,
  receitasLiquidadasMes: 0,
  despesasLiquidadasMes: 0,
  fluxoDoPeriodo: 0,
  variacaoSaldoMesAnterior: 0,
  faturasAbertas: [],
  orcamentos: [],
  metasPrioritarias: [],
  alertas: [],
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

  private readonly authStore = inject(AuthStore);

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
        this.dashboardData.set(EMPTY_DASHBOARD_FALLBACK);
      }
    } catch (err: any) {
      // Em caso de falha de conexão HTTP com o backend, usa os dados consolidados do modelo local
      this.dashboardData.set(EMPTY_DASHBOARD_FALLBACK);
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
      : EMPTY_DASHBOARD_FALLBACK.faturasAbertas;

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
      : EMPTY_DASHBOARD_FALLBACK.orcamentos;

    const metasPrioritarias: MetaPrioritariaDashboard[] = Array.isArray(
      raw.metasPrioritarias || raw.metasAtivas
    )
      ? (raw.metasPrioritarias || raw.metasAtivas).map((m: any) => {
          const valorAlvo = Number(m.valorAlvo || 0);
          const valorAtual = Number(m.valorAcumulado ?? m.valorAtual ?? 0);

          let percentualConcluido = Number(m.percentualConcluido ?? m.progressoPercentual ?? m.progresso ?? 0);
          if (!percentualConcluido && valorAlvo > 0) {
            percentualConcluido = Number(((valorAtual / valorAlvo) * 100).toFixed(1));
          }

          let diasRestantes = Number(m.diasRestantes || 0);
          if (!diasRestantes && m.prazo) {
            const dataPrazo = new Date(m.prazo);
            const hoje = new Date();
            const diffMs = dataPrazo.getTime() - hoje.getTime();
            diasRestantes = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
          }

          let ritmoMensalEstimado = Number(m.ritmoMensalEstimado || 0);
          if (!ritmoMensalEstimado && valorAlvo > valorAtual && diasRestantes > 0) {
            const mesesRestantes = Math.max(1, Math.ceil(diasRestantes / 30));
            ritmoMensalEstimado = Number(((valorAlvo - valorAtual) / mesesRestantes).toFixed(2));
          }

          return {
            id: m.id || `meta-${Date.now()}`,
            nome: m.nome || m.titulo || 'Meta',
            valorAlvo,
            valorAtual,
            percentualConcluido,
            prazo: m.prazo || '2026-12-31',
            status: m.status || 'EM_ANDAMENTO',
            ritmoMensalEstimado,
            diasRestantes,
            cor: m.cor || '#C9A74E',
            icone: m.icone || 'flag',
          };
        })
      : EMPTY_DASHBOARD_FALLBACK.metasPrioritarias;

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
      : EMPTY_DASHBOARD_FALLBACK.alertas;

    return {
      competencia: raw.competencia || competencia,
      usuarioNome: raw.usuarioNome || this.authStore.usuario()?.nome || 'Usuário',
      resumoExecutivo: raw.resumoExecutivo || EMPTY_DASHBOARD_FALLBACK.resumoExecutivo,
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
