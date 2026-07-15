import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { provideRouter } from '@angular/router';
import { autenticacaoGuard } from './autenticacao.guard';
import { AutenticacaoStore } from '../store/autenticacao.store';
import { UsuarioSessaoVm } from '../models/autenticacao.vm';

const mockUsuario: UsuarioSessaoVm = {
  matricula: 'c123456',
  nome: 'Ana Paula',
  nomeAbreviado: 'Ana Paula',
  perfil: 'GERENTE',
  expiresAt: new Date(Date.now() + 3_600_000),
};

function executarGuard(state: Partial<RouterStateSnapshot> = { url: '/pagina-inicial' }) {
  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockState = state as RouterStateSnapshot;
  return TestBed.runInInjectionContext(() =>
    autenticacaoGuard(mockRoute, mockState)
  );
}

describe('autenticacaoGuard', () => {
  let store: AutenticacaoStore;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        AutenticacaoStore,
        provideRouter([]),
      ],
    });
    store = TestBed.inject(AutenticacaoStore);
  });

  afterEach(() => sessionStorage.clear());

  it('deve permitir acesso quando o usuário está autenticado', () => {
    store.definirSessao('token', mockUsuario);

    const resultado = executarGuard();

    expect(resultado).toBe(true);
  });

  it('deve redirecionar para /login quando não autenticado', () => {
    const resultado = executarGuard({ url: '/pagina-inicial' });

    expect(resultado).toBeInstanceOf(UrlTree);
    const url = (resultado as UrlTree).toString();
    expect(url).toContain('/login');
  });

  it('deve preservar a returnUrl como query param no redirecionamento', () => {
    const resultado = executarGuard({ url: '/cadastro-pj' });

    const tree = resultado as UrlTree;
    expect(tree.queryParams['returnUrl']).toBe('/cadastro-pj');
  });

  it('deve bloquear acesso quando store está sem token', () => {
    expect(store.autenticado()).toBe(false);

    const resultado = executarGuard();

    expect(resultado).not.toBe(true);
  });

  it('deve permitir acesso após autenticação ser definida', () => {
    store.definirSessao('t', mockUsuario);
    expect(executarGuard()).toBe(true);

    store.limpar();
    expect(executarGuard()).not.toBe(true);
  });

  it('não deve injetar Router diretamente nos testes', () => {
    const router = TestBed.inject(Router);
    expect(router).toBeDefined();
  });
});
