export interface EventoConformidade {
  data: string;
  descricao: string;
  usuario: string;
  tipo: 'info' | 'pendencia' | 'aprovado' | 'reprovado';
}
