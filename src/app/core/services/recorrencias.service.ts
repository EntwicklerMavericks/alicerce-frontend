import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CriarRegraRecorrenciaRequest, RegraRecorrencia } from '../models/recorrencia.models';

@Injectable({
  providedIn: 'root',
})
export class RecorrenciasService {
  private readonly baseUrl = '/api/v1/financeiro/recorrencias';

  constructor(private readonly http: HttpClient) {}

  listarRegras(): Observable<RegraRecorrencia[]> {
    return this.http.get<RegraRecorrencia[]>(this.baseUrl);
  }

  criarRegra(dto: CriarRegraRecorrenciaRequest): Observable<RegraRecorrencia> {
    return this.http.post<RegraRecorrencia>(this.baseUrl, dto);
  }

  alternarStatus(id: string, status: 'ATIVA' | 'PAUSADA' | 'CANCELADA'): Observable<RegraRecorrencia> {
    return this.http.patch<RegraRecorrencia>(`${this.baseUrl}/${id}/status`, { status });
  }

  processarCompetencia(competenciaISO?: string): Observable<any> {
    const params = competenciaISO ? { competencia: competenciaISO } : {};
    return this.http.post<any>(`${this.baseUrl}/processar-competencia`, {}, { params });
  }
}
