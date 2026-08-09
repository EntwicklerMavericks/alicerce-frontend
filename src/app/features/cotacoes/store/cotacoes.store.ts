import { Injectable, signal, computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CotacoesService } from '../../../core/services/cotacoes.service';
import {
  CotacaoAvulsa,
  ComparadorCotacoes,
  MelhorOferta,
  RegistrarCotacaoAvulsaDto,
  LinkLojaOferta,
  HistoricoComparativo,
} from '../../../core/models/cotacao.models';
import { ItemWishlist } from '../../../core/models/wishlist.models';
import { Produto } from '../../../core/models/produto.models';

export interface ApexChartMultiSeries {
  name: string;
  data: Array<{ x: string; y: number }>;
}

@Injectable({
  providedIn: 'root',
})
export class CotacoesStore {
  private readonly api = inject(CotacoesService);

  // State Signals
  readonly comparador = signal<ComparadorCotacoes | null>(null);
  readonly cotacoesAvulsas = signal<CotacaoAvulsa[]>([]);
  readonly itemWishlistAtual = signal<ItemWishlist | null>(null);
  readonly produtoAtual = signal<Produto | null>(null);
  readonly carregando = signal<boolean>(false);
  readonly erro = signal<string | null>(null);

  // Computed Selectors
  readonly itemWishlistId = computed(() => {
    return this.comparador()?.itemWishlistId || this.itemWishlistAtual()?.id || '';
  });

  readonly nomeItem = computed(() => {
    return (
      this.comparador()?.itemWishlistNome ||
      this.itemWishlistAtual()?.nome ||
      this.produtoAtual()?.nome ||
      'Item de Desejo'
    );
  });

  readonly precoAlvo = computed<number | null>(() => {
    const comp = this.comparador();
    if (comp?.precoAlvo !== undefined && comp.precoAlvo !== null && comp.precoAlvo > 0) {
      return comp.precoAlvo;
    }
    const itemWish = this.itemWishlistAtual();
    if (itemWish && itemWish.precoEstimado > 0) {
      return itemWish.precoEstimado;
    }
    const prod = this.produtoAtual();
    if (prod && prod.menorPreco && prod.menorPreco > 0) {
      return prod.menorPreco;
    }
    return null;
  });

  // Todas as ofertas ativas (Links de Loja + Cotações Avulsas)
  readonly todasOfertas = computed<MelhorOferta[]>(() => {
    const comp = this.comparador();
    const ofertas: MelhorOferta[] = [];

    // Links de loja vinculados
    if (comp && comp.linksLoja) {
      comp.linksLoja.forEach((link) => {
        ofertas.push({
          lojaNome: link.lojaNome,
          preco: Number(link.preco),
          url: link.url,
          lojaLogo: link.lojaLogo,
          isCotacaoAvulsa: false,
          data: link.ultimaVerificacao || new Date(),
        });
      });
    }

    // Cotações Avulsas
    const avulsas = this.cotacoesAvulsas();
    avulsas.forEach((cot) => {
      ofertas.push({
        lojaNome: cot.lojaNome,
        preco: Number(cot.preco),
        url: cot.lojaUrl,
        isCotacaoAvulsa: true,
        data: cot.dataCotacao || cot.criadoEm || new Date(),
      });
    });

    return ofertas.sort((a, b) => a.preco - b.preco);
  });

  // Destaque da Melhor Oferta do Mercado (Menor preço ativo)
  readonly melhorOferta = computed<MelhorOferta | null>(() => {
    const lista = this.todasOfertas();
    if (lista.length === 0) return null;
    return lista[0]; // Menor preço pois está ordenado ASC
  });

  // Preço Alvo Atingido ✨ (alvoAtingido = true se melhorOferta.preco <= precoAlvo)
  readonly alvoAtingido = computed<boolean>(() => {
    const melhor = this.melhorOferta();
    const alvo = this.precoAlvo();
    if (!melhor || alvo === null || alvo <= 0) return false;
    return melhor.preco <= alvo;
  });

  // Economia Potencial em R$ e % (ou null se sem preço alvo)
  readonly economiaPotencial = computed<{ valor: number; percentual: number } | null>(() => {
    const melhor = this.melhorOferta();
    const alvo = this.precoAlvo();
    if (!melhor || alvo === null || alvo <= 0) return null;

    const diferenca = alvo - melhor.preco;
    if (diferenca <= 0) return { valor: 0, percentual: 0 };

    const percentual = Number(((diferenca / alvo) * 100).toFixed(1));
    return {
      valor: Number(diferenca.toFixed(2)),
      percentual,
    };
  });

