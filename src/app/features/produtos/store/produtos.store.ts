import { Injectable, signal, computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ProdutosService } from '../../../core/services/produtos.service';
import { LojasService } from '../../../core/services/lojas.service';
import {
  Produto,
  CriarProdutoDto,
  AtualizarProdutoDto,
  VincularLinkDto,
  AtualizarPrecoLinkDto,
  HistoricoPreco,
} from '../../../core/models/produto.models';
import { Loja, CriarLojaDto, AtualizarLojaDto } from '../../../core/models/loja.models';

export interface CategoriaOpcao {
  id: string;
  nome: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProdutosStore {
  private readonly produtosApi = inject(ProdutosService);
  private readonly lojasApi = inject(LojasService);

  // Core State Signals
  readonly produtos = signal<Produto[]>([]);
  readonly produtoSelecionado = signal<Produto | null>(null);
  readonly lojas = signal<Loja[]>([]);
  readonly termoBusca = signal<string>('');
  readonly categoriaFiltro = signal<string | null>(null);
  readonly carregando = signal<boolean>(false);
  readonly erro = signal<string | null>(null);
  readonly historicoPrecos = signal<HistoricoPreco[]>([]);

  // Helper function to process product properties (min price, store name, main image)
  private processarProduto(prod: Produto): Produto {
    let menorPreco: number | null = null;
    let lojaMenorPreco: string | null = null;

    if (prod.links && prod.links.length > 0) {
      const linksAtivos = prod.links.filter((l) => l.ativo !== false);
      if (linksAtivos.length > 0) {
        const linkMin = linksAtivos.reduce((min, cur) =>
          Number(cur.preco) < Number(min.preco) ? cur : min
        );
        menorPreco = Number(linkMin.preco);
        lojaMenorPreco = linkMin.loja?.nome || 'Loja Parceira';
      }
    }

    let imagemPrincipalUrl: string | null = null;
    if (prod.imagens && prod.imagens.length > 0) {
      const principal = prod.imagens.find((img) => img.principal && img.ativo !== false);
      const qualquer = prod.imagens.find((img) => img.ativo !== false);
      imagemPrincipalUrl = principal?.url || qualquer?.url || null;
    }

    return {
      ...prod,
      menorPreco,
      lojaMenorPreco,
      imagemPrincipalUrl,
    };
  }

  // Computed Signals
  readonly produtosEnriquecidos = computed(() => {
    return this.produtos().map((p) => this.processarProduto(p));
  });

  readonly produtosFiltrados = computed(() => {
    const lista = this.produtosEnriquecidos();
    const termo = this.termoBusca().trim().toLowerCase();
    const catFiltro = this.categoriaFiltro();

    return lista.filter((prod) => {
      const passaBusca =
        !termo ||
        prod.nome.toLowerCase().includes(termo) ||
        (prod.marca && prod.marca.toLowerCase().includes(termo)) ||
        (prod.descricao && prod.descricao.toLowerCase().includes(termo));

      const passaCategoria =
        !catFiltro ||
        prod.categoriaId === catFiltro ||
        (prod.categoria && prod.categoria.nome === catFiltro);

      return passaBusca && passaCategoria;
    });
  });

  readonly categoriasDisponiveis = computed<CategoriaOpcao[]>(() => {
    const mapa = new Map<string, string>();
    for (const p of this.produtos()) {
      if (p.categoriaId && p.categoria?.nome) {
        mapa.set(p.categoriaId, p.categoria.nome);
      } else if (p.categoria?.nome) {
        mapa.set(p.categoria.nome, p.categoria.nome);
      }
    }

    const resultado: CategoriaOpcao[] = [];
    mapa.forEach((nome, id) => resultado.push({ id, nome }));
    return resultado;
  });

  readonly estatisticas = computed(() => {
    const prods = this.produtosEnriquecidos();
    const totalProdutos = prods.length;
    const totalLojas = this.lojas().length;

    let produtosComOfertas = 0;
    let menorPrecoAbsoluto: number | null = null;

    for (const p of prods) {
      if (p.menorPreco !== null && p.menorPreco !== undefined) {
        produtosComOfertas++;
        if (menorPrecoAbsoluto === null || p.menorPreco < menorPrecoAbsoluto) {
          menorPrecoAbsoluto = p.menorPreco;
        }
      }
    }

    return {
      totalProdutos,
      totalLojas,
      produtosComOfertas,
      menorPrecoAbsoluto,
    };
  });

  readonly produtoSelecionadoEnriquecido = computed(() => {
    const sel = this.produtoSelecionado();
    if (!sel) return null;
    return this.processarProduto(sel);
  });

  // Action Methods
  setTermoBusca(termo: string): void {
    this.termoBusca.set(termo);
  }

  setCategoriaFiltro(categoriaId: string | null): void {
    this.categoriaFiltro.set(categoriaId);
  }

  async carregarProdutos(): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);
    try {
      const res = await firstValueFrom(this.produtosApi.listar());
      this.produtos.set(res || []);
    } catch (err: any) {
      this.erro.set(err?.error?.message || 'Erro ao carregar catálogo de produtos.');
    } finally {
      this.carregando.set(false);
    }
  }

  async carregarLojas(): Promise<void> {
    try {
      const res = await firstValueFrom(this.lojasApi.listar());
      this.lojas.set(res || []);
    } catch (err: any) {
      console.error('Erro ao carregar lojas:', err);
    }
  }

  async carregarProdutoPorId(id: string): Promise<Produto | null> {
    this.carregando.set(true);
    this.erro.set(null);
    try {
      const prod = await firstValueFrom(this.produtosApi.obterPorId(id));
      this.produtoSelecionado.set(prod);
      await this.carregarHistoricoPrecos(id);
      return prod;
    } catch (err: any) {
      this.erro.set(err?.error?.message || 'Produto não encontrado.');
      return null;
    } finally {
      this.carregando.set(false);
    }
  }

  async carregarHistoricoPrecos(produtoId: string): Promise<void> {
    try {
      const hist = await firstValueFrom(this.produtosApi.obterHistoricoPrecos(produtoId));
      this.historicoPrecos.set(hist || []);
    } catch (err) {
      this.historicoPrecos.set([]);
    }
  }

  async criarProduto(dados: CriarProdutoDto): Promise<boolean> {
    this.carregando.set(true);
    this.erro.set(null);
    try {
      await firstValueFrom(this.produtosApi.criar(dados));
      await this.carregarProdutos();
      return true;
    } catch (err: any) {
      this.erro.set(err?.error?.message || 'Erro ao cadastrar produto.');
      return false;
    } finally {
      this.carregando.set(false);
    }
  }

  async atualizarProduto(id: string, dados: AtualizarProdutoDto): Promise<boolean> {
    this.carregando.set(true);
    this.erro.set(null);
    try {
      await firstValueFrom(this.produtosApi.atualizar(id, dados));
      await this.carregarProdutos();
      if (this.produtoSelecionado()?.id === id) {
        await this.carregarProdutoPorId(id);
      }
      return true;
    } catch (err: any) {
      this.erro.set(err?.error?.message || 'Erro ao atualizar produto.');
      return false;
    } finally {
      this.carregando.set(false);
    }
  }

  async removerProduto(id: string): Promise<boolean> {
    this.carregando.set(true);
    this.erro.set(null);
    try {
      await firstValueFrom(this.produtosApi.remover(id));
      await this.carregarProdutos();
      if (this.produtoSelecionado()?.id === id) {
        this.produtoSelecionado.set(null);
      }
      return true;
    } catch (err: any) {
      this.erro.set(err?.error?.message || 'Erro ao remover produto.');
      return false;
    } finally {
      this.carregando.set(false);
    }
  }

  async criarLoja(dados: CriarLojaDto): Promise<boolean> {
    try {
      await firstValueFrom(this.lojasApi.criar(dados));
      await this.carregarLojas();
      return true;
    } catch (err: any) {
      this.erro.set(err?.error?.message || 'Erro ao cadastrar loja.');
      return false;
    }
  }

  async vincularLink(produtoId: string, dados: VincularLinkDto): Promise<boolean> {
    this.carregando.set(true);
    try {
      await firstValueFrom(this.produtosApi.vincularLink(produtoId, dados));
      await this.carregarProdutoPorId(produtoId);
      await this.carregarProdutos();
      return true;
    } catch (err: any) {
      this.erro.set(err?.error?.message || 'Erro ao vincular loja.');
      return false;
    } finally {
      this.carregando.set(false);
    }
  }

  async atualizarPrecoLink(
    produtoId: string,
    linkId: string,
    dados: AtualizarPrecoLinkDto
  ): Promise<boolean> {
    this.carregando.set(true);
    try {
      await firstValueFrom(this.produtosApi.atualizarPrecoLink(produtoId, linkId, dados));
      await this.carregarProdutoPorId(produtoId);
      await this.carregarProdutos();
      return true;
    } catch (err: any) {
      this.erro.set(err?.error?.message || 'Erro ao atualizar preço.');
      return false;
    } finally {
      this.carregando.set(false);
    }
  }

  async removerLink(produtoId: string, linkId: string): Promise<boolean> {
    try {
      await firstValueFrom(this.produtosApi.removerLink(produtoId, linkId));
      await this.carregarProdutoPorId(produtoId);
      await this.carregarProdutos();
      return true;
    } catch (err: any) {
      this.erro.set('Erro ao remover vínculo de loja.');
      return false;
    }
  }

  async adicionarImagem(produtoId: string, url: string): Promise<boolean> {
    try {
      await firstValueFrom(this.produtosApi.adicionarImagem(produtoId, url));
      await this.carregarProdutoPorId(produtoId);
      await this.carregarProdutos();
      return true;
    } catch (err: any) {
      this.erro.set('Erro ao adicionar imagem.');
      return false;
    }
  }

  async definirImagemPrincipal(produtoId: string, imagemId: string): Promise<boolean> {
    try {
      await firstValueFrom(this.produtosApi.definirImagemPrincipal(produtoId, imagemId));
      await this.carregarProdutoPorId(produtoId);
      await this.carregarProdutos();
      return true;
    } catch (err: any) {
      this.erro.set('Erro ao definir foto principal.');
      return false;
    }
  }

  async removerImagem(produtoId: string, imagemId: string): Promise<boolean> {
    try {
      await firstValueFrom(this.produtosApi.removerImagem(produtoId, imagemId));
      await this.carregarProdutoPorId(produtoId);
      await this.carregarProdutos();
      return true;
    } catch (err: any) {
      this.erro.set('Erro ao remover imagem.');
      return false;
    }
  }
}
