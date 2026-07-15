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

export const PORTES_CAIXA = [
  'MICRO EMPRESA',
  'PEQUENA EMPRESA',
  'MÉDIA EMPRESA',
  'GRANDE EMPRESA',
  'CONGLOMERADO',
];

export const NATUREZAS_JURIDICAS = [
  'Empresário Individual',
  'Sociedade Limitada - LTDA',
  'Sociedade Anônima - S.A.',
  'Empresa Individual de Responsabilidade Limitada - EIRELI',
  'Microempreendedor Individual - MEI',
  'Cooperativa',
  'Associação',
  'Fundação',
  'Outros',
];

export const REGIMES_TRIBUTARIOS = [
  'SIMPLES NACIONAL',
  'LUCRO PRESUMIDO',
  'LUCRO REAL',
  'LUCRO ARBITRADO',
  'IMUNE / ISENTA',
];

export const SEGMENTOS_PJ = [
  'MICRO EMPRESA',
  'PEQUENA EMPRESA',
  'MÉDIA EMPRESA',
  'GRANDE EMPRESA',
  'PODER PÚBLICO',
  'TERCEIRO SETOR',
];

export const TIPOS_EMPRESA = [
  'Comercial',
  'Industrial',
  'Prestadora de Serviços',
  'Rural / Agronegócio',
  'Financeiro',
  'Tecnologia',
  'Saúde',
  'Educação',
  'Construção Civil',
  'Transporte e Logística',
  'Outros',
];

export const FUNCOES_SOCIO = [
  'Sócio',
  'Sócio-Administrador',
  'Administrador',
  'Procurador',
  'Diretor',
  'Presidente',
];

export const NACIONALIDADES = [
  'Brasileiro(a)',
  'Argentino(a)',
  'Boliviano(a)',
  'Chileno(a)',
  'Colombiano(a)',
  'Espanhol(a)',
  'Estadunidense',
  'Francês/Francesa',
  'Italiano(a)',
  'Japonês/Japonesa',
  'Paraguaio(a)',
  'Peruano(a)',
  'Português(a)',
  'Uruguaio(a)',
  'Venezuelano(a)',
  'Outro',
];

export const SEXOS = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Feminino' },
  { value: 'NB', label: 'Não Binário' },
  { value: 'ND', label: 'Não Declarado' },
];

export const GRAUS_INSTRUCAO = [
  'Sem instrução',
  'Fundamental Incompleto',
  'Fundamental Completo',
  'Médio Incompleto',
  'Médio Completo',
  'Superior Incompleto',
  'Superior Completo',
  'Pós-Graduação / MBA',
  'Mestrado',
  'Doutorado',
];

export const ESTADOS_CIVIS = [
  'Solteiro(a)',
  'Casado(a)',
  'Divorciado(a)',
  'Separado(a)',
  'Viúvo(a)',
  'União Estável',
];

export const TIPOS_DOCUMENTO = [
  { value: 'RG', label: 'Identidade (RG)' },
  { value: 'CNH', label: 'CNH' },
  { value: 'PASSAPORTE', label: 'Passaporte' },
  { value: 'RNE', label: 'RNE - Registro Nacional de Estrangeiro' },
  { value: 'CTPS', label: 'Carteira de Trabalho' },
  { value: 'OUTRO', label: 'Outro' },
];

export const ORIGENS_RENDA = [
  'CLT / Empregado',
  'Empresário / Sócio',
  'Autônomo',
  'Aposentadoria',
  'Aluguel',
  'Pensão',
  'Investimento',
  'Rural',
  'Outro',
];

export const SEGMENTOS_PF = [
  'VAREJO',
  'PERSONALITE',
  'PRIVATE',
  'MICROEMPREENDEDOR',
  'FUNCIONÁRIO PÚBLICO',
];

export const UFS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
  'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
  'RS','RO','RR','SC','SP','SE','TO',
];

export const LINHAS_CREDITO = [
  'Capital de Giro',
  'PRONAMPE',
  'Crédito Imobiliário PJ',
  'Financiamento de Equipamentos',
  'Desconto de Recebíveis',
  'Conta Garantida',
  'Antecipação de Recebíveis',
  'BNDES',
  'FNO / FNE / FCO',
  'Microcrédito',
];
