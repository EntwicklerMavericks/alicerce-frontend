import { Injectable, signal, computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MetasService } from '../../../core/services/metas.service';
import { Meta, CriarMetaDto, CriarAporteDto, AporteMeta, StatusMeta } from '../../../core/models/meta.models';

const MOCK_METAS_INICIAIS: Meta[] = [
  {
    id: 'meta-1',
    workspaceId: 'ws-default',
    nome: 'Reserva de Emergência',
    descricao: '6 meses de custo fixo para segurança da família',
    valorAlvo: 20000,
    valorAtual: 12500,
    percentualConcluido: 62.5,
    prazo: '2026-12-31',
    status: 'EM_ANDAMENTO',
    cor: '#C9A74E',
    icone: 'shield',
    ritmoMensalEstimado: 1500,
    diasRestantes: 145,
    projetadoPrazo: true,
    aportes: [
      { id: 'ap-1', metaId: 'meta-1', valor: 2500, data: '2026-07-15', observacao: 'Sobra salário julho' },
      { id: 'ap-2', metaId: 'meta-1', valor: 5000, data: '2026-06-10', observacao: 'Rendimento investimentos' },
      { id: 'ap-3', metaId: 'meta-1', valor: 5000, data: '2026-05-01', observacao: 'Aporte inicial' },
    ],
  },
  {
    id: 'meta-2',
    workspaceId: 'ws-default',
    nome: 'Troca de Carro (SUV)',
    descricao: 'Entrada para troca do veículo seminovo',
    valorAlvo: 45000,
    valorAtual: 38000,
    percentualConcluido: 84.44,
    prazo: '2026-10-31',
    status: 'EM_ANDAMENTO',
    cor: '#2e7d32',
    icone: 'directions_car',
    ritmoMensalEstimado: 2333,
    diasRestantes: 84,
    projetadoPrazo: true,
    aportes: [
      { id: 'ap-4', metaId: 'meta-2', valor: 8000, data: '2026-07-20', observacao: 'Venda de itens usados' },
      { id: 'ap-5', metaId: 'meta-2', valor: 30000, data: '2026-04-12', observacao: 'Bônus semestral' },
    ],
  },
  {
    id: 'meta-3',
    workspaceId: 'ws-default',
    nome: 'Viagem em Família (Japão)',
    descricao: 'Passagens e hospedagens para 2027',
    valorAlvo: 18000,
    valorAtual: 4500,
    percentualConcluido: 25.0,
    prazo: '2026-09-01',
    status: 'EM_ANDAMENTO',
    cor: '#A13D63',
    icone: 'flight_takeoff',
    ritmoMensalEstimado: 13500,
    diasRestantes: 24,
    projetadoPrazo: false,
    aportes: [
      { id: 'ap-6', metaId: 'meta-3', valor: 4500, data: '2026-06-01', observacao: 'Poupança viagem' },
    ],
  },
  {
    id: 'meta-4',
    workspaceId: 'ws-default',
    nome: 'Curso Pós-Graduação',
    descricao: 'Especialização em Arquitetura de Software',
    valorAlvo: 8000,
    valorAtual: 8000,
    percentualConcluido: 100.0,
    prazo: '2026-07-01',
    status: 'CONCLUIDA',
    cor: '#0288d1',
    icone: 'school',
    ritmoMensalEstimado: 0,
    diasRestantes: 0,
    projetadoPrazo: true,
    aportes: [
      { id: 'ap-7', metaId: 'meta-4', valor: 8000, data: '2026-06-30', observacao: 'Pagamento integral à vista' },
    ],
  },
];

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
      if (Array.isArray(lista) && lista.length > 0) {
        this.metas.set(lista.map(this.processarMeta));
      } else {
        this.metas.set(MOCK_METAS_INICIAIS.map(this.processarMeta));
      }
    } catch (err: any) {
      // Fallback mock local se backend indisponível
      this.metas.set(MOCK_METAS_INICIAIS.map(this.processarMeta));
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

  async criarMeta(dto: CriarMetaDto): Promise<boolean> {
    this.carregando.set(true);
    this.erro.set(null);

    try {
      const nova = await firstValueFrom(this.api.criar(dto));
      this.metas.update((list) => [...list, this.processarMeta(nova)]);
      return true;
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

      this.metas.update((list) => [...list, this.processarMeta(mockNova)]);
      return true;
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
      if (res && res.meta) {
        this.metas.update((list) => list.map((m) => (m.id === metaId ? this.processarMeta(res.meta) : m)));
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
            observacao: dto.observacao,
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

  private processarMeta = (meta: Meta): Meta => {
    const valorAlvo = Number(meta.valorAlvo || 0);
    const valorAtual = Number(meta.valorAtual || 0);
    const pct = valorAlvo > 0 ? (valorAtual / valorAlvo) * 100 : 0;

    let status: StatusMeta = meta.status;
    if (pct >= 100) {
      status = 'CONCLUIDA';
    }

    // Cálculo de Ritmo Mensal e Dias Restantes
    let diasRestantes = 0;
    let ritmoMensal = 0;
    let noPrazo = true;

    if (meta.prazo) {
      const dataPrazo = new Date(meta.prazo);
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

        // Se ritmo necessário for desproporcional (> 50% do valorAlvo por mês), alerta
        if (ritmoMensal > valorAlvo * 0.5 && diasRestantes < 60) {
          noPrazo = false;
        }
      }
    }

    return {
      ...meta,
      valorAlvo,
      valorAtual,
      percentualConcluido: Number(pct.toFixed(1)),
      status,
      ritmoMensalEstimado: ritmoMensal,
      diasRestantes: Math.max(0, diasRestantes),
      projetadoPrazo: noPrazo,
    };
  };
}
