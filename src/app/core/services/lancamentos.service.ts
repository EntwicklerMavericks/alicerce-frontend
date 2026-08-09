import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Receita,
  Despesa,
  CriarReceitaRequest,
  CriarDespesaRequest,
  EstornarLancamentoRequest,
  ResumoFluxoCaixaResponse,
} from '../models/lancamento.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LancamentosApiService {
  private readonly baseUrl = `${environment.apiUrl}/financeiro`;

  constructor(private readonly http: HttpClient) {}

  listarReceitas(mes?: number, ano?: number): Observable<Receita[]> {
    let params: any = {};
    if (mes) params.mes = mes.toString();
    if (ano) params.ano = ano.toString();
    return this.http.get<Receita[]>(`${this.baseUrl}/receitas`, { params });
  }

  criarReceita(dados: CriarReceitaRequest): Observable<Receita> {
    return this.http.post<Receita>(`${this.baseUrl}/receitas`, dados);
  }

  darBaixaReceita(id: string, carteiraId?: string): Observable<Receita> {
    return this.http.patch<Receita>(`${this.baseUrl}/receitas/${id}/baixa`, { carteiraId });
  }

  estornarReceita(id: string, dto: EstornarLancamentoRequest): Observable<Receita> {
    return this.http.post<Receita>(`${this.baseUrl}/receitas/${id}/estorno`, dto);
  }

  removerReceita(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/receitas/${id}`);
  }

  listarDespesas(mes?: number, ano?: number): Observable<Despesa[]> {
    let params: any = {};
    if (mes) params.mes = mes.toString();
    if (ano) params.ano = ano.toString();
    return this.http.get<Despesa[]>(`${this.baseUrl}/despesas`, { params });
  }

  criarDespesa(dados: CriarDespesaRequest): Observable<Despesa> {
    return this.http.post<Despesa>(`${this.baseUrl}/despesas`, dados);
  }

  darBaixaDespesa(id: string, carteiraId?: string): Observable<Despesa> {
    return this.http.patch<Despesa>(`${this.baseUrl}/despesas/${id}/baixa`, { carteiraId });
  }

  estornarDespesa(id: string, dto: EstornarLancamentoRequest): Observable<Despesa> {
    return this.http.post<Despesa>(`${this.baseUrl}/despesas/${id}/estorno`, dto);
  }

  removerDespesa(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/despesas/${id}`);
  }

  obterResumoFluxoCaixa(mes?: number, ano?: number): Observable<ResumoFluxoCaixaResponse> {
    let params: any = {};
    if (mes) params.mes = mes.toString();
    if (ano) params.ano = ano.toString();
    return this.http.get<ResumoFluxoCaixaResponse>(`${this.baseUrl}/fluxo-caixa`, { params });
  }
}
