import { TestBed } from '@angular/core/testing';
import { DashboardStore } from './dashboard.store';
import { DashboardService } from '../../../core/services/dashboard.service';
import { StorageService } from '../../../core/platform/storage.service';
import { of } from 'rxjs';

describe('DashboardStore', () => {
  let store: DashboardStore;
  let mockApi: jasmine.SpyObj<DashboardService>;
  let mockStorage: jasmine.SpyObj<StorageService>;

  beforeEach(() => {
    mockApi = jasmine.createSpyObj('DashboardService', ['obterDashboard']);
    mockStorage = jasmine.createSpyObj('StorageService', ['getItem', 'setItem']);

    mockStorage.getItem.and.returnValue(Promise.resolve(null));
    mockStorage.setItem.and.returnValue(Promise.resolve());

    mockApi.obterDashboard.and.returnValue(
      of({
        competencia: '2026-08',
        usuarioNome: 'Eduardo Teste',
        saldoAtual: 15000,
        saldoProjetado: 18000,
        receitasPendentes: 5000,
        despesasPendentes: 2000,
        receitasLiquidadasMes: 10000,
        despesasLiquidadasMes: 6000,
        fluxoDoPeriodo: 4000,
        faturasAbertas: [],
        orcamentos: [],
        metasPrioritarias: [],
        alertas: [
          {
            id: 'alt-spec-1',
            titulo: 'Alerta Teste',
            mensagem: 'Mensagem de teste',
            tipo: 'ORCAMENTO_EXCEDIDO',
            severidade: 'CRITICO',
          },
        ],
      })
    );

    TestBed.configureTestingModule({
      providers: [
        DashboardStore,
        { provide: DashboardService, useValue: mockApi },
        { provide: StorageService, useValue: mockStorage },
      ],
    });

    store = TestBed.inject(DashboardStore);
  });

  it('deve alternar a visibilidade de saldo (Olho Mágico) e persistir a preferência', async () => {
    expect(store.saldoVisivel()).toBeTrue();
    await store.toggleOlhoMagico();
    expect(store.saldoVisivel()).toBeFalse();
    expect(mockStorage.setItem).toHaveBeenCalledWith('alicerce_dashboard_saldo_visivel', 'false');
  });

  it('deve carregar os dados do dashboard e atualizar os computeds', async () => {
    await store.carregarDashboard('2026-08');
    expect(store.saldoAtual()).toBe(15000);
    expect(store.saldoProjetado()).toBe(18000);
    expect(store.alertasCriticosCount()).toBe(1);
  });
});
