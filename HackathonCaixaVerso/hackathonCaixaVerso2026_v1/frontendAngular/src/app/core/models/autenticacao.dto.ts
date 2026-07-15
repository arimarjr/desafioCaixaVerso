// DTOs — contratos da API de autenticação (o que o backend envia/recebe)

export interface LoginRequestDto {
  matricula: string;
  senha: string;
}

export interface LoginResponseDto {
  accessToken: string;
  expiresAt: string; // ISO 8601
  usuario: UsuarioInfoDto;
}

export interface UsuarioInfoDto {
  matricula: string;
  nome: string;
  perfil: string;
}
