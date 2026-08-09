export interface CotacaoAvulsa {
  id: string;
  itemWishlistId: string;
  lojaNome: string;
  lojaUrl?: string | null;
  preco: number;
  dataCotacao: string | Date;
  observacao?: string | null;
  criadoEm?: string | Date;
}

export interface MelhorOferta {
  lojaNome: string;
  preco: number;
  url?: string | null;
  lojaLogo?: string | null;
  isCotacaoAvulsa: boolean;
  data?: string | Date;
}

export interface HistoricoComparativo {
  lojaNome: string;
  preco: number;
  data: string | Date;
}

export interface LinkLojaOferta {
  id: string;
  lojaNome: string;
  lojaLogo?: string | null;
  url: string;
  preco: number;
  ultimaVerificacao?: string | Date | null;
  historicoPrecos?: Array<{
    preco: number;
    data: string | Date;
  }>;
}

export interface ComparadorCotacoes {
  itemWishlistId: string;
  itemWishlistNome: string;
  precoAlvo?: number | null;
  melhorOferta: MelhorOferta | null;
  alvoAtingido: boolean;
  economiaPotencial: number | null;
  economiaPercentual?: number | null;
  cotacoesAvulsas: CotacaoAvulsa[];
  linksLoja: LinkLojaOferta[];
  historico: HistoricoComparativo[];
}

export interface RegistrarCotacaoAvulsaDto {
  itemWishlistId: string;
  lojaNome: string;
  lojaUrl?: string;
  preco: number;
  observacao?: string;
}
