export interface LinhaCreditoDisponivel {
  nome: string;
  descricao: string;
  limite: string;
  prazo: string;
  taxaMensal: string;
  carencia: string;
  garantiasAceitas: string[];
}

export interface EmpresaSimulacaoCredito {
  nome: string;
  rating: string;
  faturamento: number;
}

export interface SimulacaoCapitalGiroInput {
  valorSolicitado: number;
  prazoMeses: number;
  taxaMensalPercentual: number;
}

export interface EvolucaoSaldoDevedorItem {
  parcela: number;
  saldoInicial: number;
  juros: number;
  amortizacao: number;
  valorParcela: number;
  saldoFinal: number;
}

export interface SimulacaoCapitalGiroResultado {
  valorParcela: number;
  valorTotal: number;
  totalJuros: number;
  valorSolicitado: number;
  cetMensal: number;
  cetAnual: number;
  valorIof: number;
  valorTac: number;
  valorLiberado: number;
  evolucaoSaldoDevedor: EvolucaoSaldoDevedorItem[];
}
