export type StatusEtapa =
  | 'pendente'
  | 'em-andamento'
  | 'concluida'
  | 'com-pendencia'
  | 'aguardando-retorno'
  | 'reprovada'
  | 'aprovada';

export type EtapaOperacaoType =
  | 'cadastro'
  | 'avaliacao-credito'
  | 'pesquisas'
  | 'simulacao'
  | 'contrato-assinatura'
  | 'conformidade'
  | 'finalizado';

export interface EtapaStatus {
  etapa: EtapaOperacaoType;
  label: string;
  status: StatusEtapa;
  dataAtualizacao?: Date;
  observacao?: string;
}

export const ETAPAS_OPERACAO: EtapaStatus[] = [
  { etapa: 'cadastro',          label: 'Cadastro',                     status: 'pendente' },
  { etapa: 'avaliacao-credito', label: 'Avaliação do Crédito',         status: 'pendente' },
  { etapa: 'pesquisas',         label: 'Pesquisas',                    status: 'pendente' },
  { etapa: 'simulacao',         label: 'Simulação',                    status: 'pendente' },
  { etapa: 'contrato-assinatura', label: 'Contrato e Assinatura',      status: 'pendente' },
  { etapa: 'conformidade',      label: 'Conformidade',                 status: 'pendente' },
  { etapa: 'finalizado',        label: 'Finalizado',                   status: 'pendente' },
];
