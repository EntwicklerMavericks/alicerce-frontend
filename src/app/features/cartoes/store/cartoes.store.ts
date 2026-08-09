import { Injectable, computed, signal } from '@angular/core';
import { CartaoCredito, CriarCartaoRequest, CriarCompraCartaoRequest, FaturaCartao, PagarFaturaRequest } from '../../../core/models/cartao.models';
import { CartoesService } from '../../../core/services/cartoes.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartoesStore {
  readonly cartoes = signal<CartaoCredito[]>([]);
  readonly cartaoSelecionado = signal<CartaoCredito | null>(null);
  readonly faturasDoCartao = signal<FaturaCartao[]>([]);
  readonly carregando = signal<boolean>(false);

  readonly limiteTotalGeral = computed(() =>
    this.cartoes().reduce((acc, c) => acc + c.limiteTotal, 0),
  );

  readonly limiteComprometidoGeral = computed(() =>
    this.cartoes().reduce((acc, c) => acc + c.limiteComprometido, 0),
  );

  readonly limiteDisponivelGeral = computed(() =>
    this.cartoes().reduce((acc, c) => acc + c.limiteDisponivel, 0),
  );

  constructor(private readonly cartoesService: CartoesService) {}

  async carregarCartoes(): Promise<void> {
    this.carregando.set(true);
    try {
      const lista = await firstValueFrom(this.cartoesService.listarCartoes());
      this.cartoes.set(lista);
      if (lista.length > 0 && !this.cartaoSelecionado()) {
        this.selecionarCartao(lista[0]);
      }
    } finally {
      this.carregando.set(false);
    }
  }

  async selecionarCartao(cartao: CartaoCredito): Promise<void> {
    this.cartaoSelecionado.set(cartao);
    const faturas = await firstValueFrom(this.cartoesService.obterFaturasDoCartao(cartao.id));
    this.faturasDoCartao.set(faturas);
  }

  async criarCartao(dto: CriarCartaoRequest): Promise<boolean> {
    try {
      await firstValueFrom(this.cartoesService.criarCartao(dto));
      await this.carregarCartoes();
      return true;
    } catch {
      return false;
    }
  }

  async registrarCompra(dto: CriarCompraCartaoRequest): Promise<boolean> {
    try {
      await firstValueFrom(this.cartoesService.registrarCompra(dto));
      await this.carregarCartoes();
      if (this.cartaoSelecionado()) {
        await this.selecionarCartao(this.cartaoSelecionado()!);
      }
      return true;
    } catch {
      return false;
    }
  }

  async pagarFatura(faturaId: string, dto: PagarFaturaRequest): Promise<boolean> {
    try {
      await firstValueFrom(this.cartoesService.pagarFatura(faturaId, dto));
      await this.carregarCartoes();
      if (this.cartaoSelecionado()) {
        await this.selecionarCartao(this.cartaoSelecionado()!);
      }
      return true;
    } catch {
      return false;
    }
  }
}
