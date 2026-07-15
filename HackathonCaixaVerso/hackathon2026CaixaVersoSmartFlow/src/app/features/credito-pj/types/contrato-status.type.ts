export type ContratoStatus =
  | 'RASCUNHO'
  | 'PENDENTE_DADOS'
  | 'GERANDO'
  | 'GERADO'
  | 'DISPONIVEL_PARA_ASSINATURA'
  | 'ASSINADO'
  | 'CANCELADO'
  | 'ERRO_GERACAO';

export type FormatoDocumento = 'PDF' | 'DOCX';
