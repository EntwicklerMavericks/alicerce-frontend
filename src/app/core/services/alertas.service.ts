import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Alerta,
  AlertasPaginadosResult,
  GerarAlertasDto,
  ListarAlertasFiltros,
} from '../models/alertas.models';

@Injectable({
  providedIn: 'root',
})
export class AlertasService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/alertas`;

  listar(filtros?: ListarAlertasFiltros): Observable<AlertasPaginadosResult> {
    let params = new HttpParams();

    if (filtros) {
      if (filtros.page !== undefined) {
        params = params.set('page', filtros.page.toString());
      }
      if (filtros.pageSize !== undefined) {
        params = params.set('pageSize', filtros.pageSize.toString());
      }
      if (filtros.apenasNaoLidos !== undefined) {
        params = params.set('apenasNaoLidos', filtros.apenasNaoLidos.toString());
      }
      if (filtros.severidade) {
        params = params.set('severidade', filtros.severidade);
      }
    }

    return this.http.get<AlertasPaginadosResult>(this.baseUrl, { params });
  }

  obterContagemNaoLidos(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.baseUrl}/nao-lidos/count`);
  }

  marcarComoLido(id: string): Observable<Alerta> {
    return this.http.patch<Alerta>(`${this.baseUrl}/${id}/ler`, {});
  }

  marcarTodosComoLidos(): Observable<{ count: number }> {
    return this.http.patch<{ count: number }>(`${this.baseUrl}/ler-todos`, {});
  }

  gerarAlertas(
    dto: GerarAlertasDto = {}
  ): Observable<{ processados: number; filtrados: number; gerados: number; alertas: Alerta[] }> {
    return this.http.post<{ processados: number; filtrados: number; gerados: number; alertas: Alerta[] }>(
      `${this.baseUrl}/gerar`,
      dto
    );
  }
}
