import { Injectable, signal, computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { WishlistService } from '../../../core/services/wishlist.service';
import {
  ItemWishlist,
  CriarItemWishlistDto,
  AtualizarItemWishlistDto,
  ConcluirCompraWishlistDto,
  DesistirWishlistDto,
  WishlistAnalytics,
  PrioridadeWishlist,
  StatusWishlist,
} from '../../../core/models/wishlist.models';

@Injectable({
  providedIn: 'root',
})
export class WishlistStore {
  private readonly api = inject(WishlistService);

  // State Signals
  readonly itens = signal<ItemWishlist[]>([]);
  readonly itemSelecionado = signal<ItemWishlist | null>(null);
  readonly carregando = signal<boolean>(false);
  readonly erro = signal<string | null>(null);

  // Filtros
  readonly abaAtiva = signal<'ESFRIAMENTO' | 'PLANEJADO' | 'CONCLUIDO_DESISTIDO'>('ESFRIAMENTO');
  readonly filtroPrioridade = signal<PrioridadeWishlist | 'TODOS'>('TODOS');
  readonly termoBusca = signal<string>('');

  // Processamento dinamico de contagem regressiva de esfriamento
  private processarItemWishlist = (item: ItemWishlist): ItemWishlist => {
    const dataInicio = item.dataInicioEsfriamento ? new Date(item.dataInicioEsfriamento) : new Date();
    const totalDias = item.diasEsfriamento || 7;
    const dataFim = new Date(dataInicio.getTime() + totalDias * 24 * 60 * 60 * 1000);
    const hoje = new Date();
    const diffMs = dataFim.getTime() - hoje.getTime();
    const diasRestantes = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    const esfriamentoConcluido = diasRestantes <= 0;

    return {
      ...item,
      precoEstimado: Number(item.precoEstimado || 0),
      precoPago: item.precoPago !== undefined && item.precoPago !== null ? Number(item.precoPago) : null,
      diasEsfriamento: totalDias,
      dataFimEsfriamento: dataFim.toISOString().split('T')[0],
      diasRestantesEsfriamento: item.status === 'ESFRIAMENTO' ? diasRestantes : 0,
      esfriamentoConcluido: item.status === 'ESFRIAMENTO' ? esfriamentoConcluido : true,
    };
  };

  // Computed Selectors
  readonly itensProcessados = computed(() => {
    return this.itens().map(this.processarItemWishlist);
  });

  readonly itensEmEsfriamento = computed(() => {
    return this.itensProcessados().filter((i) => i.status === 'ESFRIAMENTO');
  });

  readonly itensPlanejados = computed(() => {
    return this.itensProcessados().filter((i) => i.status === 'PLANEJADO');
  });

  readonly itensConcluidosEDesistidos = computed(() => {
    return this.itensProcessados().filter((i) => i.status === 'COMPRADO' || i.status === 'DESISTIDO');
  });

  readonly itensFiltrados = computed(() => {
    const aba = this.abaAtiva();
    const prioridade = this.filtroPrioridade();
    const termo = this.termoBusca().trim().toLowerCase();

    let lista = this.itensProcessados();

    if (aba === 'ESFRIAMENTO') {
      lista = lista.filter((i) => i.status === 'ESFRIAMENTO');
    } else if (aba === 'PLANEJADO') {
      lista = lista.filter((i) => i.status === 'PLANEJADO');
    } else if (aba === 'CONCLUIDO_DESISTIDO') {
      lista = lista.filter((i) => i.status === 'COMPRADO' || i.status === 'DESISTIDO');
    }

    if (prioridade !== 'TODOS') {
      lista = lista.filter((i) => i.prioridade === prioridade);
    }

    if (termo) {
      lista = lista.filter((i) =>
        i.nome.toLowerCase().includes(termo) ||
        (i.descricao && i.descricao.toLowerCase().includes(termo)) ||
        (i.categoria && i.categoria.nome.toLowerCase().includes(termo))
      );
    }

    return lista;
  });

  readonly economiaEvitadaAcumulada = computed(() => {
    return this.itensProcessados()
      .filter((i) => i.status === 'DESISTIDO')
      .reduce((acc, i) => acc + (i.economiaEvitada || i.precoEstimado || 0), 0);
  });

  readonly valorTotalPlanejado = computed(() => {
    return this.itensProcessados()
      .filter((i) => i.status === 'ESFRIAMENTO' || i.status === 'PLANEJADO')
      .reduce((acc, i) => acc + (i.precoEstimado || 0), 0);
  });

  readonly taxaConclusaoConsciente = computed(() => {
    const finalizados = this.itensProcessados().filter((i) => i.status === 'COMPRADO' || i.status === 'DESISTIDO');
    if (finalizados.length === 0) return 100;

    const conscientes = finalizados.filter((i) => i.status === 'DESISTIDO' || (i.status === 'COMPRADO' && !i.quebrouDesafio));
    const pct = (conscientes.length / finalizados.length) * 100;
    return Number(pct.toFixed(1));
  });

  readonly taxaCompraImpulsiva = computed(() => {
    const comprados = this.itensProcessados().filter((i) => i.status === 'COMPRADO');
    if (comprados.length === 0) return 0;

    const impulsivos = comprados.filter((i) => i.quebrouDesafio === true);
    const pct = (impulsivos.length / comprados.length) * 100;
    return Number(pct.toFixed(1));
  });

  readonly analytics = computed<WishlistAnalytics>(() => {
    const processados = this.itensProcessados();
    return {
      totalItens: processados.length,
      itensEmEsfriamento: processados.filter((i) => i.status === 'ESFRIAMENTO').length,
      itensPlanejados: processados.filter((i) => i.status === 'PLANEJADO').length,
      itensComprados: processados.filter((i) => i.status === 'COMPRADO').length,
      itensDesistidos: processados.filter((i) => i.status === 'DESISTIDO').length,
      economiaEvitadaAcumulada: this.economiaEvitadaAcumulada(),
      taxaConclusaoConsciente: this.taxaConclusaoConsciente(),
      taxaCompraImpulsiva: this.taxaCompraImpulsiva(),
      valorTotalPlanejado: this.valorTotalPlanejado(),
    };
  });

  // Action methods
  setAbaAtiva(aba: 'ESFRIAMENTO' | 'PLANEJADO' | 'CONCLUIDO_DESISTIDO'): void {
    this.abaAtiva.set(aba);
  }

  setFiltroPrioridade(prioridade: PrioridadeWishlist | 'TODOS'): void {
    this.filtroPrioridade.set(prioridade);
  }

  setTermoBusca(termo: string): void {
    this.termoBusca.set(termo);
  }

  async carregarWishlist(): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);

    try {
      const res = await firstValueFrom(this.api.listar());
      if (Array.isArray(res)) {
        this.itens.set(res);
      } else {
        this.itens.set([]);
      }
    } catch (err) {
      this.itens.set([]);
    } finally {
      this.carregando.set(false);
    }
  }

  async criarItem(dto: CriarItemWishlistDto): Promise<boolean> {
    this.carregando.set(true);
    this.erro.set(null);

    try {
      const novo = await firstValueFrom(this.api.criar(dto));
      this.itens.update((list) => [novo, ...list]);
      return true;
    } catch (err) {
      // Fallback mock local
      const mockNovo: ItemWishlist = {
        id: `wish-${Date.now()}`,
        workspaceId: 'ws-default',
        nome: dto.nome,
        descricao: dto.descricao,
        precoEstimado: Number(dto.precoEstimado),
        prioridade: dto.prioridade || 'MEDIA',
        status: 'ESFRIAMENTO',
        diasEsfriamento: dto.diasEsfriamento || 7,
        dataInicioEsfriamento: new Date().toISOString(),
        produtoId: dto.produtoId,
        metaId: dto.metaId,
        categoriaId: dto.categoriaId,
        linkUrl: dto.linkUrl,
        imagemUrl: dto.imagemUrl || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500',
        dataCriacao: new Date().toISOString(),
      };

      this.itens.update((list) => [mockNovo, ...list]);
      return true;
    } finally {
      this.carregando.set(false);
    }
  }

  async atualizarItem(id: string, dto: AtualizarItemWishlistDto): Promise<boolean> {
    this.carregando.set(true);
    try {
      const at = await firstValueFrom(this.api.atualizar(id, dto));
      this.itens.update((list) => list.map((i) => (i.id === id ? at : i)));
      return true;
    } catch (err) {
      this.itens.update((list) =>
        list.map((i) => {
          if (i.id === id) {
            return {
              ...i,
              nome: dto.nome || i.nome,
              descricao: dto.descricao !== undefined ? dto.descricao : i.descricao,
              precoEstimado: dto.precoEstimado ? Number(dto.precoEstimado) : i.precoEstimado,
              prioridade: dto.prioridade || i.prioridade,
              diasEsfriamento: dto.diasEsfriamento !== undefined ? dto.diasEsfriamento : i.diasEsfriamento,
              linkUrl: dto.linkUrl !== undefined ? dto.linkUrl : i.linkUrl,
              imagemUrl: dto.imagemUrl !== undefined ? dto.imagemUrl : i.imagemUrl,
              status: dto.status || i.status,
              produtoId: dto.produtoId !== undefined ? dto.produtoId : i.produtoId,
              metaId: dto.metaId !== undefined ? dto.metaId : i.metaId,
              dataAtualizacao: new Date().toISOString(),
            };
          }
          return i;
        })
      );
      return true;
    } finally {
      this.carregando.set(false);
    }
  }

  async removerItem(id: string): Promise<boolean> {
    try {
      await firstValueFrom(this.api.remover(id));
    } catch (_) {}

    this.itens.update((list) => list.filter((i) => i.id !== id));
    return true;
  }

  async planejarItem(id: string, metaId?: string): Promise<boolean> {
    this.carregando.set(true);
    try {
      await firstValueFrom(this.api.atualizar(id, { status: 'PLANEJADO', metaId }));
    } catch (_) {}

    this.itens.update((list) =>
      list.map((i) => {
        if (i.id === id) {
          return {
            ...i,
            status: 'PLANEJADO',
            metaId: metaId || i.metaId,
            meta: metaId ? { id: metaId, nome: 'Meta Vinculada' } : i.meta,
          };
        }
        return i;
      })
    );

    this.carregando.set(false);
    return true;
  }

  async comprarItem(id: string, dto: ConcluirCompraWishlistDto, quebrouDesafio: boolean = false): Promise<boolean> {
    this.carregando.set(true);
    try {
      const res = await firstValueFrom(this.api.comprar(id, { ...dto, quebrouDesafio }));
      this.itens.update((list) => list.map((i) => (i.id === id ? res : i)));
    } catch (err) {
      this.itens.update((list) =>
        list.map((i) => {
          if (i.id === id) {
            return {
              ...i,
              status: 'COMPRADO',
              precoPago: Number(dto.precoPago),
              quebrouDesafio,
              dataConclusao: new Date().toISOString(),
            };
          }
          return i;
        })
      );
    } finally {
      this.carregando.set(false);
    }
    return true;
  }

  async desistirItem(id: string, dto: DesistirWishlistDto): Promise<boolean> {
    this.carregando.set(true);
    try {
      const res = await firstValueFrom(this.api.desistir(id, dto));
      this.itens.update((list) => list.map((i) => (i.id === id ? res : i)));
    } catch (err) {
      this.itens.update((list) =>
        list.map((i) => {
          if (i.id === id) {
            return {
              ...i,
              status: 'DESISTIDO',
              motivoDesistencia: dto.motivoDesistencia || 'Salvo no porquinho para reforçar objetivos futuros!',
              economiaEvitada: i.precoEstimado,
              dataConclusao: new Date().toISOString(),
            };
          }
          return i;
        })
      );
    } finally {
      this.carregando.set(false);
    }
    return true;
  }
}
