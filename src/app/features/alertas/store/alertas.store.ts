import { Injectable, signal, computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AlertasService } from '../../../core/services/alertas.service';
import {
  Alerta,
  SeveridadeAlerta,
  TipoAlerta,
  GerarAlertasDto,
} from '../../../core/models/alertas.models';

export function getSeveridadeFromTipo(tipo: TipoAlerta): SeveridadeAlerta {
  switch (tipo) {
    case 'CONTA_VENCENDO':
    case 'ORCAMENTO_EXCEDIDO':
      return 'CRITICO';
    case 'QUEDA_PRECO':
      return 'ALTO';
    case 'META_ATINGIDA':
    case 'SALARIO_RECEBIDO':
    case 'SISTEMA':
    default:
      return 'MEDIO';
  }
}

@Injectable({
  providedIn: 'root',
})
export class AlertasStore {
  private readonly api = inject(AlertasService);

  // State Signals
  readonly alertas = signal<Alerta[]>([]);
  readonly countNaoLidos = signal<number>(0);
  readonly carregando = signal<boolean>(false);
  readonly erro = signal<string | null>(null);

  readonly page = signal<number>(1);
  readonly pageSize = signal<number>(10);
  readonly totalAlertas = signal<number>(0);
  readonly totalPages = signal<number>(1);

  readonly filtroSeveridade = signal<SeveridadeAlerta | 'TODAS'>('TODAS');
  readonly filtroStatusLeitura = signal<'TODOS' | 'NAO_LIDOS' | 'LIDOS'>('TODOS');

  // Computed Selectors
  readonly alertasFiltrados = computed(() => {
    let lista = this.alertas();
    const sev = this.filtroSeveridade();
    const status = this.filtroStatusLeitura();

    if (sev !== 'TODAS') {
      lista = lista.filter((a) => (a.severidade || getSeveridadeFromTipo(a.tipo)) === sev);
    }

    if (status === 'NAO_LIDOS') {
      lista = lista.filter((a) => !a.lido);
    } else if (status === 'LIDOS') {
      lista = lista.filter((a) => a.lido);
    }

    return lista;
  });

  readonly countCriticos = computed(() => {
    return this.alertas().filter(
      (a) => (a.severidade || getSeveridadeFromTipo(a.tipo)) === 'CRITICO' && !a.lido
    ).length;
  });

  readonly countAltos = computed(() => {
    return this.alertas().filter(
      (a) => (a.severidade || getSeveridadeFromTipo(a.tipo)) === 'ALTO' && !a.lido
    ).length;
  });

  readonly countMedios = computed(() => {
    return this.alertas().filter(
      (a) => (a.severidade || getSeveridadeFromTipo(a.tipo)) === 'MEDIO' && !a.lido
    ).length;
  });

  readonly temNaoLidos = computed(() => this.countNaoLidos() > 0);

  async carregarAlertas(pageNum = 1): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);
    this.page.set(pageNum);

    try {
      const result = await firstValueFrom(
        this.api.listar({
          page: pageNum,
          pageSize: this.pageSize(),
          apenasNaoLidos: this.filtroStatusLeitura() === 'NAO_LIDOS',
          severidade: this.filtroSeveridade() !== 'TODAS' ? (this.filtroSeveridade() as SeveridadeAlerta) : undefined,
        })
      );

      if (result && Array.isArray(result.data)) {
        const dadosComSeveridade = result.data.map((a) => ({
          ...a,
          severidade: a.severidade || getSeveridadeFromTipo(a.tipo),
        }));
        this.alertas.set(dadosComSeveridade);
        this.totalAlertas.set(result.meta.total);
        this.totalPages.set(result.meta.totalPages);
      } else {
        this.usarEstadoVazio();
      }
    } catch (err: any) {
      this.usarEstadoVazio();
    } finally {
      this.carregando.set(false);
      this.carregarContagemNaoLidos();
    }
  }

  async carregarContagemNaoLidos(): Promise<void> {
    try {
      const res = await firstValueFrom(this.api.obterContagemNaoLidos());
      if (res && typeof res.count === 'number') {
        this.countNaoLidos.set(res.count);
        return;
      }
    } catch (_) {
      // Fallback local
    }

    const localUnread = this.alertas().filter((a) => !a.lido).length;
    this.countNaoLidos.set(localUnread);
  }

  async marcarComoLido(id: string): Promise<boolean> {
    this.alertas.update((list) =>
      list.map((a) => (a.id === id ? { ...a, lido: true, dataLeitura: new Date().toISOString() } : a))
    );
    this.countNaoLidos.update((c) => Math.max(0, c - 1));

    try {
      await firstValueFrom(this.api.marcarComoLido(id));
      return true;
    } catch (_) {
      return true;
    }
  }

  async marcarTodosComoLidos(): Promise<boolean> {
    this.alertas.update((list) =>
      list.map((a) => ({ ...a, lido: true, dataLeitura: new Date().toISOString() }))
    );
    this.countNaoLidos.set(0);

    try {
      await firstValueFrom(this.api.marcarTodosComoLidos());
      return true;
    } catch (_) {
      return true;
    }
  }

  async gerarAlertas(dto: GerarAlertasDto = {}): Promise<boolean> {
    this.carregando.set(true);
    try {
      const res = await firstValueFrom(this.api.gerarAlertas(dto));
      if (res && Array.isArray(res.alertas) && res.alertas.length > 0) {
        const novos = res.alertas.map((a) => ({
          ...a,
          severidade: a.severidade || getSeveridadeFromTipo(a.tipo),
        }));
        this.alertas.update((existentes) => {
          const ids = new Set(existentes.map((e) => e.id));
          const filtradosNovos = novos.filter((n) => !ids.has(n.id));
          return [...filtradosNovos, ...existentes];
        });
      }
      await this.carregarAlertas(1);
      return true;
    } catch (_) {
      await this.carregarAlertas(1);
      return true;
    } finally {
      this.carregando.set(false);
    }
  }

  setFiltroSeveridade(sev: SeveridadeAlerta | 'TODAS'): void {
    this.filtroSeveridade.set(sev);
    this.carregarAlertas(1);
  }

  setFiltroStatusLeitura(status: 'TODOS' | 'NAO_LIDOS' | 'LIDOS'): void {
    this.filtroStatusLeitura.set(status);
    this.carregarAlertas(1);
  }

  private usarEstadoVazio(): void {
    this.alertas.set([]);
    this.totalAlertas.set(0);
    this.totalPages.set(1);
  }
}