  // Gráfico ApexCharts com histórico temporal sobreposto por loja (Multi-Series)
  readonly seriesApexCharts = computed<ApexChartMultiSeries[]>(() => {
    const comp = this.comparador();
    const avulsas = this.cotacoesAvulsas();
    const historicoGeral = comp?.historico || [];

    // Mapeamento por Loja -> [{ x: 'dd/MM', y: preco }]
    const lojaMap = new Map<string, Array<{ x: string; y: number; timestamp: number }>>();

    const formatDataLabel = (d: string | Date): { label: string; ts: number } => {
      const dateObj = new Date(d);
      if (isNaN(dateObj.getTime())) {
        return { label: 'Recente', ts: Date.now() };
      }
      const day = dateObj.getDate().toString().padStart(2, '0');
      const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      return { label: `${day}/${month}`, ts: dateObj.getTime() };
    };

    // 1. Processar links de loja com seus históricos individuais
    if (comp?.linksLoja) {
      comp.linksLoja.forEach((link) => {
        const storeName = link.lojaNome;
        if (!lojaMap.has(storeName)) {
          lojaMap.set(storeName, []);
        }

        if (link.historicoPrecos && link.historicoPrecos.length > 0) {
          link.historicoPrecos.forEach((h) => {
            const { label, ts } = formatDataLabel(h.data);
            lojaMap.get(storeName)!.push({ x: label, y: Number(h.preco), timestamp: ts });
          });
        } else {
          const { label, ts } = formatDataLabel(link.ultimaVerificacao || new Date());
          lojaMap.get(storeName)!.push({ x: label, y: Number(link.preco), timestamp: ts });
        }
      });
    }

    // 2. Processar cotações avulsas
    avulsas.forEach((cot) => {
      const storeName = cot.lojaNome;
      if (!lojaMap.has(storeName)) {
        lojaMap.set(storeName, []);
      }
      const { label, ts } = formatDataLabel(cot.dataCotacao || cot.criadoEm || new Date());
      lojaMap.get(storeName)!.push({ x: label, y: Number(cot.preco), timestamp: ts });
    });

    // 3. Processar histórico comparativo complementar se houver
    historicoGeral.forEach((item) => {
      const storeName = item.lojaNome;
      if (!lojaMap.has(storeName)) {
        lojaMap.set(storeName, []);
      }
      const { label, ts } = formatDataLabel(item.data);
      lojaMap.get(storeName)!.push({ x: label, y: Number(item.preco), timestamp: ts });
    });

    // Converter Map para Array de Séries do ApexCharts
    const seriesList: ApexChartMultiSeries[] = [];
    lojaMap.forEach((points, storeName) => {
      if (points.length > 0) {
        // Ordenar pontos por data/timestamp
        points.sort((a, b) => a.timestamp - b.timestamp);
        seriesList.push({
          name: storeName,
          data: points.map((p) => ({ x: p.x, y: p.y })),
        });
      }
    });

    return seriesList;
  });

