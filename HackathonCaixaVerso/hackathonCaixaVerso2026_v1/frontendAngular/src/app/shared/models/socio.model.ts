/** DTO de Pessoa Física — sócio de empresa PJ */
export interface SocioDto {
  nome: string;
  cpf: string;
  dataNascimento: string;  // YYYY-MM-DD
  rendaMensal: number;
  scoreCredito: number;    // 0–1000
  possuiRestricao: boolean;
  motivoRestricao?: string;
  email: string;
  telefone: string;
}
