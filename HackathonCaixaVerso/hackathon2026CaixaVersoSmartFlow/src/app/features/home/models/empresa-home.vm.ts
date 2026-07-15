export interface SocioResumoVm {
  nome: string;
  cpf: string;
  status: string;
}

export interface OfertaProdutoVm {
  valor: number;
  valorStr: string;
  taxa: string;
  prazo: string;
  preAprovado: boolean;
}

export interface EmpresaHomeVm {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  faturamentoAnual: string;
  segmento: string;
  ratingBadge: string;
  ratingTexto: string;
  ratingAprovado: boolean;
  dataAvaliacao: string;
  validoAte: string;
  limiteGlobalStr: string;
  limiteUtilizadoStr: string;
  limiteDisponivelStr: string;
  percentualUtilizado: number;
  tempoRelacionamento: string;
  clienteDesde: string;
  nepj: string;
  nepjClassificacao: string;
  nepjDescricao: string;
  possuiRestricao: boolean;
  socios: SocioResumoVm[];
  classificacaoRisco: string;
  scoreInterno: number;
  ofertaCapitalGiro: OfertaProdutoVm;
  ofertaAntecipaRecebiveis: OfertaProdutoVm;
}
