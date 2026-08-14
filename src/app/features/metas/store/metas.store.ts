import { Injectable, signal, computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MetasService } from '../../../core/services/metas.service';
import { Meta, CriarMetaDto, CriarAporteDto, AporteMeta, StatusMeta } from '../../../core/models/meta.models';

@Injectable({
  providedIn: 'root',
})
export class MetasStore {
  private readonly api = inject(MetasService);

  // State Signals
  readonly metas = signal<Meta[]>([]);
  readonly metaSelecionada = signal<Meta | null>(null);
  readonly carregando = signal<boolean>(false);
  readonly erro = signal<string | null>(null);

  // Computed Selectors
  readonly totalAlvoConsolidado = computed(() => {
    return this.metas().reduce((acc, m) => acc + Number(m.valorAlvo || 0), 0);
  });

  readonly totalAcumuladoConsolidado = computed(() => {
    return this.metas().reduce((acc, m) => acc + Number(m.valorAtual || 0), 0);
  });

  readonly restanteConsolidado = computed(() => {
    return Math.max(0, this.totalAlvoConsolidado() - this.totalAcumuladoConsolidado());
  });

  readonly percentualGlobalMetas = computed(() => {
    const alvo = this.totalAlvoConsolidado();
    if (!alvo || alvo <= 0) return 0;
    const pct = (this.totalAcumuladoConsolidado() / alvo) * 100;
    return Number(pct.toFixed(1));
  });

  readonly metasEmAndamento = computed(() => {
    return this.metas().filter((m) => m.status === 'EM_ANDAMENTO');
  });

  readonly metasConcluidas = computed(() => {
    return this.metas().filter((m) => m.status === 'CONCLUIDA' || m.valorAtual >= m.valorAlvo);
  });

  readonly metasNoPrazo = computed(() => {
    return this.metas().filter((m) => m.projetadoPrazo !== false && m.status !== 'ATRASADA').length;
  });

  readonly metasAtrasadas = computed(() => {
    return this.metas().filter((m) => m.projetadoPrazo === false || m.status === 'ATRASADA').length;
  });

