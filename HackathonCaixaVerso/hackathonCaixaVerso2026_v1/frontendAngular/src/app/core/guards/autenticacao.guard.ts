import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AutenticacaoStore } from '../store/autenticacao.store';

/**
 * Guard de autenticação — protege rotas que exigem sessão válida.
 *
 * IMPORTANTE: este guard verifica apenas o estado em memória (signal).
 * A validação real de autorização é sempre feita no backend a cada requisição.
 * O frontend NUNCA é a fonte de verdade de segurança.
 *
 * Se o usuário recarregar a página, o access token em memória é perdido.
 * O interceptor de autenticação tentará usar o refresh token (cookie) automaticamente
 * na primeira requisição protegida.
 */
export const autenticacaoGuard: CanActivateFn = (_route, state) => {
  const store  = inject(AutenticacaoStore);
  const router = inject(Router);

  if (store.autenticado()) {
    return true;
  }

  // Redireciona para login preservando a URL de destino
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};