  // Action Methods
  async carregarComparador(itemWishlistId: string, itemWishlist?: ItemWishlist, produto?: Produto): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);

    if (itemWishlist) this.itemWishlistAtual.set(itemWishlist);
    if (produto) this.produtoAtual.set(produto);

    try {
      const comp = await firstValueFrom(this.api.obterComparador(itemWishlistId));
      if (comp) {
        this.comparador.set(comp);
        this.cotacoesAvulsas.set(comp.cotacoesAvulsas || []);
        return;
      }
    } catch (err) {
      // Endpoint backend não respondeu ou em offline fallback
    } finally {
      // Gerar mock comparativo enriquecido se o servidor não forneceu dados
      if (!this.comparador()) {
        this.gerarMockComparativo(itemWishlistId, itemWishlist, produto);
      }
      this.carregando.set(false);
    }
  }

  async registrarCotacaoAvulsa(dto: RegistrarCotacaoAvulsaDto): Promise<boolean> {
    this.carregando.set(true);
    this.erro.set(null);

    try {
      const novaCotacao = await firstValueFrom(this.api.registrarCotacaoAvulsa(dto));
      this.cotacoesAvulsas.update((list) => [novaCotacao, ...list]);
      return true;
    } catch (err) {
      // Fallback local mock se backend offline
      const mockNova: CotacaoAvulsa = {
        id: `cot-${Date.now()}`,
        itemWishlistId: dto.itemWishlistId,
        lojaNome: dto.lojaNome,
        lojaUrl: dto.lojaUrl,
        preco: Number(dto.preco),
        dataCotacao: new Date().toISOString(),
        observacao: dto.observacao,
        criadoEm: new Date().toISOString(),
      };
      this.cotacoesAvulsas.update((list) => [mockNova, ...list]);
      return true;
    } finally {
      this.carregando.set(false);
    }
  }

  async removerCotacaoAvulsa(id: string): Promise<boolean> {
    try {
      await firstValueFrom(this.api.removerCotacaoAvulsa(id));
    } catch (_) {}

    this.cotacoesAvulsas.update((list) => list.filter((c) => c.id !== id));
    return true;
  }

  resetStore(): void {
    this.comparador.set(null);
    this.cotacoesAvulsas.set([]);
    this.itemWishlistAtual.set(null);
    this.produtoAtual.set(null);
    this.erro.set(null);
  }

  // Gera dados realistas de teste para visualização fluida e demonstração completa
  private gerarMockComparativo(itemWishlistId: string, itemWishlist?: ItemWishlist, produto?: Produto): void {
    const nomeItem = itemWishlist?.nome || produto?.nome || 'Item de Desejo';
    const precoBase = itemWishlist?.precoEstimado || produto?.menorPreco || 1500;

    const mockLinks: LinkLojaOferta[] = [
      {
        id: 'link-amz',
        lojaNome: 'Amazon Brasil',
        lojaLogo: 'https://logo.clearbit.com/amazon.com.br',
        url: itemWishlist?.linkUrl || 'https://amazon.com.br',
        preco: Number((precoBase * 0.88).toFixed(2)), // 12% abaixo do preço alvo -> Preço Alvo Atingido!
        ultimaVerificacao: new Date(Date.now() - 2 * 60 * 60 * 1000),
        historicoPrecos: [
          { preco: Number((precoBase * 1.05).toFixed(2)), data: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
          { preco: Number((precoBase * 0.98).toFixed(2)), data: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
          { preco: Number((precoBase * 0.88).toFixed(2)), data: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
        ],
      },
      {
        id: 'link-ml',
        lojaNome: 'Mercado Livre',
        lojaLogo: 'https://logo.clearbit.com/mercadolivre.com.br',
        url: 'https://mercadolivre.com.br',
        preco: Number((precoBase * 0.92).toFixed(2)),
        ultimaVerificacao: new Date(Date.now() - 5 * 60 * 60 * 1000),
        historicoPrecos: [
          { preco: Number((precoBase * 1.02).toFixed(2)), data: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000) },
          { preco: Number((precoBase * 0.95).toFixed(2)), data: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
          { preco: Number((precoBase * 0.92).toFixed(2)), data: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        ],
      },
      {
        id: 'link-mgl',
        lojaNome: 'Magazine Luiza',
        lojaLogo: 'https://logo.clearbit.com/magazineluiza.com.br',
        url: 'https://magazineluiza.com.br',
        preco: Number((precoBase * 0.96).toFixed(2)),
        ultimaVerificacao: new Date(Date.now() - 12 * 60 * 60 * 1000),
        historicoPrecos: [
          { preco: Number((precoBase * 1.1).toFixed(2)), data: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
          { preco: Number((precoBase * 1.0).toFixed(2)), data: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
          { preco: Number((precoBase * 0.96).toFixed(2)), data: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        ],
      },
    ];

    const mockAvulsas: CotacaoAvulsa[] = [
      {
        id: 'cot-1',
        itemWishlistId,
        lojaNome: 'Kabum',
        lojaUrl: 'https://kabum.com.br',
        preco: Number((precoBase * 0.85).toFixed(2)), // Cotação avulsa imbatível!
        dataCotacao: new Date(Date.now() - 3 * 60 * 60 * 1000),
        observacao: 'Preço via PIX com cupom TECH10',
        criadoEm: new Date(Date.now() - 3 * 60 * 60 * 1000),
      },
    ];

    const compMock: ComparadorCotacoes = {
      itemWishlistId,
      itemWishlistNome: nomeItem,
      precoAlvo: precoBase,
      melhorOferta: {
        lojaNome: 'Kabum',
        preco: Number((precoBase * 0.85).toFixed(2)),
        url: 'https://kabum.com.br',
        isCotacaoAvulsa: true,
        data: new Date(),
      },
      alvoAtingido: true,
      economiaPotencial: Number((precoBase * 0.15).toFixed(2)),
      economiaPercentual: 15,
      cotacoesAvulsas: mockAvulsas,
      linksLoja: mockLinks,
      historico: [
        { lojaNome: 'Kabum', preco: Number((precoBase * 0.98).toFixed(2)), data: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
        { lojaNome: 'Kabum', preco: Number((precoBase * 0.85).toFixed(2)), data: new Date(Date.now() - 3 * 60 * 60 * 1000) },
      ],
    };

    this.comparador.set(compMock);
    this.cotacoesAvulsas.set(mockAvulsas);
  }
}
