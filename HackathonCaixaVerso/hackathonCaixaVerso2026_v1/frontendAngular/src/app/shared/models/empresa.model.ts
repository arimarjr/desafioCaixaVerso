/** DTO básico: dados retornados pela Receita Federal para empresas ainda não cadastradas na CAIXA */
export interface EmpresaReceitaDto {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  cnaePrincipal: string;
  naturezaJuridica: string;
}

/** DTO completo: empresa com dados de análise de crédito */
export interface EmpresaCompletaDto extends EmpresaReceitaDto {
  dataAbertura: string;       // YYYY-MM-DD
  capitalSocial: number;
  faturamentoMensal: number;
  endereco: string;
  cidade: string;
  uf: string;
  email: string;
  telefone: string;
  scoreCredito: number;       // 0–1000
  possuiRestricao: boolean;
  motivoRestricao?: string;
  situacaoCredito: SituacaoCredito;
}

export type SituacaoCredito =
  | 'APROVADO_AUTOMATICO'    // score >= 700 e sem restrição
  | 'ANALISE_MANUAL'         // score 400–699 e sem restrição
  | 'REPROVADO_AUTOMATICO';  // score < 400 OU possui restrição

export function avaliarSituacaoCredito(score: number, possuiRestricao: boolean): SituacaoCredito {
  if (possuiRestricao || score < 400) return 'REPROVADO_AUTOMATICO';
  if (score < 700) return 'ANALISE_MANUAL';
  return 'APROVADO_AUTOMATICO';
}
