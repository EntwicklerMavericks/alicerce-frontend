import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CartaoCredito,
  CriarCartaoRequest,
  CriarCompraCartaoRequest,
  FaturaCartao,
  PagarFaturaRequest,
} from '../models/cartao.models';

@Injectable({
  providedIn: 'root',
})
export class CartoesService {
  private readonly baseUrl = '/api/v1/financeiro';

  constructor(private readonly http: HttpClient) {}

  listarCartoes(): Observable<CartaoCredito[]> {
    return this.http.get<CartaoCredito[]>(`${this.baseUrl}/cartoes`);
  }

  criarCartao(dto: CriarCartaoRequest): Observable<CartaoCredito> {
    return this.http.post<CartaoCredito>(`${this.baseUrl}/cartoes`, dto);
  }

  registrarCompra(dto: CriarCompraCartaoRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/compras-cartao`, dto);
  }

  obterFaturasDoCartao(cartaoId: string): Observable<FaturaCartao[]> {
    return this.http.get<FaturaCartao[]>(`${this.baseUrl}/faturas/cartao/${cartaoId}`);
  }

  pagarFatura(faturaId: string, dto: PagarFaturaRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/faturas/${faturaId}/pagar`, dto);
  }
}
