import { Injectable, signal, computed } from '@angular/core';

export interface FabAction {
  id: string;
  label: string;
  icon: string;
  color: string;
  priority: number;
  visible?: () => boolean;
  execute: () => void;
}

@Injectable({
  providedIn: 'root',
})
export class FabActionRegistryService {
  private readonly actionsSignal = signal<FabAction[]>([]);

  readonly registeredActions = computed(() => {
    return this.actionsSignal()
      .filter((action) => (action.visible ? action.visible() : true))
      .sort((a, b) => b.priority - a.priority);
  });

  registerAction(action: FabAction): void {
    this.unregisterAction(action.id);
    this.actionsSignal.update((list) => [...list, action]);
  }

  unregisterAction(id: string): void {
    this.actionsSignal.update((list) => list.filter((a) => a.id !== id));
  }

  clearActions(): void {
    this.actionsSignal.set([]);
  }
}
