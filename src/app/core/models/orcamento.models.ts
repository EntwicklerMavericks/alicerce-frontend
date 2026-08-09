export type StatusOrcamento = 'NORMAL' | 'ALERTA' | 'ATENCAO' | 'EXCEDIDO';

export interface Orcamento {
  id: string;
  workspaceId: string;
  categoria: string;
  valorTeto: number;
  valorGasto: number;
  percentualConsumido: number;
  mesAno: string; // Formato YYYY-MM
  status: StatusOrcamento;
  cor?: string;
  icone?: string;
  dataCriacao?: string;
  dataAtualizacao?: string;
}

export interface CriarOrcamentoDto {
  categoria: string;
  valorTeto: number;
  mesAno: string; // YYYY-MM
  cor?: string;
  icone?: string;
}

export interface ResumoOrcamento {
  mesAno: string;
  tetoTotal: number;
  gastoTotal: number;
  percentualTotal: number;
  statusGlobal: StatusOrcamento;
  orcamentos: Orcamento[];
}

export function calcularStatusOrcamento(percentual: number): StatusOrcamento {
  if (percentual >= 100) return 'EXCEDIDO';
  if (percentual >= 90) return 'ATENCAO';
  if (percentual >= 70) return 'ALERTA';
  return 'NORMAL';
}
