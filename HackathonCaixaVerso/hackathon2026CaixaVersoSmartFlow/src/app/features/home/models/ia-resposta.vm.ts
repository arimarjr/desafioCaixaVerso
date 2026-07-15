export interface SubsecaoIaVm {
  icone: string;
  titulo: string;
  itens: string[];
}

export interface ProdutoIaVm {
  numero: number;
  titulo: string;
  siapi: string;
  subsecoes: SubsecaoIaVm[];
}

export interface RespostaIaVm {
  introducao: string;
  produtos: ProdutoIaVm[];
  observacoes: string[];
  refsGerais: string[];
}
