export interface ItemPesquisa {
  id: string;
  descricao: string;
  tipo: 'empresa' | 'socio';
  nomeSocio?: string;
  url?: string;
  cpfCnpj?: string;
  concluida: boolean;
  evidencia?: string;
}
