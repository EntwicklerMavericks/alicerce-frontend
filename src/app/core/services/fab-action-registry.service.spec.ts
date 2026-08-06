import { TestBed } from '@angular/core/testing';
import { FabActionRegistryService, FabAction } from './fab-action-registry.service';

describe('FabActionRegistryService', () => {
  let service: FabActionRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FabActionRegistryService);
    service.clearActions();
  });

  it('should register actions and order them by priority descending', () => {
    const actionLow: FabAction = {
      id: 'low',
      label: 'Baixa Prioridade',
      icon: 'star',
      color: '#fff',
      priority: 1,
      execute: () => {},
    };

    const actionHigh: FabAction = {
      id: 'high',
      label: 'Alta Prioridade',
      icon: 'bolt',
      color: '#000',
      priority: 10,
      execute: () => {},
    };

    service.registerAction(actionLow);
    service.registerAction(actionHigh);

    const result = service.registeredActions();
    expect(result.length).toBe(2);
    expect(result[0].id).toBe('high');
    expect(result[1].id).toBe('low');
  });

  it('should filter out actions where visible() returns false', () => {
    const actionVisible: FabAction = {
      id: 'vis',
      label: 'Visível',
      icon: 'eye',
      color: '#fff',
      priority: 5,
      visible: () => true,
      execute: () => {},
    };

    const actionHidden: FabAction = {
      id: 'hid',
      label: 'Oculto',
      icon: 'eye_off',
      color: '#fff',
      priority: 5,
      visible: () => false,
      execute: () => {},
    };

    service.registerAction(actionVisible);
    service.registerAction(actionHidden);

    const result = service.registeredActions();
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('vis');
  });
});
