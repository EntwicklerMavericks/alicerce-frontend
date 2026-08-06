export type TipoSalario = 'FIXO' | 'POR_HORA' | 'COMISSAO' | 'DIARIO';

export interface ConfigSalario {
  id?: string;
  pessoaId?: string;
  tipo: TipoSalario;
  valorBase?: number;
  valorHora?: number;
  horasDiarias?: number;
  diasTrabalhoMes?: number;
  diasTrabalho?: { dias?: number };
}

export interface Pessoa {
  id: string;
  workspaceId: string;
  nome: string;
  parentesco: string;
  ativo: boolean;
  configSalario?: ConfigSalario;
  rendaEstimadaMensal: number;
  dataCriacao?: string;
}

export interface CriarPessoaRequest {
  nome: string;
  parentesco: string;
  configSalario: {
    tipo: TipoSalario;
    valorBase?: number;
    valorHora?: number;
    horasDiarias?: number;
    diasTrabalhoMes?: number;
  };
}
