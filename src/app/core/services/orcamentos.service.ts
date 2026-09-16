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

  buscarPorCompetencia(mesAno?: string): Observable<any[]> {
    let params = new HttpParams();
    if (mesAno && mesAno.includes('-')) {
      const parts = mesAno.split('-');
      const ano = parseInt(parts[0], 10);
      const mes = parseInt(parts[1], 10);
      params = params.set('ano', ano.toString()).set('mes', mes.toString());
    } else {
      const agora = new Date();
      params = params
        .set('ano', agora.getFullYear().toString())
        .set('mes', (agora.getMonth() + 1).toString());
    }
    return this.http.get<any[]>(this.baseUrl, { params });
  }

  criar(dados: CriarOrcamentoDto): Observable<any> {
    const payload = {
      categoriaId: dados.categoriaId,
      mes: Number(dados.mes),
      ano: Number(dados.ano),
      teto: Number(dados.teto ?? dados.valorTeto ?? 0),
    };
    return this.http.post<any>(this.baseUrl, payload);
  }

  remover(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
