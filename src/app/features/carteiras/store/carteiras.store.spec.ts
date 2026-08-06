import { TestBed } from '@angular/core/testing';
import { CarteirasStore } from './carteiras.store';
import { CarteirasApiService } from '../../../core/services/carteiras.service';
import { StorageService } from '../../../core/platform/storage.service';
import { of } from 'rxjs';

describe('CarteirasStore', () => {
  let store: CarteirasStore;
  let mockApi: jasmine.SpyObj<CarteirasApiService>;
  let mockStorage: jasmine.SpyObj<StorageService>;

  beforeEach(() => {
    mockApi = jasmine.createSpyObj('CarteirasApiService', ['listar', 'criar', 'transferir', 'remover']);
    mockStorage = jasmine.createSpyObj('StorageService', ['getItem', 'setItem']);

    mockStorage.getItem.and.returnValue(Promise.resolve(null));
    mockStorage.setItem.and.returnValue(Promise.resolve());

    TestBed.configureTestingModule({
      providers: [
        CarteirasStore,
        { provide: CarteirasApiService, useValue: mockApi },
        { provide: StorageService, useValue: mockStorage },
      ],
    });

    store = TestBed.inject(CarteirasStore);
  });

  it('deve alternar o Olho Mágico (esconderSaldos) e persistir a preferência', async () => {
    expect(store.esconderSaldos()).toBeFalse();
    await store.toggleOlhoMagico();
    expect(store.esconderSaldos()).toBeTrue();
    expect(mockStorage.setItem).toHaveBeenCalledWith('alicerce_hide_balances', 'true');
  });

  it('deve carregar carteiras e atualizar o saldo total consolidado', async () => {
    mockApi.listar.and.returnValue(
      of({
        carteiras: [
          { id: '1', workspaceId: 'ws1', nome: 'Itaú', tipo: 'CONTA_CORRENTE', permiteSaldoNegativo: true, cor: '#000', icone: 'bank', padrao: true, ativo: true, saldoCalculado: 5000 },
          { id: '2', workspaceId: 'ws1', nome: 'Reserva', tipo: 'POUPANCA', permiteSaldoNegativo: false, cor: '#000', icone: 'savings', padrao: false, ativo: true, saldoCalculado: 10000 },
        ],
        saldoTotalConsolidado: 15000,
      })
    );

    await store.carregarCarteiras();
    expect(store.carteiras().length).toBe(2);
    expect(store.saldoTotalConsolidado()).toBe(15000);
  });
});
