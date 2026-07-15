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


