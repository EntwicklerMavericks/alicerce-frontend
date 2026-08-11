import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pessoa, CriarPessoaRequest } from '../models/pessoa.models';
import { environment } from '../../../environments/environment';

const API_URL = `${environment.apiUrl}/pessoas`;

@Injectable({
  providedIn: 'root',
})
export class PessoasApiService {
  private readonly http = inject(HttpClient);

  listar(): Observable<Pessoa[]> {
    return this.http.get<Pessoa[]>(API_URL);
  }

  obterPorId(id: string): Observable<Pessoa> {
    return this.http.get<Pessoa>(`${API_URL}/${id}`);
  }

  criar(dados: CriarPessoaRequest): Observable<Pessoa> {
    return this.http.post<Pessoa>(API_URL, dados);
  }

  atualizarSalario(id: string, configSalario: CriarPessoaRequest['configSalario']): Observable<Pessoa> {
    return this.http.patch<Pessoa>(`${API_URL}/${id}/salario`, { configSalario });
  }

  remover(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`);
  }
}
