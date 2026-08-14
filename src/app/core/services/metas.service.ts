import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Meta, CriarMetaDto, CriarAporteDto, AporteMeta } from '../models/meta.models';

@Injectable({
  providedIn: 'root',
})
export class MetasService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/metas`;

  listar(): Observable<Meta[]> {
    return this.http.get<Meta[]>(this.baseUrl);
  }

  obterPorId(id: string): Observable<Meta> {
    return this.http.get<Meta>(`${this.baseUrl}/${id}`);
  }

  criar(dados: CriarMetaDto): Observable<Meta> {
    return this.http.post<Meta>(this.baseUrl, dados);
  }

  atualizar(id: string, dados: Partial<CriarMetaDto>): Observable<Meta> {
    return this.http.put<Meta>(`${this.baseUrl}/${id}`, dados);
  }

  remover(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  aportar(id: string, dados: CriarAporteDto): Observable<{ meta: Meta; aporte: AporteMeta }> {
    const payload: any = {
      valor: Number(dados.valor),
    };
    if (dados.data) {
      payload.data = dados.data;
    }
    const textoDesc = (dados.descricao || dados.observacao || '').trim();
    if (textoDesc) {
      payload.descricao = textoDesc;
    }
    return this.http.post<{ meta: Meta; aporte: AporteMeta }>(`${this.baseUrl}/${id}/aportes`, payload);
  }

  removerAporte(id: string, aporteId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/aportes/${aporteId}`);
  }
}
