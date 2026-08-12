import { Injectable, signal, computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ProjetosService } from '../../../core/services/projetos.service';
import {
  Projeto,
  ProjetoReadModel,
  EtapaProjeto,
  EtapaProjetoReadModel,
  ItemProjeto,
  StatusProjeto,
  StatusEtapa,
  CriarProjetoDto,
  AtualizarProjetoDto,
  CriarEtapaProjetoDto,
  AtualizarEtapaProjetoDto,
  VincularItemDto,
} from '../../../core/models/projeto.models';

@Injectable({
  providedIn: 'root',
})
export class ProjetosStore {
  private readonly api = inject(ProjetosService);

  // State Signals
  readonly projetos = signal<ProjetoReadModel[]>([]);
  readonly projetoSelecionado = signal<ProjetoReadModel | null>(null);
  readonly filtroStatus = signal<'TODOS' | StatusProjeto>('TODOS');
  readonly carregando = signal<boolean>(false);
  readonly erro = signal<string | null>(null);

  // Computed Selectors
  readonly projetosFiltrados = computed(() => {
    const status = this.filtroStatus();
    const list = this.projetos();
    if (status === 'TODOS') return list;
    return list.filter((p) => p.status === status);
  });

  readonly totalOrcamentoConsolidado = computed(() => {
    return this.projetos().reduce((acc, p) => acc + Number(p.orcamentoEstimado || 0), 0);
  });

  readonly totalCustoEstimadoConsolidado = computed(() => {
    return this.projetos().reduce((acc, p) => acc + Number(p.custoEstimadoCalculado || 0), 0);
  });

  readonly totalFinanciadoConsolidado = computed(() => {
    return this.projetos().reduce((acc, p) => acc + Number(p.valorFinanciado || 0), 0);
  });

  readonly coberturaFinanceiraGlobal = computed(() => {
    const orc = this.totalOrcamentoConsolidado();
    if (!orc || orc <= 0) return 0;
    const pct = (this.totalFinanciadoConsolidado() / orc) * 100;
    return Math.min(100, Number(pct.toFixed(1)));
  });

  readonly readinessScoreGlobal = computed(() => {
    const list = this.projetos();
    if (list.length === 0) return 0;
    const soma = list.reduce((acc, p) => acc + (p.readinessScore || 0), 0);
    return Math.round(soma / list.length);
  });

  readonly projetosEmPlanejamento = computed(() => {
    return this.projetos().filter((p) => p.status === 'PLANEJAMENTO');
  });

  readonly projetosEmAndamento = computed(() => {
    return this.projetos().filter((p) => p.status === 'EM_ANDAMENTO');
  });

  readonly projetosConcluidos = computed(() => {
    return this.projetos().filter((p) => p.status === 'CONCLUIDO');
  });

