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
      const rawList: any[] = Array.isArray(res) ? res : ((res as any)?.orcamentos || []);
      const lista: Orcamento[] = rawList.map((item: any) => {
        const teto = Number(item.teto ?? item.valorTeto ?? 0);
        const gasto = Number(item.valorConsumido ?? item.valorGasto ?? 0);
        const percentual = Number(item.percentualConsumido ?? (teto > 0 ? (gasto / teto) * 100 : 0));

        let status: StatusOrcamento = (item.estado || item.status || 'NORMAL') as StatusOrcamento;
        if (percentual >= 100) status = 'EXCEDIDO';
        else if (percentual >= 90) status = 'ATENCAO';
        else if (percentual >= 70) status = 'ALERTA';
        else status = 'NORMAL';

        return {
          id: item.id,
          workspaceId: item.workspaceId || '',
          categoriaId: item.categoriaId,
          categoria: item.categoriaNome || item.categoria || 'Categoria',
          valorTeto: teto,
          valorGasto: gasto,
          percentualConsumido: Math.round(percentual),
          mesAno: item.ano && item.mes ? `${item.ano}-${String(item.mes).padStart(2, '0')}` : targetMes,
          mes: item.mes,
          ano: item.ano,
          status,
          cor: item.categoriaCor || item.cor || '#C9A74E',
          icone: item.categoriaIcone || item.icone || 'pie_chart',
        };
      });

      this.orcamentos.set(lista);
      this.resumo.set({
        mesAno: targetMes,
        tetoTotal: this.tetoTotal(),
        gastoTotal: this.gastoTotal(),
        percentualTotal: this.percentualGlobal(),
        statusGlobal: this.statusGlobal(),
        orcamentos: lista,
      });
    } catch (err: any) {
      console.error('Erro ao carregar orçamentos:', err);
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
      await firstValueFrom(this.api.criar(dto));
      await this.carregarOrcamentos(dto.mesAno || this.mesAnoSelecionado());
      return true;
    } catch (err: any) {
      console.error('Erro ao criar orçamento:', err);
      const rawMsg = err?.error?.message;
      const msg = Array.isArray(rawMsg)
        ? rawMsg.join(', ')
        : (rawMsg || err?.message || 'Erro ao salvar orçamento.');
      this.erro.set(msg);
      return false;
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
      console.error('Erro ao remover orçamento:', err);
      return false;
    }
  }
}
