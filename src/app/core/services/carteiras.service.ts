import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Carteira,
  ListarCarteirasResponse,
  ExtratoCarteiraResponse,
  CriarCarteiraRequest,
  TransferirFundosRequest,
  TransferenciaResponse,
} from '../models/carteira.models';

const API_URL = 'http://localhost:3000/api/v1/carteiras';

@Injectable({
  providedIn: 'root',
})
export class CarteirasApiService {
  private readonly http = inject(HttpClient);

  listar(): Observable<ListarCarteirasResponse> {
    return this.http.get<ListarCarteirasResponse>(API_URL);
  }

  obterPorId(id: string): Observable<Carteira> {
    return this.http.get<Carteira>(`${API_URL}/${id}`);
  }

  obterExtrato(id: string): Observable<ExtratoCarteiraResponse> {
    return this.http.get<ExtratoCarteiraResponse>(`${API_URL}/${id}/extrato`);
  }

  criar(dados: CriarCarteiraRequest): Observable<Carteira> {
    return this.http.post<Carteira>(API_URL, dados);
  }

  transferir(dados: TransferirFundosRequest): Observable<TransferenciaResponse> {
    return this.http.post<TransferenciaResponse>(`${API_URL}/transferir`, dados);
  }

  remover(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`);
  }
}
