import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AutenticacaoStore } from '../store/autenticacao.store';
import { AutenticacaoService } from '../services/autenticacao.service';

/**
 * Interceptor de autenticação (functional — Angular 17+).
 *
 * Responsabilidades:
 *  1. Adicionar `withCredentials: true` em TODAS as requisições
 *     (necessário para que o browser envie o refresh token via HttpOnly Cookie).
 *  2. Injetar o header `Authorization: Bearer <token>` quando há access token em memória.
 *  3. Ao receber 401 em rota protegida, tentar renovar o access token via /auth/refresh.
 *  4. Em caso de falha no refresh, limpar o estado e redirecionar para /login.
 *
 * ⚠️  O frontend NUNCA manipula o refresh token diretamente.
 *     Ele é enviado automaticamente pelo browser como HttpOnly Cookie.
 */
export const autenticacaoInterceptor: HttpInterceptorFn = (req, next) => {
  const store       = inject(AutenticacaoStore);
  const authService = inject(AutenticacaoService);
  const router      = inject(Router);

  const isAuthEndpoint =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/refresh') ||
    req.url.includes('/auth/logout');

  // Sempre enviar credentials (cookies)
  const token    = store.accessToken();
  const reqFinal = req.clone({
    withCredentials: true,
    ...(token && !isAuthEndpoint
      ? { setHeaders: { Authorization: `Bearer ${token}` } }
      : {}),
  });

  return next(reqFinal).pipe(
    catchError((erro: HttpErrorResponse) => {
      // Só tenta refresh em 401 de endpoints protegidos (não de /auth/* próprios)
      if (erro.status === 401 && !isAuthEndpoint) {
        return authService.refresh().pipe(
          switchMap(response => {
            // Retry da requisição original com o novo token
            const reqRetry = req.clone({
              withCredentials: true,
              setHeaders: { Authorization: `Bearer ${response.accessToken}` },
            });
            return next(reqRetry);
          }),
          catchError(erroRefresh => {
            // Refresh falhou (token expirado/revogado) → força novo login
            store.limpar();
            router.navigate(['/login']);
            return throwError(() => erroRefresh);
          }),
        );
      }

      return throwError(() => erro);
    }),
  );
};
