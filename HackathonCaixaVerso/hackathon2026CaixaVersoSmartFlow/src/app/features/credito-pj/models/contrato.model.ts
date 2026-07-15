import { ContratoStatus, FormatoDocumento } from '../types/contrato-status.type';

export interface GerarContratoRequest {
  simulacaoId: string;
  formato: FormatoDocumento;
  // Dados inline para hackathon — em produção o backend busca pelo simulacaoId no DB
  razaoSocial: string;
  cnpj: string;
  linhaCredito: string;
  valorSolicitado: number;
  prazoMeses: number;
  taxaMensal: number;
}

export interface GerarContratoResponse {
  contratoId: string;
  simulacaoId: string;
  nomeArquivo: string;
  formato: FormatoDocumento;
  status: ContratoStatus;
  hashDocumento: string;
  dataGeracao: string; // ISO 8601
}
