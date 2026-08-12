import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Categoria } from '../models/lancamento.models';

export interface CriarCategoriaPayload {
  nome: string;
  tipo: 'RECEITA' | 'DESPESA' | 'AMBAS';
  icone?: string;
  cor?: string;
}

export interface AtualizarCategoriaPayload {
  nome?: string;
  tipo?: 'RECEITA' | 'DESPESA' | 'AMBAS';
  icone?: string;
  cor?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CategoriasApiService {
  private readonly baseUrl = `${environment.apiUrl}/financeiro/categorias`;

  constructor(private readonly http: HttpClient) {}

  listar(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.baseUrl);
  }

  criar(payload: CriarCategoriaPayload): Observable<Categoria> {
    return this.http.post<Categoria>(this.baseUrl, payload);
  }

  atualizar(id: string, payload: AtualizarCategoriaPayload): Observable<Categoria> {
    return this.http.patch<Categoria>(`${this.baseUrl}/${id}`, payload);
  }

  remover(id: string): Observable<Categoria> {
    return this.http.delete<Categoria>(`${this.baseUrl}/${id}`);
  }
}
