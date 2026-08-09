import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Loja, CriarLojaDto, AtualizarLojaDto } from '../models/loja.models';

@Injectable({
  providedIn: 'root',
})
export class LojasService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/lojas`;

  listar(): Observable<Loja[]> {
    return this.http.get<Loja[]>(this.baseUrl);
  }

  obterPorId(id: string): Observable<Loja> {
    return this.http.get<Loja>(`${this.baseUrl}/${id}`);
  }

  criar(dados: CriarLojaDto): Observable<Loja> {
    return this.http.post<Loja>(this.baseUrl, dados);
  }

  atualizar(id: string, dados: AtualizarLojaDto): Observable<Loja> {
    return this.http.put<Loja>(`${this.baseUrl}/${id}`, dados);
  }

  remover(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
