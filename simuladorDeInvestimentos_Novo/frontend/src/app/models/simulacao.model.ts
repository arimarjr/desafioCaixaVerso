export interface SimulacaoPayload {
  valor: number;
  prazoMeses: number;
  tipo: string;
}

export interface SimulacaoResult {
  valorFinal: number;
  rentabilidade: number;
  detalhes: string;
}
