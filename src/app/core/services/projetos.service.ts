import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Projeto,
  ProjetoReadModel,
  EtapaProjeto,
  ItemProjeto,
  CriarProjetoDto,
  AtualizarProjetoDto,
  CriarEtapaProjetoDto,
  AtualizarEtapaProjetoDto,
  ReordenarEtapasDto,
  VincularItemDto,
} from '../models/projeto.models';

@Injectable({
  providedIn: 'root',
})
export class ProjetosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/projetos`;

  listar(): Observable<ProjetoReadModel[]> {
    return this.http.get<ProjetoReadModel[]>(this.baseUrl);
  }

  obterPorId(id: string): Observable<ProjetoReadModel> {
    return this.http.get<ProjetoReadModel>(`${this.baseUrl}/${id}`);
  }

  criar(dados: CriarProjetoDto): Observable<Projeto> {
    return this.http.post<Projeto>(this.baseUrl, dados);
  }

  atualizar(id: string, dados: AtualizarProjetoDto): Observable<Projeto> {
    return this.http.patch<Projeto>(`${this.baseUrl}/${id}`, dados);
  }

  remover(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  adicionarEtapa(projetoId: string, dados: CriarEtapaProjetoDto): Observable<EtapaProjeto> {
    return this.http.post<EtapaProjeto>(`${this.baseUrl}/${projetoId}/etapas`, dados);
  }

  atualizarEtapa(
    projetoId: string,
    etapaId: string,
    dados: AtualizarEtapaProjetoDto
  ): Observable<EtapaProjeto> {
    return this.http.patch<EtapaProjeto>(`${this.baseUrl}/${projetoId}/etapas/${etapaId}`, dados);
  }

  removerEtapa(projetoId: string, etapaId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${projetoId}/etapas/${etapaId}`);
  }

  reordenarEtapas(projetoId: string, dados: ReordenarEtapasDto): Observable<EtapaProjeto[]> {
    return this.http.patch<EtapaProjeto[]>(`${this.baseUrl}/${projetoId}/etapas/reordenar`, dados);
  }

  vincularItem(
    projetoId: string,
    etapaId: string,
    dados: VincularItemDto
  ): Observable<ItemProjeto> {
    return this.http.post<ItemProjeto>(
      `${this.baseUrl}/${projetoId}/etapas/${etapaId}/vincular`,
      dados
    );
  }

  desvincularItem(projetoId: string, etapaId: string, itemId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/${projetoId}/etapas/${etapaId}/itens/${itemId}`
    );
  }
}
