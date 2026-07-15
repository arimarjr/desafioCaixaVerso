export interface RepresentanteResponseDto {
  id: number;
  clienteId: number;
  perfil: string;
  cpf: string;
  nome: string;
  funcao: string;
  dataIngresso: string;
  percentualParticipacaoSocietaria: number;
  tipoParticipacao: string;
  telefone: string;
  celular: string;
  email: string;
}

export interface ClienteResponseDto {
  id: number;
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
  capitalSocial: number;
  restricaoCadastral: boolean;
  endereco: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    municipio: string;
    uf: string;
  };
  faturamentoValor: number;
  faturamentoMedioMensal: number;
  avaliacaoCreditoScoreInterno: number;
  avaliacaoCreditoClassificacaoRisco: string;
  avaliacaoCreditoLimiteSugerido: number;
  avaliacaoCreditoObservacao: string;
  representantes: RepresentanteResponseDto[];
}
