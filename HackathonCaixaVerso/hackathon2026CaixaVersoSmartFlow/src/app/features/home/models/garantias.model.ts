export interface BandeiraCartao {
  id: string;
  nome: string;
  selecionada: boolean;
  percentual: number | null;
}

export interface TipoGarantiaOpcao {
  valor: string;
  label: string;
}

export interface GarantiaItem {
  tipo: string;
  tipoLabel: string;
  valor: number;
  descricao: string;
  bandeiras?: { nome: string; percentual: number }[];
}
