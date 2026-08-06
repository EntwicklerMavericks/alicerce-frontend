import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
    service.clearAll();
  });

  it('should show toast and add to activeToasts signal', () => {
    service.showSuccess('Receita criada com sucesso!');
    expect(service.activeToasts().length).toBe(1);
    expect(service.activeToasts()[0].message).toBe('Receita criada com sucesso!');
  });

  it('should dismiss toast by id', () => {
    const id = service.showError('Erro ao carregar saldo');
    expect(service.activeToasts().length).toBe(1);
    service.dismiss(id);
    expect(service.activeToasts().length).toBe(0);
  });
});
