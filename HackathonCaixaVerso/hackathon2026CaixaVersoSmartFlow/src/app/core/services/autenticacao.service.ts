import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { finalize, map, Observable, tap } from 'rxjs';
import { LoginRequestDto, LoginResponseDto } from '../models/autenticacao.dto';
import { UsuarioSessaoVm } from '../models/autenticacao.vm';
import { AutenticacaoStore } from '../store/autenticacao.store';

const API_BASE = '/api';

/**
 * Serviço de autenticação.
 * Responsabilidades:
 *   - Comunicar com o backend (/auth/*)
 *   - Atualizar o AutenticacaoStore com o resultado
 * O access token NUNCA é exposto fora deste módulo de segurança.
 * O refresh token é gerenciado pelo browser via HttpOnly Cookie.
 */
@Injectable({ providedIn: 'root' })
export class AutenticacaoService {
  private readonly http   = inject(HttpClient);
  private readonly store  = inject(AutenticacaoStore);
  private readonly router = inject(Router);

  /**
   * Envia credenciais ao backend. Em caso de sucesso, atualiza o store.
   * withCredentials: true — necessário para que o browser envie/receba cookies.
   */
  login(matricula: string, senha: string): Observable<void> {
    const body: LoginRequestDto = { matricula, senha };

    return this.http
      .post<LoginResponseDto>(`${API_BASE}/auth/login`, body, { withCredentials: true })
      .pipe(
        tap(response => {
          const usuario = mapearParaVm(response);
          this.store.definirSessao(response.accessToken, usuario);
        }),
        map(() => void 0),
      );
  }

  /**
   * Usa o refresh token (HttpOnly Cookie) para obter novo access token.
   * Chamado automaticamente pelo interceptor quando o access token expira (401).
   */
  refresh(): Observable<LoginResponseDto> {
    return this.http
      .post<LoginResponseDto>(`${API_BASE}/auth/refresh`, {}, { withCredentials: true })
      .pipe(
        tap(response => {
          const usuario = mapearParaVm(response);
          this.store.atualizarToken(response.accessToken, usuario);
        }),
      );
  }

  /**
   * Revoga o refresh token no servidor e limpa o estado local.
   * O backend também apaga o HttpOnly Cookie.
   */
  logout(): Observable<void> {
    return this.http
      .post<void>(`${API_BASE}/auth/logout`, {}, { withCredentials: true })
      .pipe(
        finalize(() => {
          this.store.limpar();
          this.router.navigate(['/login']);
        }),
        map(() => void 0),
      );
  }

  /**
   * Verifica a sessão chamando /auth/me. Útil para restaurar o estado
   * após refresh de página (o refresh token ainda está no cookie).
   */
  verificarSessao(): Observable<void> {
    return this.http
      .get<{ matricula: string; nome: string; perfil: string }>(
        `${API_BASE}/auth/me`,
        { withCredentials: true },
      )
      .pipe(map(() => void 0));
  }
}

// ---------------------------------------------------------------------------
// Mapeador local: LoginResponseDto → UsuarioSessaoVm
// ---------------------------------------------------------------------------
function mapearParaVm(dto: LoginResponseDto): UsuarioSessaoVm {
  const partes = dto.usuario.nome.trim().split(' ').filter(Boolean);
  const nomeAbreviado =
    partes.length >= 2
      ? `${partes[0]} ${partes[partes.length - 1]}`
      : dto.usuario.nome;

  return {
    matricula:     dto.usuario.matricula,
    nome:          dto.usuario.nome,
    nomeAbreviado,
    perfil:        dto.usuario.perfil,
    expiresAt:     new Date(dto.expiresAt),
  };
}
