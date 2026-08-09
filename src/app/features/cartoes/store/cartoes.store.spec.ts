import { TestBed } from '@angular/core/testing';
import { CartoesStore } from './cartoes.store';
import { CartoesService } from '../../../core/services/cartoes.service';
import { of } from 'rxjs';

describe('CartoesStore', () => {
  let store: CartoesStore;
  let cartoesServiceSpy: jasmine.SpyObj<CartoesService>;

  const mockCartoes = [
    {
      id: 'cartao-1',
      workspaceId: 'ws-1',
      nome: 'Nubank UV',
      bandeira: 'MASTERCARD' as any,
      limiteTotal: 10000,
      limiteComprometido: 3000,
      limiteDisponivel: 7000,
      diaFechamento: 25,
      diaVencimento: 5,
      ativo: true,
    },
  ];

  beforeEach(() => {
    const spy = jasmine.createSpyObj('CartoesService', ['listarCartoes', 'obterFaturasDoCartao', 'criarCartao']);

    TestBed.configureTestingModule({
      providers: [CartoesStore, { provide: CartoesService, useValue: spy }],
    });

    store = TestBed.inject(CartoesStore);
    cartoesServiceSpy = TestBed.inject(CartoesService) as jasmine.SpyObj<CartoesService>;
  });

  it('deve ser criado com sucesso', () => {
    expect(store).toBeTruthy();
  });

  it('deve carregar os cartões e calcular o limite disponível projetado corretamente', async () => {
    cartoesServiceSpy.listarCartoes.and.returnValue(of(mockCartoes));
    cartoesServiceSpy.obterFaturasDoCartao.and.returnValue(of([]));

    await store.carregarCartoes();

    expect(store.cartoes().length).toBe(1);
    expect(store.limiteTotalGeral()).toBe(10000);
    expect(store.limiteComprometidoGeral()).toBe(3000);
    expect(store.limiteDisponivelGeral()).toBe(7000);
  });
});
