export interface QsaDto {
  identificador_socio: number;
  nome_socio_razao_social: string;
  cnpj_cpf_do_socio: string;
  codigo_qualificacao_socio: number;
  percentual_capital_social: number;
  data_entrada_sociedade: string;
  cpf_representante_legal: string;
  nome_representante_legal: string;
  codigo_qualificacao_representante_legal: number | null;
}

export interface EmpresaReceitaFederalDto {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  cnae_fiscal: number;
  cnae_fiscal_descricao: string;
  natureza_juridica: string;
  porte: string;
  data_inicio_atividade: string;
  situacao_cadastral: string;
  situacao_cadastral_data: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  ddd_telefone_1: string;
  email: string;
  capital_social: number;
  qsa: QsaDto[];
}

export interface EnderecoCepDto {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  erro?: boolean;
}

// ---------------------------------------------------------------------------
// DTO do banco mock (cadastroEmpresas.json)
// ---------------------------------------------------------------------------

export interface SocioMockDto {
  id: number;
  cpf: string;
  nome: string;
  nomeSocio: string;
  funcao: string;
  dataIngresso: string;
  percentualParticipacaoSocietaria: number;
  tipoParticipacao: string;
  contatos: { telefone: string; celular: string; email: string };
}

export interface FaturamentoAnualMockDto {
  anoReferencia: number;
  caracterizacao: string;
  valor: number;
  dataAtualizacao: string;
  origemDados: string;
  comprovada: number;
}

export interface EmpresaMockDto {
  id: number;
  cadastroEmpresa: {
    cnpj: string;
    razaoSocial: string;
    nomeFantasia: string;
    cnaePrincipal: string;
    descricaoCnaePrincipal: string;
    naturezaJuridica: string;
    porteCaixa: string;
    regimeTributario: string;
    dataConstituicao: string;
    tipoEmpresa: string;
    dataDemonstracaoContabil: string;
    documentoConstitutivo: string;
    dataUltimaAlteracao: string;
    capitalSocial: number;
    restricaoCadastral: boolean;
    endereco: {
      cep: string; logradouro: string; numero: string;
      complemento: string; bairro: string; municipio: string; uf: string;
    };
    contatos: {
      telefoneComercial: string; telefoneCelular: string;
      emailPrincipal: string; emailFinanceiro: string; site: string;
    };
  };
  representantesLegais: {
    totalParticipacao: number;
    socios: SocioMockDto[];
  };
  faturamentoFiscalPatrimonio: {
    faturamentoAnual: FaturamentoAnualMockDto[];
    faturamentoUltimosDozeMeses: {
      valor: number;
      faturamentoMedioMensal: number;
      caracterizacao: string;
    };
  };
  avaliacaoCreditoMock: {
    scoreInterno: number;
    classificacaoRisco: string;
    limiteSugerido: number;
    observacao: string;
  };
}

export interface ResultadoAvaliacaoDto {
  resultado: 'APROVADO' | 'REPROVADO';
  justificativa: string;
  limiteAprovado: number | null;
  valoresJaContratados: number;
  classificacaoRisco: string;
  scoreInterno: number;
  dataAvaliacao: string;
}

export interface AvaliarEmpresaRequestDto {
  cnpj: string;
  dadosAdministrativos: {
    documentoFaturamento: string;
    dataUltimaAtualizacaoContratual: string;
    alterouSociosMaior50: boolean;
    excluiuAdministradoresAnteriores: boolean;
    alterouObjetoSocial: boolean;
    alterouCnaePrincipal: boolean;
    alterouMunicipio: boolean;
    deixouSerSociedadeSimples: boolean;
    pvResponsavel: string;
  };
}
