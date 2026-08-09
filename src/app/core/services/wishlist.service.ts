import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ItemWishlist,
  CriarItemWishlistDto,
  AtualizarItemWishlistDto,
  ConcluirCompraWishlistDto,
  DesistirWishlistDto,
  WishlistAnalytics,
  PrioridadeWishlist,
  StatusWishlist,
} from '../models/wishlist.models';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/wishlist`;

  listar(status?: StatusWishlist, prioridade?: PrioridadeWishlist, busca?: string): Observable<ItemWishlist[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (prioridade) params = params.set('prioridade', prioridade);
    if (busca) params = params.set('q', busca);
    return this.http.get<ItemWishlist[]>(this.baseUrl, { params });
  }

  obterPorId(id: string): Observable<ItemWishlist> {
    return this.http.get<ItemWishlist>(`${this.baseUrl}/${id}`);
  }

  criar(dados: CriarItemWishlistDto): Observable<ItemWishlist> {
    return this.http.post<ItemWishlist>(this.baseUrl, dados);
  }

  atualizar(id: string, dados: AtualizarItemWishlistDto): Observable<ItemWishlist> {
    return this.http.put<ItemWishlist>(`${this.baseUrl}/${id}`, dados);
  }

  remover(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  comprar(id: string, dados: ConcluirCompraWishlistDto): Observable<ItemWishlist> {
    return this.http.post<ItemWishlist>(`${this.baseUrl}/${id}/comprar`, dados);
  }

  desistir(id: string, dados: DesistirWishlistDto): Observable<ItemWishlist> {
    return this.http.post<ItemWishlist>(`${this.baseUrl}/${id}/desistir`, dados);
  }

  obterAnalytics(): Observable<WishlistAnalytics> {
    return this.http.get<WishlistAnalytics>(`${this.baseUrl}/analytics`);
  }
}
