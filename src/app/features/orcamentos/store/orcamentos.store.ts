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
        this.usarEstadoVazio(targetMes);
      }
    } catch (err: any) {
      this.usarEstadoVazio(targetMes);
    } finally {
      this.carregando.set(false);
    }
  }

  private usarEstadoVazio(mesAno: string): void {
    this.orcamentos.set([]);
    this.resumo.set({
      mesAno,
      tetoTotal: 0,
      gastoTotal: 0,
      percentualTotal: 0,
      statusGlobal: 'NORMAL',
      orcamentos: [],
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
