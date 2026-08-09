import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Orcamento, CriarOrcamentoDto, ResumoOrcamento } from '../models/orcamento.models';

@Injectable({
  providedIn: 'root',
})
export class OrcamentosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/orcamentos`;

  buscarPorCompetencia(mesAno?: string): Observable<ResumoOrcamento> {
    let params = new HttpParams();
    if (mesAno) {
      params = params.set('mesAno', mesAno);
    }
    return this.http.get<ResumoOrcamento>(this.baseUrl, { params });
  }

  criar(dados: CriarOrcamentoDto): Observable<Orcamento> {
    return this.http.post<Orcamento>(this.baseUrl, dados);
  }

  remover(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
