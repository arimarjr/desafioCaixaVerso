import { HttpContextToken } from '@angular/common/http';

/**
 * Quando `true` no contexto da requisição, o interceptor de autenticação
 * não redireciona para /login em caso de falha no refresh token.
 * O erro é propagado normalmente para que o chamador use fallback próprio.
 *
 * Uso:
 *   this._http.get('/api/...', {
 *     context: new HttpContext().set(SKIP_AUTH_REDIRECT, true)
 *   })
 */
export const SKIP_AUTH_REDIRECT = new HttpContextToken<boolean>(() => false);
