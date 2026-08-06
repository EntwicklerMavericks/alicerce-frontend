import { TestBed } from '@angular/core/testing';
import { PessoasStore } from './pessoas.store';
import { PessoasApiService } from '../../../core/services/pessoas.service';
import { of } from 'rxjs';

describe('PessoasStore', () => {
  let store: PessoasStore;
  let mockApi: jasmine.SpyObj<PessoasApiService>;

  beforeEach(() => {
    mockApi = jasmine.createSpyObj('PessoasApiService', ['listar', 'criar', 'remover']);

    TestBed.configureTestingModule({
      providers: [
        PessoasStore,
        { provide: PessoasApiService, useValue: mockApi },
      ],
    });

    store = TestBed.inject(PessoasStore);
  });

  it('deve calcular a renda estimada total corretamente através da Signal totalRendaPrevista', async () => {
    mockApi.listar.and.returnValue(
      of([
        { id: '1', workspaceId: 'ws1', nome: 'Eduardo', parentesco: 'Titular', ativo: true, rendaEstimadaMensal: 8500 },
        { id: '2', workspaceId: 'ws1', nome: 'Carla', parentesco: 'Cônjuge', ativo: true, rendaEstimadaMensal: 6200 },
      ])
    );

    await store.carregarPessoas();
    expect(store.pessoas().length).toBe(2);
    expect(store.totalRendaPrevista()).toBe(14700);
  });
});
