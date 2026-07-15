import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { routes } from './app.routes';
import { AutenticacaoStore } from './core/store/autenticacao.store';

describe('app.routes', () => {
  it('deve ter rota raiz redirecionando para login', () => {
    const rota = routes.find(r => r.path === '');
    expect(rota).toBeDefined();
    expect(rota?.redirectTo).toBe('login');
    expect(rota?.pathMatch).toBe('full');
  });

  it('deve ter rota de login com componente LoginComponent', () => {
    const rota = routes.find(r => r.path === 'login');
    expect(rota).toBeDefined();
    expect(rota?.component).toBeDefined();
  });

  it('deve ter rota de pagina-inicial com lazy loading', () => {
    const rota = routes.find(r => r.path === 'pagina-inicial');
    expect(rota).toBeDefined();
    expect(rota?.loadComponent).toBeDefined();
  });

  it('deve ter rota de pagina-inicial com guard de autenticação', () => {
    const rota = routes.find(r => r.path === 'pagina-inicial');
    expect(rota?.canActivate).toBeDefined();
    expect((rota?.canActivate as any[]).length).toBeGreaterThan(0);
  });

  it('deve ter rota de cadastro-pj com lazy loading de children', () => {
    const rota = routes.find(r => r.path === 'cadastro-pj');
    expect(rota).toBeDefined();
    expect(rota?.loadChildren).toBeDefined();
  });

  it('deve ter rota de cadastro-pj protegida por guard', () => {
    const rota = routes.find(r => r.path === 'cadastro-pj');
    expect(rota?.canActivate).toBeDefined();
  });

  it('deve ter rota de pesquisas com lazy loading', () => {
    const rota = routes.find(r => r.path === 'pesquisas');
    expect(rota).toBeDefined();
    expect(rota?.loadComponent).toBeDefined();
  });

  it('deve ter rota de pesquisas protegida por guard', () => {
    const rota = routes.find(r => r.path === 'pesquisas');
    expect(rota?.canActivate).toBeDefined();
  });

  it('deve ter rota wildcard redirecionando para login', () => {
    const rota = routes.find(r => r.path === '**');
    expect(rota).toBeDefined();
    expect(rota?.redirectTo).toBe('login');
  });

  it('deve ter 6 rotas configuradas', () => {
    expect(routes.length).toBe(6);
  });
});

describe('app.routes — navegação com guard', () => {
  let router: Router;
  let store: AutenticacaoStore;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        AutenticacaoStore,
        provideRouter(routes),
      ],
    });
    router = TestBed.inject(Router);
    store = TestBed.inject(AutenticacaoStore);
  });

  afterEach(() => sessionStorage.clear());

  it('deve redirecionar para login quando não autenticado e navega para /pagina-inicial', async () => {
    await router.navigate(['/pagina-inicial']);
    expect(router.url).toContain('/login');
  });

  it('rota /login deve ser acessível sem autenticação', async () => {
    await router.navigate(['/login']);
    expect(router.url).toContain('/login');
  });
});
