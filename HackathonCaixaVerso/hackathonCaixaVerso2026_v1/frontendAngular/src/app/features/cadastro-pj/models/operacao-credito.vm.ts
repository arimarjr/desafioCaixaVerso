export interface RendaVm {
  id: string;
  fontePagadora: string;
  profissao: string;
  documento: string;
  mesAno: string;
  rendaBruta: number;
  rendaLiquida: number;
  irpf: number;
  origem: string;
}

export interface PatrimonioVm {
  id: string;
  descricao: string;
  valor: number;
  atualizacao: string;
}

export interface DadosPfVm {
  cpf: string;
  nome: string;
  dataNascimento: string;
  nomeMae: string;
  nomePai: string;
  nomeSocial: string;
  nacionalidade: string;
  naturalidade: string;
  sexo: string;
  segmento: string;
  grauInstrucao: string;
  estadoCivil: string;
  cpfConjuge: string;
  nomeConjuge: string;
  nascimentoConjuge: string;
  tipoDocumento: string;
  numeroDocumento: string;
  emissorDocumento: string;
  ufDocumento: string;
  dataEmissaoDocumento: string;
  dataValidadeDocumento: string;
  orgaoEmissorDocumento: string;
  telefone: string;
  email: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  rendas: RendaVm[];
  patrimonios: PatrimonioVm[];
}

export interface SocioVm {
  id: string;
  cpf: string;
  nome: string;
  funcao: string;
  dataIngresso: string;
  participacaoPercentual: number;
  dadosPf: DadosPfVm;
}

export interface FaturamentoAnualVm {
  id: string;
  anoReferencia: number;
  caracterizacao: string;
  valor: number;
  dataAtualizacao: string;
  origemDados: string;
  comprovada: number;
}

export interface EmpresaVm {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnaePrincipal: string;
  cnaeDescricao: string;
  porteCaixa: string;
  naturezaJuridica: string;
  regimeTributario: string;
  segmento: string;
  dataConstituicao: string;
  tipoEmpresa: string;
  dataDemonstracao: string;
  gerenteResponsavel: string;
  perfil: string;
  capitalSocial: number;
  documentoConstitutivo: string;
  ultimaAlteracao: string;
  situacaoCadastral: string;
  restricaoCadastral?: boolean;
  telefone: string;
  email: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export interface HistoricoVm {
  data: Date;
  descricao: string;
  usuario: string;
  etapa: string;
}

// ---------------------------------------------------------------------------
// Avaliação de crédito PJ
// ---------------------------------------------------------------------------

export interface DadosAdministrativosVm {
  dataReferencia: string;
  documentoFaturamento: '1' | '2' | '3';
  dataUltimaAtualizacaoContratual: string;
  alterouSociosMaior50: boolean;
  excluiuAdministradoresAnteriores: boolean;
  alterouObjetoSocial: boolean;
  alterouCnaePrincipal: boolean;
  alterouMunicipio: boolean;
  deixouSerSociedadeSimples: boolean;
  pvResponsavel: string;
}

export interface ResultadoAvaliacaoVm {
  resultado: 'APROVADO' | 'REPROVADO';
  justificativa: string;
  limiteAprovado: number | null;
  valoresJaContratados: number;
  disponivel: number;
  classificacaoRisco: string;
  scoreInterno: number;
  dataAvaliacao: string;
}

export interface SocioResumoVm {
  nome: string;
  cpf: string;
  funcao: string;
  percentual: number;
}

export interface OperacaoCreditoPjVm {
  id: string;
  cnpj: string;
  empresa: EmpresaVm | null;
  socios: SocioVm[];
  faturamentos: FaturamentoAnualVm[];
  etapaAtual: number;
  dataCriacao: Date;
  gerenteResponsavel: string;
  linhaCredito: string;
  valorSolicitado: number;
  prazo: number;
  taxaJuros: number;
  valorParcela: number;
  statusConformidade: string;
  pendencias: string[];
  historico: HistoricoVm[];
}
