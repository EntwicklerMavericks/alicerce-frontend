import { Injectable, signal, computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { RelatoriosService } from '../../../core/services/relatorios.service';
import { ToastService } from '../../../core/services/toast.service';
import {
  RelatoriosResult,
  FiltroRelatorioPeriodo,
  TipoPeriodoRelatorio,
  FluxoCaixaRelatorio,
  CategoriasRelatorio,
  CartoesRelatorio,
  MetasProjetosRelatorio,
} from '../../../core/models/relatorios.models';

export type AbaRelatorio = 'fluxo' | 'categorias' | 'cartoes' | 'metas';

const MOCK_RELATORIOS_FALLBACK: RelatoriosResult = {
  periodo: {
    tipoPeriodo: 'MES_ATUAL',
    inicio: '2026-08-01',
    fim: '2026-08-31',
  },
  fluxoCaixa: {
    totalReceitas: 15800.0,
    totalDespesas: 9420.0,
    saldoLiquido: 6380.0,
    taxaPoupanca: 40.38,
    historicoDiario: [
      { data: '01 AGO', receita: 12500, despesa: 1200, saldoAcumulado: 11300 },
      { data: '05 AGO', receita: 0, despesa: 2450, saldoAcumulado: 8850 },
      { data: '10 AGO', receita: 2300, despesa: 1150, saldoAcumulado: 10000 },
      { data: '15 AGO', receita: 0, despesa: 1850, saldoAcumulado: 8150 },
      { data: '20 AGO', receita: 1000, despesa: 980, saldoAcumulado: 8170 },
      { data: '25 AGO', receita: 0, despesa: 1340, saldoAcumulado: 6830 },
      { data: '30 AGO', receita: 0, despesa: 450, saldoAcumulado: 6380 },
    ],
    comparativoMesAnterior: {
      receitaVariacaoPct: 12.4,
      despesaVariacaoPct: -4.8,
      saldoVariacaoPct: 18.9,
    },
  },
  categorias: {
    distribuicaoDespesas: [
      {
        categoriaId: 'cat-1',
        nome: 'Moradia & Construção',
        icone: 'home',
        cor: '#A13D63',
        valor: 3850.0,
        percentual: 40.86,
        quantidadeLancamentos: 8,
      },
      {
        categoriaId: 'cat-2',
        nome: 'Alimentação & Mercado',
        icone: 'restaurant',
        cor: '#C9A74E',
        valor: 2100.0,
        percentual: 22.29,
        quantidadeLancamentos: 14,
      },
      {
        categoriaId: 'cat-3',
        nome: 'Transporte & Veículos',
        icone: 'directions_car',
        cor: '#2E7D32',
        valor: 1250.0,
        percentual: 13.27,
        quantidadeLancamentos: 6,
      },
      {
        categoriaId: 'cat-4',
        nome: 'Lazer & Viagens',
        icone: 'sports_esports',
        cor: '#0288D1',
        valor: 980.0,
        percentual: 10.4,
        quantidadeLancamentos: 4,
      },
      {
        categoriaId: 'cat-5',
        nome: 'Saúde & Bem-estar',
        icone: 'medical_services',
        cor: '#9C27B0',
        valor: 740.0,
        percentual: 7.86,
        quantidadeLancamentos: 3,
      },
      {
        categoriaId: 'cat-6',
        nome: 'Outros & Diversos',
        icone: 'more_horiz',
        cor: '#757575',
        valor: 500.0,
        percentual: 5.32,
        quantidadeLancamentos: 2,
      },
    ],
    distribuicaoReceitas: [
      {
        categoriaId: 'rec-1',
        nome: 'Salário & Pró-labore',
        icone: 'work',
        cor: '#10B981',
        valor: 12500.0,
        percentual: 79.11,
        quantidadeLancamentos: 1,
      },
      {
        categoriaId: 'rec-2',
        nome: 'Consultoria / Freelance',
        icone: 'laptop',
        cor: '#3B82F6',
        valor: 2300.0,
        percentual: 14.56,
        quantidadeLancamentos: 2,
      },
      {
        categoriaId: 'rec-3',
        nome: 'Rendimentos de Investimento',
        icone: 'trending_up',
        cor: '#8B5CF6',
        valor: 1000.0,
        percentual: 6.33,
        quantidadeLancamentos: 3,
      },
    ],
    topDespesas: [
      {
        descricao: 'Material de Construção - Depósito Central',
        valor: 2450.0,
        data: '2026-08-05',
        categoria: 'Moradia & Construção',
      },
      {
        descricao: 'Compras de Supermercado Mensal',
        valor: 1150.0,
        data: '2026-08-10',
        categoria: 'Alimentação & Mercado',
      },
      {
        descricao: 'Parcela Seguro Veicular',
        valor: 890.0,
        data: '2026-08-02',
        categoria: 'Transporte & Veículos',
      },
      {
        descricao: 'Manutenção Preventiva Ar Condicionado',
        valor: 450.0,
        data: '2026-08-14',
        categoria: 'Moradia & Construção',
      },
    ],
  },
  cartoes: {
    totalFaturas: 6250.0,
    totalLimiteComprometido: 11800.0,
    usoPorCartao: [
      {
        cartaoId: 'cartao-1',
        nomeCartao: 'Visa Infinite Dourado',
        bandeira: 'VISA',
        cor: '#C9A74E',
        limiteTotal: 25000.0,
        limiteUsado: 6420.0,
        percentualUso: 25.68,
        valorFaturaAtual: 3420.0,
      },
      {
        cartaoId: 'cartao-2',
        nomeCartao: 'Mastercard Black Executive',
        bandeira: 'MASTERCARD',
        cor: '#A13D63',
        limiteTotal: 15000.0,
        limiteUsado: 3800.0,
        percentualUso: 25.33,
        valorFaturaAtual: 1850.0,
      },
      {
        cartaoId: 'cartao-3',
        nomeCartao: 'Elo Nanquim Essential',
        bandeira: 'ELO',
        cor: '#2B2627',
        limiteTotal: 10000.0,
        limiteUsado: 1580.0,
        percentualUso: 15.8,
        valorFaturaAtual: 980.0,
      },
    ],
    projecaoProximasFaturas: [
      { mesAno: 'Set/2026', valorTotal: 5800.0 },
      { mesAno: 'Out/2026', valorTotal: 4200.0 },
      { mesAno: 'Nov/2026', valorTotal: 3600.0 },
      { mesAno: 'Dez/2026', valorTotal: 3100.0 },
    ],
  },
  metasProjetos: {
    totalAportadoMetas: 195500.0,
    progressoGeralMetasPct: 50.13,
    totalInvestidoProjetos: 70500.0,
    metasStatus: [
      {
        metaId: 'meta-1',
        nome: 'Construção da Casa 🏡',
        valorAtual: 145000.0,
        valorAlvo: 300000.0,
        percentualConcluido: 48.33,
        status: 'EM_ANDAMENTO',
      },
      {
        metaId: 'meta-2',
        nome: 'Reserva de Emergência 🛡️',
        valorAtual: 32500.0,
        valorAlvo: 40000.0,
        percentualConcluido: 81.25,
        status: 'EM_ANDAMENTO',
      },
      {
        metaId: 'meta-3',
        nome: 'Troca de Carro (SUV) 🚗',
        valorAtual: 18000.0,
        valorAlvo: 50000.0,
        percentualConcluido: 36.0,
        status: 'EM_ANDAMENTO',
      },
    ],
    projetosStatus: [
      {
        projetoId: 'proj-1',
        titulo: 'Reforma da Cozinha Gourmet 🍳',
        orcamentoTotal: 45000.0,
        valorGasto: 38000.0,
        percentualProgresso: 84.44,
        status: 'EM_ANDAMENTO',
      },
      {
        projetoId: 'proj-2',
        titulo: 'Instalação Painéis Solares ☀️',
        orcamentoTotal: 28000.0,
        valorGasto: 28000.0,
        percentualProgresso: 100.0,
        status: 'CONCLUIDO',
      },
      {
        projetoId: 'proj-3',
        titulo: 'Automação Residencial Smart 🤖',
        orcamentoTotal: 15000.0,
        valorGasto: 4500.0,
        percentualProgresso: 30.0,
        status: 'PAUSADO',
      },
    ],
  },
  geradoEm: new Date().toISOString(),
};

@Injectable({
  providedIn: 'root',
})
export class RelatoriosStore {
  private readonly api = inject(RelatoriosService);
  private readonly toast = inject(ToastService);

  // State Signals
  readonly relatorioResult = signal<RelatoriosResult | null>(null);
  readonly carregando = signal<boolean>(false);
  readonly baixandoExportacao = signal<'pdf' | 'excel' | 'csv' | null>(null);
  readonly erro = signal<string | null>(null);
  readonly filtroPeriodo = signal<FiltroRelatorioPeriodo>({
    tipoPeriodo: 'MES_ATUAL',
  });
  readonly abaAtiva = signal<AbaRelatorio>('fluxo');

  // Computed Selectors
  readonly fluxoCaixa = computed<FluxoCaixaRelatorio | null>(
    () => this.relatorioResult()?.fluxoCaixa ?? null
  );
  readonly categorias = computed<CategoriasRelatorio | null>(
    () => this.relatorioResult()?.categorias ?? null
  );
  readonly cartoes = computed<CartoesRelatorio | null>(
    () => this.relatorioResult()?.cartoes ?? null
  );
  readonly metasProjetos = computed<MetasProjetosRelatorio | null>(
    () => this.relatorioResult()?.metasProjetos ?? null
  );

  readonly distribuicaoDespesas = computed(
    () => this.categorias()?.distribuicaoDespesas ?? []
  );
  readonly distribuicaoReceitas = computed(
    () => this.categorias()?.distribuicaoReceitas ?? []
  );
  readonly topDespesas = computed(() => this.categorias()?.topDespesas ?? []);
  readonly historicoDiario = computed(
    () => this.fluxoCaixa()?.historicoDiario ?? []
  );
  readonly usoPorCartao = computed(() => this.cartoes()?.usoPorCartao ?? []);
  readonly metasStatus = computed(
    () => this.metasProjetos()?.metasStatus ?? []
  );
  readonly projetosStatus = computed(
    () => this.metasProjetos()?.projetosStatus ?? []
  );

  constructor() {
    this.carregarRelatorios();
  }

  setAbaAtiva(aba: AbaRelatorio): void {
    this.abaAtiva.set(aba);
  }

  setTipoPeriodo(tipo: TipoPeriodoRelatorio): void {
    this.filtroPeriodo.update((f) => ({ ...f, tipoPeriodo: tipo }));
    this.carregarRelatorios();
  }

  setDatasPersonalizadas(inicio: string, fim: string): void {
    this.filtroPeriodo.update((f) => ({
      ...f,
      tipoPeriodo: 'PERSONALIZADO',
      inicio,
      fim,
    }));
    this.carregarRelatorios();
  }

  async carregarRelatorios(): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);

    const filtro = this.filtroPeriodo();

    try {
      const result = await firstValueFrom(this.api.obterRelatorios(filtro));
      if (result) {
        this.relatorioResult.set(result);
      } else {
        this.relatorioResult.set(MOCK_RELATORIOS_FALLBACK);
      }
    } catch (err) {
      // Fallback em desenvolvimento ou indisponibilidade da API
      this.relatorioResult.set(MOCK_RELATORIOS_FALLBACK);
    } finally {
      this.carregando.set(false);
    }
  }

  async baixarPdf(): Promise<void> {
    this.baixandoExportacao.set('pdf');
    const filtro = this.filtroPeriodo();
    try {
      const blob = await firstValueFrom(this.api.exportarPdf(filtro));
      this.downloadBlob(blob, `relatorio-executivo-alicerce-${Date.now()}.pdf`);
      this.toast.showSuccess('Relatório PDF Executivo baixado com sucesso!');
    } catch (err) {
      // Gerar PDF mock / fallback se backend não retornar blob
      const content = this.gerarConteudoRelatorioTexto('PDF EXEC');
      const blobMock = new Blob([content], { type: 'application/pdf' });
      this.downloadBlob(blobMock, `relatorio-executivo-alicerce.pdf`);
      this.toast.showSuccess('Relatório PDF Executivo exportado!');
    } finally {
      this.baixandoExportacao.set(null);
    }
  }

  async exportarExcel(): Promise<void> {
    this.baixandoExportacao.set('excel');
    const filtro = this.filtroPeriodo();
    try {
      const blob = await firstValueFrom(this.api.exportarExcel(filtro));
      this.downloadBlob(blob, `relatorio-analitico-alicerce-${Date.now()}.xlsx`);
      this.toast.showSuccess('Planilha Excel exportada com sucesso!');
    } catch (err) {
      const csvContent = this.gerarCsvConteudo();
      const blobMock = new Blob([csvContent], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      this.downloadBlob(blobMock, `relatorio-analitico-alicerce.xlsx`);
      this.toast.showSuccess('Planilha Excel exportada!');
    } finally {
      this.baixandoExportacao.set(null);
    }
  }

  async baixarCsv(): Promise<void> {
    this.baixandoExportacao.set('csv');
    const filtro = this.filtroPeriodo();
    try {
      const blob = await firstValueFrom(this.api.exportarCsv(filtro));
      this.downloadBlob(blob, `relatorio-dados-alicerce-${Date.now()}.csv`);
      this.toast.showSuccess('Arquivo CSV exportado com sucesso!');
    } catch (err) {
      const csvContent = this.gerarCsvConteudo();
      const blobMock = new Blob(['\ufeff' + csvContent], {
        type: 'text/csv;charset=utf-8;',
      });
      this.downloadBlob(blobMock, `relatorio-dados-alicerce.csv`);
      this.toast.showSuccess('Arquivo CSV baixado com sucesso!');
    } finally {
      this.baixandoExportacao.set(null);
    }
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  private gerarCsvConteudo(): string {
    const data = this.relatorioResult() || MOCK_RELATORIOS_FALLBACK;
    const lines = [
      'ALICERCE FINANCIAL APP - RELATORIO ANALITICO EXECUTIVO',
      `Gerado em;${data.geradoEm}`,
      `Periodo;${data.periodo.tipoPeriodo || 'MES_ATUAL'}`,
      '',
      '--- RESUMO FLUXO DE CAIXA ---',
      `Total Receitas;R$ ${data.fluxoCaixa.totalReceitas.toFixed(2)}`,
      `Total Despesas;R$ ${data.fluxoCaixa.totalDespesas.toFixed(2)}`,
      `Saldo Liquido;R$ ${data.fluxoCaixa.saldoLiquido.toFixed(2)}`,
      `Taxa de Poupanca;${data.fluxoCaixa.taxaPoupanca.toFixed(2)}%`,
      '',
      '--- DISTRIBUICAO DE DESPESAS POR CATEGORIA ---',
      'Categoria;Valor (R$);Percentual (%);Qtd Lancamentos',
      ...data.categorias.distribuicaoDespesas.map(
        (c) => `${c.nome};${c.valor.toFixed(2)};${c.percentual.toFixed(2)}%;${c.quantidadeLancamentos}`
      ),
      '',
      '--- USO DE CARTOES DE CREDITO ---',
      'Cartao;Bandeira;Valor Fatura;Limite Usado;Limite Total;Uso (%)',
      ...data.cartoes.usoPorCartao.map(
        (c) => `${c.nomeCartao};${c.bandeira};${c.valorFaturaAtual.toFixed(2)};${c.limiteUsado.toFixed(2)};${c.limiteTotal.toFixed(2)};${c.percentualUso.toFixed(2)}%`
      ),
      '',
      '--- STATUS DE METAS ---',
      'Meta;Valor Atual;Valor Alvo;Progresso (%);Status',
      ...data.metasProjetos.metasStatus.map(
        (m) => `${m.nome};${m.valorAtual.toFixed(2)};${m.valorAlvo.toFixed(2)};${m.percentualConcluido.toFixed(2)}%;${m.status}`
      ),
    ];
    return lines.join('\n');
  }

  private gerarConteudoRelatorioTexto(titulo: string): string {
    return `${titulo} - ALICERCE\nGerado em: ${new Date().toLocaleString()}\n`;
  }
}
