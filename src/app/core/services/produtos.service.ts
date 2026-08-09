import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Produto,
  CriarProdutoDto,
  AtualizarProdutoDto,
  LinkProduto,
  VincularLinkDto,
  AtualizarPrecoLinkDto,
  ImagemProduto,
  HistoricoPreco,
} from '../models/produto.models';

@Injectable({
  providedIn: 'root',
})
export class ProdutosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/produtos`;

  listar(categoriaId?: string, busca?: string): Observable<Produto[]> {
    let params = new HttpParams();
    if (categoriaId) {
      params = params.set('categoriaId', categoriaId);
    }
    if (busca) {
      params = params.set('q', busca);
    }
    return this.http.get<Produto[]>(this.baseUrl, { params });
  }

  obterPorId(id: string): Observable<Produto> {
    return this.http.get<Produto>(`${this.baseUrl}/${id}`);
  }

  criar(dados: CriarProdutoDto): Observable<Produto> {
    return this.http.post<Produto>(this.baseUrl, dados);
  }

  atualizar(id: string, dados: AtualizarProdutoDto): Observable<Produto> {
    return this.http.put<Produto>(`${this.baseUrl}/${id}`, dados);
  }

  remover(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Links & Ofertas
  vincularLink(produtoId: string, dados: VincularLinkDto): Observable<LinkProduto> {
    return this.http.post<LinkProduto>(`${this.baseUrl}/${produtoId}/links`, dados);
  }

  atualizarPrecoLink(
    produtoId: string,
    linkId: string,
    dados: AtualizarPrecoLinkDto
  ): Observable<LinkProduto> {
    return this.http.put<LinkProduto>(`${this.baseUrl}/${produtoId}/links/${linkId}`, dados);
  }

  removerLink(produtoId: string, linkId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${produtoId}/links/${linkId}`);
  }

  // Imagens
  adicionarImagem(
    produtoId: string,
    url: string,
    principal: boolean = false
  ): Observable<ImagemProduto> {
    return this.http.post<ImagemProduto>(`${this.baseUrl}/${produtoId}/imagens`, {
      url,
      principal,
    });
  }

  definirImagemPrincipal(produtoId: string, imagemId: string): Observable<ImagemProduto> {
    return this.http.put<ImagemProduto>(
      `${this.baseUrl}/${produtoId}/imagens/${imagemId}/principal`,
      {}
    );
  }

  removerImagem(produtoId: string, imagemId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${produtoId}/imagens/${imagemId}`);
  }

  // Histórico de Preços
  obterHistoricoPrecos(produtoId: string): Observable<HistoricoPreco[]> {
    return this.http.get<HistoricoPreco[]>(`${this.baseUrl}/${produtoId}/historico`);
  }
}
