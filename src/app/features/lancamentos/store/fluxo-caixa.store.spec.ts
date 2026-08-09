import { TestBed } from '@angular/core/testing';
import { FluxoCaixaStore } from './fluxo-caixa.store';
import { LancamentosApiService } from '../../../core/services/lancamentos.service';
import { of } from 'rxjs';

describe('FluxoCaixaStore', () => {
  let store: FluxoCaixaStore;
  let mockApi: jasmine.SpyObj<LancamentosApiService>;

  beforeEach(() => {
    mockApi = jasmine.createSpyObj('LancamentosApiService', [
      'listarReceitas',
      'listarDespesas',
      'obterResumoFluxoCaixa',
      'criarReceita',
      'darBaixaReceita',
      'criarDespesa',
      'darBaixaDespesa',
    ]);

    mockApi.listarReceitas.and.returnValue(
      of([
        {
          id: 'rec-1',
          workspaceId: 'ws-1',
          categoriaId: 'cat-1',
          descricao: 'Salário',
          valor: 5000,
          data: '2026-08-01',
          statusDocumento: 'ATIVO',
          statusLiquidacao: 'LIQUIDADO',
          recorrente: false,
        },
        {
          id: 'rec-2',
          workspaceId: 'ws-1',
          categoriaId: 'cat-1',
          descricao: 'Freelance',
          valor: 2000,
          data: '2026-08-15',
          statusDocumento: 'ATIVO',
          statusLiquidacao: 'PENDENTE',
          recorrente: false,
        },
      ]),
    );

    mockApi.listarDespesas.and.returnValue(
      of([
        {
          id: 'desp-1',
          workspaceId: 'ws-1',
          categoriaId: 'cat-2',
          descricao: 'Aluguel',
          valor: 1500,
          dataVencimento: '2026-08-10',
          statusDocumento: 'ATIVO',
          statusLiquidacao: 'LIQUIDADO',
          recorrente: false,
        },
        {
          id: 'desp-2',
          workspaceId: 'ws-1',
          categoriaId: 'cat-2',
          descricao: 'Mercado',
          valor: 500,
          dataVencimento: '2026-08-20',
          statusDocumento: 'ATIVO',
          statusLiquidacao: 'PENDENTE',
          recorrente: false,
        },
      ]),
    );

    mockApi.obterResumoFluxoCaixa.and.returnValue(
      of({
        mes: 8,
        ano: 2026,
        saldoAtualLedger: 3500, // 5000 - 1500
        totalReceitasLiquidadas: 5000,
        totalReceitasPendentes: 2000,
        totalDespesasLiquidadas: 1500,
        totalDespesasPendentes: 500,
        saldoProjetado: 5000, // 3500 + 2000 - 500
        fluxoDoPeriodo: 3500, // 5000 - 1500
      }),
    );

    TestBed.configureTestingModule({
      providers: [
        FluxoCaixaStore,
        { provide: LancamentosApiService, useValue: mockApi },
      ],
    });

    store = TestBed.inject(FluxoCaixaStore);
  });

  it('deve carregar dados e calcular os 3 conceitos de saldo via Computed Signals', async () => {
    await store.carregarDados(8, 2026);

    expect(store.totalReceitasLiquidadas()).toBe(5000);
    expect(store.totalReceitasPendentes()).toBe(2000);
    expect(store.totalDespesasLiquidadas()).toBe(1500);
    expect(store.totalDespesasPendentes()).toBe(500);

    // 1. Saldo Atual no Ledger
    expect(store.saldoAtual()).toBe(3500);
    // 2. Saldo Projetado (3500 + 2000 - 500)
    expect(store.saldoProjetado()).toBe(5000);
    // 3. Fluxo do Período (5000 - 1500)
    expect(store.fluxoDoPeriodo()).toBe(3500);
  });
});
