import { Injectable, signal, computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CarteirasApiService } from '../../../core/services/carteiras.service';
import { StorageService } from '../../../core/platform/storage.service';
import {
  Carteira,
  ExtratoCarteiraResponse,
  CriarCarteiraRequest,
  TransferirFundosRequest,
} from '../../../core/models/carteira.models';

const STORAGE_KEY_HIDE_BALANCES = 'alicerce_hide_balances';

@Injectable({
  providedIn: 'root',
})
export class CarteirasStore {
  private readonly api = inject(CarteirasApiService);
  private readonly storage = inject(StorageService);

  // State Signals
  readonly carteiras = signal<Carteira[]>([]);
  readonly saldoTotalConsolidado = signal<number>(0);
  readonly carregando = signal<boolean>(false);
  readonly erro = signal<string | null>(null);
  readonly esconderSaldos = signal<boolean>(false);
  readonly carteiraSelecionada = signal<Carteira | null>(null);
  readonly extratoAtual = signal<ExtratoCarteiraResponse | null>(null);

  constructor() {
    this.inicializarPreferencias();
  }

  private async inicializarPreferencias(): Promise<void> {
    const val = await this.storage.getItem(STORAGE_KEY_HIDE_BALANCES);
    if (val === 'true') {
      this.esconderSaldos.set(true);
    }
  }

  async toggleOlhoMagico(): Promise<void> {
    const novoValor = !this.esconderSaldos();
    this.esconderSaldos.set(novoValor);
    await this.storage.setItem(STORAGE_KEY_HIDE_BALANCES, String(novoValor));
  }

  async carregarCarteiras(): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);

    try {
      const res = await firstValueFrom(this.api.listar());
      this.carteiras.set(res.carteiras);
      this.saldoTotalConsolidado.set(res.saldoTotalConsolidado);
    } catch (err: any) {
      this.erro.set(err?.error?.message || 'Erro ao carregar carteiras.');
    } finally {
      this.carregando.set(false);
    }
  }

  async criarCarteira(dados: CriarCarteiraRequest): Promise<boolean> {
    this.carregando.set(true);
    this.erro.set(null);

    try {
      await firstValueFrom(this.api.criar(dados));
      await this.carregarCarteiras();
      return true;
    } catch (err: any) {
      this.erro.set(err?.error?.message || 'Erro ao criar conta.');
      return false;
    } finally {
      this.carregando.set(false);
    }
  }

  async transferir(dados: TransferirFundosRequest): Promise<{ sucesso: boolean; avisoSaldoNegativo?: boolean }> {
    this.carregando.set(true);
    this.erro.set(null);

    try {
      const res = await firstValueFrom(this.api.transferir(dados));
      await this.carregarCarteiras();
      return {
        sucesso: true,
        avisoSaldoNegativo: res.saldoNegativoAviso,
      };
    } catch (err: any) {
      this.erro.set(err?.error?.message || 'Erro ao realizar transferência.');
      return { sucesso: false };
    } finally {
      this.carregando.set(false);
    }
  }

  async carregarExtrato(carteiraId: string): Promise<void> {
    try {
      const res = await firstValueFrom(this.api.obterExtrato(carteiraId));
      this.extratoAtual.set(res);
    } catch (err: any) {
      this.erro.set('Erro ao carregar extrato da conta.');
    }
  }

  async removerCarteira(id: string): Promise<boolean> {
    try {
      await firstValueFrom(this.api.remover(id));
      await this.carregarCarteiras();
      return true;
    } catch (err: any) {
      this.erro.set('Erro ao remover carteira.');
      return false;
    }
  }
}
