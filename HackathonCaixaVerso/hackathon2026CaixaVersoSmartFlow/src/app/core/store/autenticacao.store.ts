import { computed, Injectable, signal } from '@angular/core';
import { UsuarioSessaoVm } from '../models/autenticacao.vm';

const SESSION_KEY_TOKEN   = 'pj_access_token';
const SESSION_KEY_USUARIO = 'pj_usuario';

function _salvarSessao(token: string, usuario: UsuarioSessaoVm): void {
  try {
    sessionStorage.setItem(SESSION_KEY_TOKEN,   token);
    sessionStorage.setItem(SESSION_KEY_USUARIO, JSON.stringify(usuario));
  } catch { /* quota exceeded — ignora */ }
}

function _limparSessao(): void {
  sessionStorage.removeItem(SESSION_KEY_TOKEN);
  sessionStorage.removeItem(SESSION_KEY_USUARIO);
}

function _recuperarSessao(): { token: string; usuario: UsuarioSessaoVm } | null {
  try {
    const token   = sessionStorage.getItem(SESSION_KEY_TOKEN);
    const usuJson = sessionStorage.getItem(SESSION_KEY_USUARIO);
    if (!token || !usuJson) return null;
    const usuario = JSON.parse(usuJson) as UsuarioSessaoVm;
    // Recompõe o Date que foi serializado como string
    usuario.expiresAt = new Date(usuario.expiresAt);
    if (usuario.expiresAt < new Date()) { _limparSessao(); return null; }
    return { token, usuario };
  } catch { return null; }
}

/**
 * Estado de autenticação em memória — NUNCA persiste token em localStorage.
 * O access token vive apenas enquanto a aba estiver aberta.
 * O refresh token é gerenciado exclusivamente via HttpOnly Cookie pelo backend.
 */
@Injectable({ providedIn: 'root' })
export class AutenticacaoStore {
  // --- sinais privados (graváveis) ---
  private readonly _accessToken = signal<string | null>(null);
  private readonly _usuario     = signal<UsuarioSessaoVm | null>(null);
  private readonly _carregando  = signal(false);
  private readonly _erro        = signal<string | null>(null);

  constructor() {
    // Restaura sessão do sessionStorage ao recarregar a página
    const sessao = _recuperarSessao();
    if (sessao) {
      this._accessToken.set(sessao.token);
      this._usuario.set(sessao.usuario);
    }
  }

  // --- sinais públicos (somente leitura) ---
  readonly accessToken = this._accessToken.asReadonly();
  readonly usuario     = this._usuario.asReadonly();
  readonly carregando  = this._carregando.asReadonly();
  readonly erro        = this._erro.asReadonly();

  // --- derivados ---
  readonly autenticado   = computed(() => this._accessToken() !== null);
  readonly nomeUsuario   = computed(() => this._usuario()?.nomeAbreviado ?? '');
  readonly perfilUsuario = computed(() => this._usuario()?.perfil ?? '');

  // --- actions ---

  definirSessao(accessToken: string, usuario: UsuarioSessaoVm): void {
    this._accessToken.set(accessToken);
    this._usuario.set(usuario);
    this._carregando.set(false);
    this._erro.set(null);
    _salvarSessao(accessToken, usuario);
  }

  atualizarToken(accessToken: string, usuario: UsuarioSessaoVm): void {
    this._accessToken.set(accessToken);
    this._usuario.set(usuario);
    _salvarSessao(accessToken, usuario);
  }

  iniciarCarregamento(): void {
    this._carregando.set(true);
    this._erro.set(null);
  }

  definirErro(mensagem: string): void {
    this._erro.set(mensagem);
    this._carregando.set(false);
  }

  limpar(): void {
    this._accessToken.set(null);
    this._usuario.set(null);
    this._carregando.set(false);
    this._erro.set(null);
    _limparSessao();
  }
}

