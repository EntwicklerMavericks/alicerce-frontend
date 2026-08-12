import { Injectable, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CategoriasApiService, CriarCategoriaPayload, AtualizarCategoriaPayload } from '../../../core/services/categorias.service';
import { Categoria } from '../../../core/models/lancamento.models';

@Injectable({
  providedIn: 'root',
})
export class CategoriasStore {
  readonly categorias = signal<Categoria[]>([]);
  readonly carregando = signal<boolean>(false);
  readonly criando = signal<boolean>(false);
  readonly atualizando = signal<boolean>(false);
  readonly removendo = signal<boolean>(false);
  readonly erro = signal<string | null>(null);

  // --- Computed Signals (State Derivado) ---
  readonly categoriasDespesa = computed(() => {
    return this.categorias().filter((c) => c.tipo === 'DESPESA' || c.tipo === 'AMBAS');
  });

  readonly categoriasReceita = computed(() => {
    return this.categorias().filter((c) => c.tipo === 'RECEITA' || c.tipo === 'AMBAS');
  });

  readonly categoriasSistema = computed(() => {
    return this.categorias().filter((c) => (c as any).sistema === true);
  });

  readonly categoriasCustomizadas = computed(() => {
    return this.categorias().filter((c) => !(c as any).sistema);
  });

  constructor(private readonly api: CategoriasApiService) {}

  async carregarCategorias(): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);
    try {
      const lista = await firstValueFrom(this.api.listar());
      this.categorias.set(lista);
    } catch (err: any) {
      this.erro.set(err?.error?.message || 'Erro ao carregar categorias.');
    } finally {
      this.carregando.set(false);
    }
  }

  async criarCategoria(payload: CriarCategoriaPayload): Promise<boolean> {
    this.criando.set(true);
    this.erro.set(null);
    try {
      await firstValueFrom(this.api.criar(payload));
      await this.carregarCategorias();
      return true;
    } catch (err: any) {
      this.erro.set(err?.error?.message || 'Erro ao criar categoria.');
      return false;
    } finally {
      this.criando.set(false);
    }
  }

  async atualizarCategoria(id: string, payload: AtualizarCategoriaPayload): Promise<boolean> {
    this.atualizando.set(true);
    this.erro.set(null);
    try {
      await firstValueFrom(this.api.atualizar(id, payload));
      await this.carregarCategorias();
      return true;
    } catch (err: any) {
      this.erro.set(err?.error?.message || 'Erro ao atualizar categoria.');
      return false;
    } finally {
      this.atualizando.set(false);
    }
  }

  async removerCategoria(id: string): Promise<boolean> {
    this.removendo.set(true);
    this.erro.set(null);
    try {
      await firstValueFrom(this.api.remover(id));
      await this.carregarCategorias();
      return true;
    } catch (err: any) {
      this.erro.set(err?.error?.message || 'Erro ao remover categoria.');
      return false;
    } finally {
      this.removendo.set(false);
    }
  }
}
