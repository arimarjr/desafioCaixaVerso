export type TipoPessoaPesquisa = 'EMPRESA' | 'SOCIO' | 'CONTRAPARTE';

export interface Pesquisa {
  id: string;
  grupo: string;
  tipoPessoa: TipoPessoaPesquisa;
  nome: string;
  descricao: string;
  url: string;
  selecionada: boolean;
  obrigatoria: boolean;
  permiteUpload: boolean;
  arquivoEnviado?: boolean;
  nomeArquivoSalvo?: string;
}
