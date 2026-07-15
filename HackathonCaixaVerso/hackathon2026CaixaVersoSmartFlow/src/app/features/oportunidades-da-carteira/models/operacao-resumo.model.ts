export interface OperacaoResumo {
  id: string;
  cnpj: string;
  razaoSocial: string;
  linhaCredito: string;
  etapa: string;
  status: 'em-andamento' | 'aguardando-conformidade' | 'com-pendencia' | 'pronto-contrato' | 'finalizado';
  dataAtualizacao: string;
}
