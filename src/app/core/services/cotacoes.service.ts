import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CotacaoAvulsa,
  ComparadorCotacoes,
  RegistrarCotacaoAvulsaDto,
} from '../models/cotacao.models';

@Injectable({
  providedIn: 'root',
})
export class CotacoesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/cotacoes`;

  registrarCotacaoAvulsa(dto: RegistrarCotacaoAvulsaDto): Observable<CotacaoAvulsa> {
    return this.http.post<CotacaoAvulsa>(`${this.baseUrl}/avulsa`, dto);
  }

  obterComparador(itemWishlistId: string): Observable<ComparadorCotacoes> {
    return this.http.get<ComparadorCotacoes>(`${this.baseUrl}/item/${itemWishlistId}/comparador`);
  }

  removerCotacaoAvulsa(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/avulsa/${id}`);
  }

  buscarCotacoesSobDemanda(itemWishlistId: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/item/${itemWishlistId}/buscar-automatico`, {});
  }
}
