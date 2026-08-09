import { Injectable, signal, computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { OrcamentosService } from '../../../core/services/orcamentos.service';
import {
  Orcamento,
  CriarOrcamentoDto,
  ResumoOrcamento,
  StatusOrcamento,
  calcularStatusOrcamento,
} from '../../../core/models/orcamento.models';

const MOCK_ORCAMENTOS_INICIAIS: Orcamento[] = [
  {
    id: 'orc-1',
    workspaceId: 'ws-default',
    categoria: 'Alimentação & Supermercado',
    valorTeto: 1500,
    valorGasto: 1150,
    percentualConsumido: 76.67,
    mesAno: '2026-08',
    status: 'ALERTA',
    cor: '#ff9800',
    icone: 'restaurant',
  },
  {
    id: 'orc-2',
    workspaceId: 'ws-default',
    categoria: 'Moradia & Contas',
    valorTeto: 2800,
    valorGasto: 2650,
    percentualConsumido: 94.64,
    mesAno: '2026-08',
    status: 'ATENCAO',
    cor: '#fbc02d',
    icone: 'home',
  },
  {
    id: 'orc-3',
    workspaceId: 'ws-default',
    categoria: 'Transporte & Combustível',
    valorTeto: 800,
    valorGasto: 850,
    percentualConsumido: 106.25,
    mesAno: '2026-08',
    status: 'EXCEDIDO',
    cor: '#f44336',
    icone: 'directions_car',
  },
  {
    id: 'orc-4',
    workspaceId: 'ws-default',
    categoria: 'Lazer & Cultura',
    valorTeto: 600,
    valorGasto: 320,
    percentualConsumido: 53.33,
    mesAno: '2026-08',
    status: 'NORMAL',
    cor: '#4caf50',
    icone: 'sports_esports',
  },
  {
    id: 'orc-5',
    workspaceId: 'ws-default',
    categoria: 'Saúde & Farmácia',
    valorTeto: 500,
    valorGasto: 200,
    percentualConsumido: 40.0,
    mesAno: '2026-08',
    status: 'NORMAL',
    cor: '#4caf50',
    icone: 'local_hospital',
  },
];

function formatMesAnoAtual(): string {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  return `${ano}-${mes}`;
}

@Injectable({
  providedIn: 'root',
})
export class OrcamentosStore {
  private readonly api = inject(OrcamentosService);

  // State Signals
  readonly mesAnoSelecionado = signal<string>(formatMesAnoAtual());
  readonly resumo = signal<ResumoOrcamento | null>(null);
  readonly orcamentos = signal<Orcamento[]>([]);
  readonly carregando = signal<boolean>(false);
  readonly erro = signal<string | null>(null);

  // Computed Selectors
  readonly tetoTotal = computed(() => {
    return this.orcamentos().reduce((acc, item) => acc + Number(item.valorTeto || 0), 0);
  });

  readonly gastoTotal = computed(() => {
    return this.orcamentos().reduce((acc, item) => acc + Number(item.valorGasto || 0), 0);
  });

  readonly restanteTotal = computed(() => {
    return Math.max(0, this.tetoTotal() - this.gastoTotal());
  });

  readonly percentualGlobal = computed(() => {
    const teto = this.tetoTotal();
    if (!teto || teto <= 0) return 0;
    const pct = (this.gastoTotal() / teto) * 100;
    return Number(pct.toFixed(1));
  });

  readonly statusGlobal = computed<StatusOrcamento>(() => {
    return calcularStatusOrcamento(this.percentualGlobal());
  });

  readonly qtdExcedidos = computed(() => {
    return this.orcamentos().filter((o) => o.status === 'EXCEDIDO').length;
  });

  readonly qtdAlerta = computed(() => {
    return this.orcamentos().filter((o) => o.status === 'ALERTA' || o.status === 'ATENCAO').length;
  });

  async carregarOrcamentos(mesAno?: string): Promise<void> {
    const targetMes = mesAno || this.mesAnoSelecionado();
    this.mesAnoSelecionado.set(targetMes);
    this.carregando.set(true);
    this.erro.set(null);

    try {
      const res = await firstValueFrom(this.api.buscarPorCompetencia(targetMes));
      if (res && res.orcamentos) {
        this.resumo.set(res);
        this.orcamentos.set(res.orcamentos);
      } else {
        this.usarMockData(targetMes);
      }
    } catch (err: any) {
      // Fallback para mock data local em caso de erro da API
      this.usarMockData(targetMes);
    } finally {
      this.carregando.set(false);
    }
  }

  private usarMockData(mesAno: string): void {
    const listaMes = MOCK_ORCAMENTOS_INICIAIS.map((o) => ({ ...o, mesAno }));
    this.orcamentos.set(listaMes);

    const tetoTotal = listaMes.reduce((a, b) => a + b.valorTeto, 0);
    const gastoTotal = listaMes.reduce((a, b) => a + b.valorGasto, 0);
    const pct = tetoTotal > 0 ? (gastoTotal / tetoTotal) * 100 : 0;

    this.resumo.set({
      mesAno,
      tetoTotal,
      gastoTotal,
      percentualTotal: Number(pct.toFixed(1)),
      statusGlobal: calcularStatusOrcamento(pct),
      orcamentos: listaMes,
    });
  }

  async definirMesAno(mesAno: string): Promise<void> {
    await this.carregarOrcamentos(mesAno);
  }

  async criarOrcamento(dto: CriarOrcamentoDto): Promise<boolean> {
    this.carregando.set(true);
    this.erro.set(null);

    try {
      const novo = await firstValueFrom(this.api.criar(dto));
      this.orcamentos.update((list) => [...list, novo]);
      return true;
    } catch (err: any) {
      // Fallback local se backend não estiver respondendo
      const pct = 0;
      const mockNovo: Orcamento = {
        id: `orc-${Date.now()}`,
        workspaceId: 'ws-default',
        categoria: dto.categoria,
        valorTeto: Number(dto.valorTeto),
        valorGasto: 0,
        percentualConsumido: pct,
        mesAno: dto.mesAno || this.mesAnoSelecionado(),
        status: 'NORMAL',
        cor: dto.cor || '#4caf50',
        icone: dto.icone || 'category',
      };
      this.orcamentos.update((list) => [...list, mockNovo]);
      return true;
    } finally {
      this.carregando.set(false);
    }
  }

  async removerOrcamento(id: string): Promise<boolean> {
    try {
      await firstValueFrom(this.api.remover(id));
      this.orcamentos.update((list) => list.filter((item) => item.id !== id));
      return true;
    } catch (err: any) {
      // Fallback local se backend não responder
      this.orcamentos.update((list) => list.filter((item) => item.id !== id));
      return true;
    }
  }
}