  async carregarMetas(): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);

    try {
      const lista = await firstValueFrom(this.api.listar());
      if (Array.isArray(lista)) {
        this.metas.set(lista.map(this.processarMeta));
      } else {
        this.metas.set([]);
      }
    } catch (err: any) {
      this.metas.set([]);
    } finally {
      this.carregando.set(false);
    }
  }

  async obterMetaPorId(id: string): Promise<Meta | null> {
    try {
      const meta = await firstValueFrom(this.api.obterPorId(id));
      const processada = this.processarMeta(meta);
      this.metaSelecionada.set(processada);
      return processada;
    } catch (err: any) {
      const achada = this.metas().find((m) => m.id === id) || null;
      this.metaSelecionada.set(achada);
      return achada;
    }
  }

  async criarMeta(dto: CriarMetaDto): Promise<Meta | null> {
    this.carregando.set(true);
    this.erro.set(null);

    try {
      const nova = await firstValueFrom(this.api.criar(dto));
      const processada = this.processarMeta(nova);
      this.metas.update((list) => [...list, processada]);
      return processada;
    } catch (err: any) {
      // Fallback mock local
      const valorInicial = Number(dto.valorInicial || 0);
      const valorAlvo = Number(dto.valorAlvo);
      const pct = valorAlvo > 0 ? (valorInicial / valorAlvo) * 100 : 0;
      const status: StatusMeta = pct >= 100 ? 'CONCLUIDA' : 'EM_ANDAMENTO';

      const mockNova: Meta = {
        id: `meta-${Date.now()}`,
        workspaceId: 'ws-default',
        nome: dto.nome,
        descricao: dto.descricao,
        valorAlvo,
        valorAtual: valorInicial,
        percentualConcluido: Number(pct.toFixed(1)),
        prazo: dto.prazo,
        status,
        cor: dto.cor || '#C9A74E',
        icone: dto.icone || 'flag',
        aportes: valorInicial > 0 ? [
          {
            id: `ap-${Date.now()}`,
            metaId: `meta-${Date.now()}`,
            valor: valorInicial,
            data: new Date().toISOString().split('T')[0],
            observacao: 'Aporte inicial de abertura',
          }
        ] : [],
      };

      const processadaMock = this.processarMeta(mockNova);
      this.metas.update((list) => [...list, processadaMock]);
      return processadaMock;
    } finally {
      this.carregando.set(false);
    }
  }

  async atualizarMeta(id: string, dto: Partial<CriarMetaDto>): Promise<boolean> {
    this.carregando.set(true);
    try {
      const atualizada = await firstValueFrom(this.api.atualizar(id, dto));
      this.metas.update((list) => list.map((m) => (m.id === id ? this.processarMeta(atualizada) : m)));
      return true;
    } catch (err: any) {
      this.metas.update((list) =>
        list.map((m) => {
          if (m.id === id) {
            const alterada = {
              ...m,
              nome: dto.nome || m.nome,
              descricao: dto.descricao !== undefined ? dto.descricao : m.descricao,
              valorAlvo: dto.valorAlvo ? Number(dto.valorAlvo) : m.valorAlvo,
              prazo: dto.prazo || m.prazo,
              cor: dto.cor || m.cor,
              icone: dto.icone || m.icone,
            };
            return this.processarMeta(alterada);
          }
          return m;
        })
      );
      return true;
    } finally {
      this.carregando.set(false);
    }
  }

  async removerMeta(id: string): Promise<boolean> {
    try {
      await firstValueFrom(this.api.remover(id));
      this.metas.update((list) => list.filter((m) => m.id !== id));
      return true;
    } catch (err: any) {
      this.metas.update((list) => list.filter((m) => m.id !== id));
      return true;
    }
  }

  async aportar(metaId: string, dto: CriarAporteDto): Promise<boolean> {
    this.carregando.set(true);
    this.erro.set(null);

    try {
      const res = await firstValueFrom(this.api.aportar(metaId, dto));
      if (res) {
        await this.carregarMetas();
      } else {
        this.aportarLocal(metaId, dto);
      }
      return true;
    } catch (err: any) {
      this.aportarLocal(metaId, dto);
      return true;
    } finally {
      this.carregando.set(false);
    }
  }

  private aportarLocal(metaId: string, dto: CriarAporteDto): void {
    this.metas.update((list) =>
      list.map((m) => {
        if (m.id === metaId) {
          const novoValor = m.valorAtual + Number(dto.valor);
          const pct = (novoValor / m.valorAlvo) * 100;
          const status: StatusMeta = pct >= 100 ? 'CONCLUIDA' : m.status;
          const novoAporte: AporteMeta = {
            id: `ap-${Date.now()}`,
            metaId,
            valor: Number(dto.valor),
            data: dto.data || new Date().toISOString().split('T')[0],
            observacao: dto.observacao || dto.descricao,
          };
          const listaAportes = [novoAporte, ...(m.aportes || [])];

          return this.processarMeta({
            ...m,
            valorAtual: novoValor,
            percentualConcluido: Number(pct.toFixed(1)),
            status,
            aportes: listaAportes,
          });
        }
        return m;
      })
    );
  }

  async removerAporte(metaId: string, aporteId: string): Promise<boolean> {
    try {
      await firstValueFrom(this.api.removerAporte(metaId, aporteId));
      await this.carregarMetas();
      return true;
    } catch (_) {
      // Ignora erro backend e remove localmente
    }

    this.metas.update((list) =>
      list.map((m) => {
        if (m.id === metaId && m.aportes) {
          const aporteRemovido = m.aportes.find((a) => a.id === aporteId);
          const valorRemover = aporteRemovido ? aporteRemovido.valor : 0;
          const novoValor = Math.max(0, m.valorAtual - valorRemover);
          const pct = (novoValor / m.valorAlvo) * 100;
          const status: StatusMeta = pct >= 100 ? 'CONCLUIDA' : 'EM_ANDAMENTO';
          const novosAportes = m.aportes.filter((a) => a.id !== aporteId);

          return this.processarMeta({
            ...m,
            valorAtual: novoValor,
            percentualConcluido: Number(pct.toFixed(1)),
            status,
            aportes: novosAportes,
          });
        }
        return m;
      })
    );
    return true;
  }

  private processarMeta = (rawMeta: any): Meta => {
    const valorAlvo = Number(rawMeta.valorAlvo || 0);
    const valorAtual = Number(rawMeta.valorAcumulado ?? rawMeta.valorAtual ?? 0);
    const rawPct = rawMeta.progressoPercentual ?? (valorAlvo > 0 ? (valorAtual / valorAlvo) * 100 : 0);
    const pct = Number(Number(rawPct).toFixed(1));

    let status: StatusMeta = rawMeta.status;
    if (pct >= 100) {
      status = 'CONCLUIDA';
    }

    // Mapear aportes se fornecidos (como aportes ou historicoAportes)
    const rawAportes = rawMeta.aportes || rawMeta.historicoAportes || [];
    const aportes: AporteMeta[] = Array.isArray(rawAportes)
      ? rawAportes.map((a: any) => {
          let dataStr = new Date().toISOString().split('T')[0];
          if (a.data) {
            dataStr = typeof a.data === 'string' ? a.data.split('T')[0] : new Date(a.data).toISOString().split('T')[0];
          }
          return {
            id: a.id,
            metaId: a.metaId || rawMeta.id,
            valor: Number(a.valor || 0),
            data: dataStr,
            observacao: a.observacao || a.descricao || '',
            dataCriacao: a.dataCriacao,
          };
        })
      : [];

    // Cálculo de Ritmo Mensal e Dias Restantes
    let diasRestantes = rawMeta.diasRestantes || 0;
    let ritmoMensal = rawMeta.ritmoMensalEstimado || 0;
    let noPrazo = rawMeta.projetadoPrazo ?? true;

    if (rawMeta.prazo) {
      const dataPrazo = new Date(rawMeta.prazo);
      const hoje = new Date();
      const diffMs = dataPrazo.getTime() - hoje.getTime();
      diasRestantes = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (diasRestantes < 0 && pct < 100) {
        status = 'ATRASADA';
        noPrazo = false;
      } else if (pct < 100) {
        const mesesRestantes = Math.max(1, Math.ceil(diasRestantes / 30));
        const faltante = Math.max(0, valorAlvo - valorAtual);
        ritmoMensal = Math.round(faltante / mesesRestantes);

        if (ritmoMensal > valorAlvo * 0.5 && diasRestantes < 60) {
          noPrazo = false;
        }
      }
    }

    return {
      ...rawMeta,
      id: rawMeta.id,
      workspaceId: rawMeta.workspaceId || 'ws-default',
      nome: rawMeta.nome,
      descricao: rawMeta.descricao,
      valorAlvo,
      valorAtual,
      percentualConcluido: pct,
      prazo: rawMeta.prazo,
      status,
      cor: rawMeta.cor || '#C9A74E',
      icone: rawMeta.icone || 'flag',
      ritmoMensalEstimado: ritmoMensal,
      diasRestantes: Math.max(0, diasRestantes),
      projetadoPrazo: noPrazo,
      aportes,
    };
  };
}
