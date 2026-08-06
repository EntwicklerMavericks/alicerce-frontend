import { Injectable, signal, computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PessoasApiService } from '../../../core/services/pessoas.service';
import { Pessoa, CriarPessoaRequest } from '../../../core/models/pessoa.models';

@Injectable({
  providedIn: 'root',
})
export class PessoasStore {
  private readonly api = inject(PessoasApiService);

  // State Signals
  readonly pessoas = signal<Pessoa[]>([]);
  readonly carregando = signal<boolean>(false);
  readonly erro = signal<string | null>(null);
  readonly pessoaSelecionada = signal<Pessoa | null>(null);

  // Computed Selectors
  readonly totalRendaPrevista = computed(() => {
    return this.pessoas().reduce((acc, p) => acc + (p.rendaEstimadaMensal || 0), 0);
  });

  readonly qtdMembros = computed(() => this.pessoas().length);

  async carregarPessoas(): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);

    try {
      const lista = await firstValueFrom(this.api.listar());
      this.pessoas.set(lista);
    } catch (err: any) {
      this.erro.set(err?.error?.message || 'Erro ao carregar membros da família.');
    } finally {
      this.carregando.set(false);
    }
  }

  async criarPessoa(dados: CriarPessoaRequest): Promise<boolean> {
    this.carregando.set(true);
    this.erro.set(null);

    try {
      const nova = await firstValueFrom(this.api.criar(dados));
      this.pessoas.update((list) => [...list, nova]);
      return true;
    } catch (err: any) {
      this.erro.set(err?.error?.message || 'Erro ao cadastrar membro.');
      return false;
    } finally {
      this.carregando.set(false);
    }
  }

  async removerPessoa(id: string): Promise<boolean> {
    try {
      await firstValueFrom(this.api.remover(id));
      this.pessoas.update((list) => list.filter((p) => p.id !== id));
      return true;
    } catch (err: any) {
      this.erro.set('Erro ao remover membro.');
      return false;
    }
  }

  selecionarPessoa(pessoa: Pessoa | null): void {
    this.pessoaSelecionada.set(pessoa);
  }
}