  // Métodos da Store
  async carregarProjetos(): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);

    try {
      const lista = await firstValueFrom(this.api.listar());
      if (Array.isArray(lista)) {
        this.projetos.set(lista.map(this.processarProjeto));
      } else {
        this.projetos.set([]);
      }
    } catch (_) {
      this.projetos.set([]);
    } finally {
      this.carregando.set(false);
    }
  }

  async obterProjetoPorId(id: string): Promise<ProjetoReadModel | null> {
    this.carregando.set(true);
    try {
      const proj = await firstValueFrom(this.api.obterPorId(id));
      const processado = this.processarProjeto(proj);
      this.projetoSelecionado.set(processado);
      return processado;
    } catch (_) {
      const achado = this.projetos().find((p) => p.id === id) || null;
      this.projetoSelecionado.set(achado);
      return achado;
    } finally {
      this.carregando.set(false);
    }
  }

  async criarProjeto(dto: CriarProjetoDto): Promise<boolean> {
    this.carregando.set(true);
    this.erro.set(null);

    try {
      const novo = await firstValueFrom(this.api.criar(dto));
      const processado = this.processarProjeto(novo);
      this.projetos.update((list) => [processado, ...list]);
      return true;
    } catch (_) {
      // Fallback mock local
      const mockNovo: Projeto = {
        id: `proj-${Date.now()}`,
        workspaceId: 'ws-default',
        nome: dto.nome,
        descricao: dto.descricao,
        orcamentoEstimado: Number(dto.orcamentoEstimado),
        status: 'PLANEJAMENTO',
        prazoEstimado: dto.prazoEstimado,
        cor: dto.cor || '#C9A74E',
        icone: dto.icone || 'flag',
        etapas: [],
        dataCriacao: new Date().toISOString(),
      };

      const processado = this.processarProjeto(mockNovo);
      this.projetos.update((list) => [processado, ...list]);
      return true;
    } finally {
      this.carregando.set(false);
    }
  }

  async atualizarProjeto(id: string, dto: AtualizarProjetoDto): Promise<boolean> {
    this.carregando.set(true);
    try {
      const atualizado = await firstValueFrom(this.api.atualizar(id, dto));
      const processado = this.processarProjeto(atualizado);
      this.projetos.update((list) => list.map((p) => (p.id === id ? processado : p)));
      if (this.projetoSelecionado()?.id === id) {
        this.projetoSelecionado.set(processado);
      }
      return true;
    } catch (_) {
      this.projetos.update((list) =>
        list.map((p) => {
          if (p.id === id) {
            const mod: Projeto = {
              ...p,
              nome: dto.nome || p.nome,
              descricao: dto.descricao !== undefined ? dto.descricao : p.descricao,
              orcamentoEstimado: dto.orcamentoEstimado ? Number(dto.orcamentoEstimado) : p.orcamentoEstimado,
              prazoEstimado: dto.prazoEstimado !== undefined ? dto.prazoEstimado : p.prazoEstimado,
              cor: dto.cor || p.cor,
              icone: dto.icone || p.icone,
              status: dto.status || p.status,
            };
            const proc = this.processarProjeto(mod);
            if (this.projetoSelecionado()?.id === id) {
              this.projetoSelecionado.set(proc);
            }
            return proc;
          }
          return p;
        })
      );
      return true;
    } finally {
      this.carregando.set(false);
    }
  }

  async removerProjeto(id: string): Promise<boolean> {
    try {
      await firstValueFrom(this.api.remover(id));
    } catch (_) {
      // Ignora erro e remove localmente
    }
    this.projetos.update((list) => list.filter((p) => p.id !== id));
    if (this.projetoSelecionado()?.id === id) {
      this.projetoSelecionado.set(null);
    }
    return true;
  }

  async adicionarEtapa(projetoId: string, dto: CriarEtapaProjetoDto): Promise<boolean> {
    this.carregando.set(true);
    try {
      const etapa = await firstValueFrom(this.api.adicionarEtapa(projetoId, dto));
      this.adicionarEtapaLocal(projetoId, etapa);
      return true;
    } catch (_) {
      const novaEtapaMock: EtapaProjeto = {
        id: `etapa-${Date.now()}`,
        projetoId,
        nome: dto.nome,
        descricao: dto.descricao,
        ordem: dto.ordem || 1,
        status: 'PENDENTE',
        custoEstimado: Number(dto.custoEstimado || 0),
        custoReal: 0,
        itens: [],
      };
      this.adicionarEtapaLocal(projetoId, novaEtapaMock);
      return true;
    } finally {
      this.carregando.set(false);
    }
  }

  private adicionarEtapaLocal(projetoId: string, etapa: EtapaProjeto): void {
    this.projetos.update((list) =>
      list.map((p) => {
        if (p.id === projetoId) {
          const etapasAtuais = p.etapas || [];
          const novaOrdem = etapa.ordem || etapasAtuais.length + 1;
          const etapasAtualizadas = [...etapasAtuais, { ...etapa, ordem: novaOrdem }];
          return this.processarProjeto({ ...p, etapas: etapasAtualizadas });
        }
        return p;
      })
    );

    if (this.projetoSelecionado()?.id === projetoId) {
      const p = this.projetos().find((x) => x.id === projetoId) || null;
      this.projetoSelecionado.set(p);
    }
  }

  async atualizarEtapa(
    projetoId: string,
    etapaId: string,
    dto: AtualizarEtapaProjetoDto
  ): Promise<boolean> {
    this.carregando.set(true);
    try {
      await firstValueFrom(this.api.atualizarEtapa(projetoId, etapaId, dto));
    } catch (_) {
      // Ignora erro backend e atualiza localmente
    }

    this.projetos.update((list) =>
      list.map((p) => {
        if (p.id === projetoId && p.etapas) {
          const etapasNovas = p.etapas.map((e) => {
            if (e.id === etapaId) {
              return {
                ...e,
                nome: dto.nome || e.nome,
                descricao: dto.descricao !== undefined ? dto.descricao : e.descricao,
                status: dto.status || e.status,
                custoEstimado: dto.custoEstimado !== undefined ? Number(dto.custoEstimado) : e.custoEstimado,
                custoReal: dto.custoReal !== undefined ? Number(dto.custoReal) : e.custoReal,
              };
            }
            return e;
          });
          return this.processarProjeto({ ...p, etapas: etapasNovas });
        }
        return p;
      })
    );

    if (this.projetoSelecionado()?.id === projetoId) {
      const p = this.projetos().find((x) => x.id === projetoId) || null;
      this.projetoSelecionado.set(p);
    }

    this.carregando.set(false);
    return true;
  }

  async removerEtapa(projetoId: string, etapaId: string): Promise<boolean> {
    try {
      await firstValueFrom(this.api.removerEtapa(projetoId, etapaId));
    } catch (_) {}

    this.projetos.update((list) =>
      list.map((p) => {
        if (p.id === projetoId && p.etapas) {
          const etapasNovas = p.etapas.filter((e) => e.id !== etapaId);
          return this.processarProjeto({ ...p, etapas: etapasNovas });
        }
        return p;
      })
    );

    if (this.projetoSelecionado()?.id === projetoId) {
      const p = this.projetos().find((x) => x.id === projetoId) || null;
      this.projetoSelecionado.set(p);
    }
    return true;
  }

  async reordenarEtapas(projetoId: string, etapaIds: string[]): Promise<boolean> {
    try {
      await firstValueFrom(this.api.reordenarEtapas(projetoId, { etapaIds }));
    } catch (_) {}

    this.projetos.update((list) =>
      list.map((p) => {
        if (p.id === projetoId && p.etapas) {
          const etapasReordenadas = etapaIds
            .map((id, index) => {
              const e = p.etapas.find((x) => x.id === id);
              return e ? { ...e, ordem: index + 1 } : null;
            })
            .filter((e): e is EtapaProjetoReadModel => e !== null);

          return this.processarProjeto({ ...p, etapas: etapasReordenadas });
        }
        return p;
      })
    );

    if (this.projetoSelecionado()?.id === projetoId) {
      const p = this.projetos().find((x) => x.id === projetoId) || null;
      this.projetoSelecionado.set(p);
    }
    return true;
  }

  async vincularItemEtapa(
    projetoId: string,
    etapaId: string,
    dto: VincularItemDto,
    itemObj?: any
  ): Promise<boolean> {
    this.carregando.set(true);
    let itemCriado: ItemProjeto | null = null;

    try {
      itemCriado = await firstValueFrom(this.api.vincularItem(projetoId, etapaId, dto));
    } catch (_) {
      const valCalc = itemObj?.precoEstimado || itemObj?.valorAlvo || 0;
      const valFin = itemObj?.valorAtual || (itemObj?.status === 'COMPRADO' ? itemObj?.precoEstimado : 0) || 0;

      itemCriado = {
        id: `item-${Date.now()}`,
        etapaId,
        tipo: dto.tipo,
        referenciaId: dto.referenciaId,
        valorCalculado: valCalc,
        valorFinanciado: valFin,
        itemWishlist: dto.tipo === 'WISHLIST' ? itemObj : null,
        meta: dto.tipo === 'META' ? itemObj : null,
        dataCriacao: new Date().toISOString(),
      };
    }

    if (itemCriado) {
      this.projetos.update((list) =>
        list.map((p) => {
          if (p.id === projetoId && p.etapas) {
            const etapasNovas = p.etapas.map((e) => {
              if (e.id === etapaId) {
                const itensAtuais = e.itens || [];
                return { ...e, itens: [...itensAtuais, itemCriado!] };
              }
              return e;
            });
            return this.processarProjeto({ ...p, etapas: etapasNovas });
          }
          return p;
        })
      );

      if (this.projetoSelecionado()?.id === projetoId) {
        const p = this.projetos().find((x) => x.id === projetoId) || null;
        this.projetoSelecionado.set(p);
      }
    }

    this.carregando.set(false);
    return true;
  }

  async desvincularItemEtapa(projetoId: string, etapaId: string, itemId: string): Promise<boolean> {
    try {
      await firstValueFrom(this.api.desvincularItem(projetoId, etapaId, itemId));
    } catch (_) {}

    this.projetos.update((list) =>
      list.map((p) => {
        if (p.id === projetoId && p.etapas) {
          const etapasNovas = p.etapas.map((e) => {
            if (e.id === etapaId && e.itens) {
              const itensFiltrados = e.itens.filter((i) => i.id !== itemId);
              return { ...e, itens: itensFiltrados };
            }
            return e;
          });
          return this.processarProjeto({ ...p, etapas: etapasNovas });
        }
        return p;
      })
    );

    if (this.projetoSelecionado()?.id === projetoId) {
      const p = this.projetos().find((x) => x.id === projetoId) || null;
      this.projetoSelecionado.set(p);
    }
    return true;
  }

  async concluirEtapa(projetoId: string, etapaId: string): Promise<boolean> {
    return this.atualizarEtapa(projetoId, etapaId, { status: 'CONCLUIDA' });
  }

  async concluirProjeto(projetoId: string): Promise<boolean> {
    return this.atualizarProjeto(projetoId, { status: 'CONCLUIDO' });
  }

  setFiltroStatus(status: 'TODOS' | StatusProjeto): void {
    this.filtroStatus.set(status);
  }

  // Helper de Cálculo dos Indicadores Tricolores e Processamento dos Projetos
  private processarProjeto = (proj: Projeto): ProjetoReadModel => {
    const etapas = proj.etapas || [];

    const etapasProcessadas: EtapaProjetoReadModel[] = etapas.map((e) => {
      const itens = e.itens || [];
      let custoCalc = Number(e.custoEstimado || 0);
      let financiado = Number(e.custoReal || 0);

      if (itens.length > 0) {
        let somaItensCusto = 0;
        let somaItensFinanciado = 0;

        itens.forEach((it) => {
          if (it.tipo === 'WISHLIST' && it.itemWishlist) {
            somaItensCusto += Number(it.itemWishlist.precoEstimado || 0);
            if (it.itemWishlist.status === 'COMPRADO') {
              somaItensFinanciado += Number(it.itemWishlist.precoPago || it.itemWishlist.precoEstimado || 0);
            }
          } else if (it.tipo === 'META' && it.meta) {
            somaItensCusto += Number(it.meta.valorAlvo || 0);
            somaItensFinanciado += Number(it.meta.valorAtual || 0);
          } else {
            somaItensCusto += Number(it.valorCalculado || 0);
            somaItensFinanciado += Number(it.valorFinanciado || 0);
          }
        });

        if (somaItensCusto > 0) custoCalc = somaItensCusto;
        financiado = Math.max(financiado, somaItensFinanciado);
      }

      const cobFin = custoCalc > 0 ? Math.min(100, Math.round((financiado / custoCalc) * 100)) : 0;
      const statusWeight = e.status === 'CONCLUIDA' ? 100 : e.status === 'EM_ANDAMENTO' ? 50 : 0;
      const rScore = Math.round(cobFin * 0.6 + statusWeight * 0.4);

      return {
        ...e,
        custoCalculado: custoCalc,
        valorFinanciado: financiado,
        coberturaFinanceira: cobFin,
        readinessScore: rScore,
        itensCount: itens.length,
      };
    });

    const totalEtapas = etapasProcessadas.length;
    const etapasConcluidas = etapasProcessadas.filter((e) => e.status === 'CONCLUIDA').length;

    let custoTotalCalculado = etapasProcessadas.reduce((acc, e) => acc + e.custoCalculado, 0);
    if (custoTotalCalculado === 0) {
      custoTotalCalculado = Number(proj.orcamentoEstimado || 0);
    }

    const valorFinanciadoTotal = etapasProcessadas.reduce((acc, e) => acc + e.valorFinanciado, 0);

    const baseCalculo = Math.max(proj.orcamentoEstimado || 0, custoTotalCalculado, 1);
    const coberturaFinanceira = Math.min(
      100,
      Math.round((valorFinanciadoTotal / baseCalculo) * 100)
    );

    const progressoFisico = totalEtapas > 0 ? Math.round((etapasConcluidas / totalEtapas) * 100) : 0;

    // Readiness Score ponderado: 60% Cobertura Financeira + 40% Progresso Físico
    const readinessScore = Math.min(
      100,
      Math.round(coberturaFinanceira * 0.6 + progressoFisico * 0.4)
    );

    const totalItensVinculados = etapasProcessadas.reduce((acc, e) => acc + e.itensCount, 0);

    let status = proj.status;
    if (progressoFisico >= 100 && totalEtapas > 0 && status !== 'CONCLUIDO') {
      status = 'CONCLUIDO';
    }

    return {
      ...proj,
      status,
      etapas: etapasProcessadas,
      custoEstimadoCalculado: custoTotalCalculado,
      valorFinanciado: valorFinanciadoTotal,
      coberturaFinanceira,
      progressoFisico,
      readinessScore,
      totalEtapas,
      etapasConcluidas,
      totalItensVinculados,
    };
  };
}
