import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FiltroRelatorioPeriodo, RelatoriosResult } from '../models/relatorios.models';

@Injectable({
  providedIn: 'root',
})
export class RelatoriosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/relatorios`;

  obterRelatorios(filtro?: FiltroRelatorioPeriodo): Observable<RelatoriosResult> {
    const params = this.montarParametrosFiltro(filtro);
    return this.http.get<RelatoriosResult>(this.baseUrl, { params });
  }

  exportarPdf(filtro?: FiltroRelatorioPeriodo): Observable<Blob> {
    const params = this.montarParametrosFiltro(filtro);
    return this.http.get(`${this.baseUrl}/exportar/pdf`, {
      params,
      responseType: 'blob',
    });
  }

  exportarExcel(filtro?: FiltroRelatorioPeriodo): Observable<Blob> {
    const params = this.montarParametrosFiltro(filtro);
    return this.http.get(`${this.baseUrl}/exportar/excel`, {
      params,
      responseType: 'blob',
    });
  }

  exportarCsv(filtro?: FiltroRelatorioPeriodo): Observable<Blob> {
    const params = this.montarParametrosFiltro(filtro);
    return this.http.get(`${this.baseUrl}/exportar/csv`, {
      params,
      responseType: 'blob',
    });
  }

  private montarParametrosFiltro(filtro?: FiltroRelatorioPeriodo): HttpParams {
    let params = new HttpParams();
    if (!filtro) return params;

    if (filtro.tipoPeriodo) params = params.set('tipoPeriodo', filtro.tipoPeriodo);
    if (filtro.inicio) params = params.set('inicio', filtro.inicio);
    if (filtro.fim) params = params.set('fim', filtro.fim);
    if (filtro.categoriaId) params = params.set('categoriaId', filtro.categoriaId);
    if (filtro.carteiraId) params = params.set('carteiraId', filtro.carteiraId);
    if (filtro.cartaoId) params = params.set('cartaoId', filtro.cartaoId);

    return params;
  }
}
