export type StatusConformidade =
  | 'aguardando'
  | 'em-analise'
  | 'pendencia'
  | 'aprovado'
  | 'reprovado';

export type TipoEventoConformidade = 'info' | 'pendencia' | 'aprovado' | 'reprovado';

export interface EventoConformidade {
  data: string;
  descricao: string;
  usuario: string;
  tipo: TipoEventoConformidade;
}
