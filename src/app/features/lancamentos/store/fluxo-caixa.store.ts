import { Injectable, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { LancamentosApiService } from '../../../core/services/lancamentos.service';
import {
  Receita,
  Despesa,
  CriarReceitaRequest,
  CriarDespesaRequest,
  EstornarLancamentoRequest,
  ResumoFluxoCaixaResponse,
  StatusLiquidacao,
} from '../../../core/models/lancamento.models';

export type FiltroStatusLancamento = 'TODOS' | 'LIQUIDADOS' | 'PENDENTES';

@Injectable({
  providedIn: 'root',
})
export class FluxoCaixaStore {
  readonly receitas = signal<Receita[]>([]);
  readonly despesas = signal<Despesa[]>([]);
  readonly resumo = signal<ResumoFluxoCaixaResponse | null>(null);
  readonly carregando = signal<boolean>(false);
  readonly erro = signal<string | null>(null);
  readonly filtroStatus = signal<FiltroStatusLancamento>('TODOS');
  readonly mesAtual = signal<number>(new Date().getMonth() + 1);
  readonly anoAtual = signal<number>(new Date().getFullYear());

  // --- Pure Computed Signals (State Derivado) ---
  readonly totalReceitasLiquidadas = computed(() => {
    return this.receitas()
      .filter((r) => r.statusLiquidacao === 'LIQUIDADO')
      .reduce((acc, r) => acc + Number(r.valor), 0);
  });

  readonly totalReceitasPendentes = computed(() => {
    return this.receitas()
      .filter((r) => r.statusLiquidacao === 'PENDENTE')
      .reduce((acc, r) => acc + Number(r.valor), 0);
  });

  readonly totalDespesasLiquidadas = computed(() => {
    return this.despesas()
      .filter((d) => d.statusLiquidacao === 'LIQUIDADO')
      .reduce((acc, d) => acc + Number(d.valor), 0);
  });

  readonly totalDespesasPendentes = computed(() => {
    return this.despesas()
      .filter((d) => d.statusLiquidacao === 'PENDENTE')
      .reduce((acc, d) => acc + Number(d.valor), 0);
  });

  // 1. Saldo Atual baseado no Financial Ledger
  readonly saldoAtual = computed(() => {
    return this.resumo()?.saldoAtualLedger || 0;
  });

  // 2. Saldo Projetado (Futuro Previsto) = Saldo Atual + Receitas Pendentes - Despesas Pendentes
  readonly saldoProjetado = computed(() => {
    return this.saldoAtual() + this.totalReceitasPendentes() - this.totalDespesasPendentes();
  });

  // 3. Fluxo do Período (Resultado Operacional) = Receitas Liquidadas no Mês - Despesas Liquidadas no Mês
  readonly fluxoDoPeriodo = computed(() => {
    return this.totalReceitasLiquidadas() - this.totalDespesasLiquidadas();
  });

  constructor(private readonly api: LancamentosApiService) {}

  async carregarDados(mes?: number, ano?: number): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);

    const m = mes || this.mesAtual();
    const a = ano || this.anoAtual();
    this.mesAtual.set(m);
    this.anoAtual.set(a);

    try {
      const [recs, desps, res] = await Promise.all([
        firstValueFrom(this.api.listarReceitas(m, a)),
        firstValueFrom(this.api.listarDespesas(m, a)),
        firstValueFrom(this.api.obterResumoFluxoCaixa(m, a)),
      ]);

      this.receitas.set(recs);
      this.despesas.set(desps);
      this.resumo.set(res);
    } catch (err: any) {
      this.erro.set(err?.error?.message || 'Erro ao carregar lançamentos do mês.');
    } finally {
      this.carregando.set(false);
    }
  }

  async criarReceita(dados: CriarReceitaRequest): Promise<boolean> {
    this.carregando.set(true);
    try {
      await firstValueFrom(this.api.criarReceita(dados));
      await this.carregarDados();
      return true;
    } catch (err: any) {
      this.erro.set(err?.error?.message || 'Erro ao criar receita.');
      return false;
    } finally {
      this.carregando.set(false);
    }
  }

  async darBaixaReceita(id: string, carteiraId?: string): Promise<boolean> {
    try {
      await firstValueFrom(this.api.darBaixaReceita(id, carteiraId));
      await this.carregarDados();
      return true;
    } catch (err: any) {
      this.erro.set(err?.error?.message || 'Erro ao dar baixa em receita.');
      return false;
    }
  }

  async estornarReceita(id: string, dto: EstornarLancamentoRequest): Promise<boolean> {
    try {
      await firstValueFrom(this.api.estornarReceita(id, dto));
      await this.carregarDados();
      return true;
    } catch (err: any) {
      this.erro.set(err?.error?.message || 'Erro ao estornar receita.');
      return false;
    }
  }

  async criarDespesa(dados: CriarDespesaRequest): Promise<boolean> {
    this.carregando.set(true);
    try {
      await firstValueFrom(this.api.criarDespesa(dados));
      await this.carregarDados();
      return true;
    } catch (err: any) {
      this.erro.set(err?.error?.message || 'Erro ao criar despesa.');
      return false;
    } finally {
      this.carregando.set(false);
    }
  }

  async darBaixaDespesa(id: string, carteiraId?: string): Promise<boolean> {
    try {
      await firstValueFrom(this.api.darBaixaDespesa(id, carteiraId));
      await this.carregarDados();
      return true;
    } catch (err: any) {
      this.erro.set(err?.error?.message || 'Erro ao dar baixa em despesa.');
      return false;
    }
  }

  async estornarDespesa(id: string, dto: EstornarLancamentoRequest): Promise<boolean> {
    try {
      await firstValueFrom(this.api.estornarDespesa(id, dto));
      await this.carregarDados();
      return true;
    } catch (err: any) {
      this.erro.set(err?.error?.message || 'Erro ao estornar despesa.');
      return false;
    }
  }
}
