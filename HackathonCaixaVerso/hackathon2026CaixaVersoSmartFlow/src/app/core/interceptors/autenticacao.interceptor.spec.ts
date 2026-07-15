import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpContext } from '@angular/common/http';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { autenticacaoInterceptor } from './autenticacao.interceptor';
import { AutenticacaoStore } from '../store/autenticacao.store';
import { AutenticacaoService } from '../services/autenticacao.service';
import { SKIP_AUTH_REDIRECT } from './skip-auth-redirect.token';
import { LoginResponseDto } from '../models/autenticacao.dto';

const mockRefreshResponse: LoginResponseDto = {
  accessToken: 'novo-token',
  expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
  usuario: { matricula: 'c1', nome: 'X Y', perfil: 'G' },
};

describe('autenticacaoInterceptor', () => {
  let httpMock: HttpTestingController;
  let http: HttpClient;
  let storeMock: Partial<AutenticacaoStore>;
  let authServiceMock: Partial<AutenticacaoService>;
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  function setup(token: string | null = null, refreshFn?: () => any) {
    storeMock = {
      accessToken: vi.fn().mockReturnValue(token) as any,
      limpar: vi.fn(),
    };
    authServiceMock = {
      refresh: refreshFn
        ? vi.fn().mockImplementation(refreshFn)
        : vi.fn().mockReturnValue(of(mockRefreshResponse)),
    };
    routerMock = { navigate: vi.fn().mockResolvedValue(true) };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([autenticacaoInterceptor])),
        provideHttpClientTesting(),
        { provide: AutenticacaoStore, useValue: storeMock },
        { provide: AutenticacaoService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
  }

  afterEach(() => httpMock.verify());

  it('deve adicionar withCredentials: true em todas as requisiÃ§Ãµes', () => {
    setup(null);
    http.get('/api/dados').subscribe();

    const req = httpMock.expectOne('/api/dados');
    expect(req.request.withCredentials).toBe(true);
    req.flush({});
  });

  it('deve adicionar Authorization: Bearer quando hÃ¡ token', () => {
    setup('token-valido');
    http.get('/api/protegido').subscribe();

    const req = httpMock.expectOne('/api/protegido');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-valido');
    req.flush({});
  });

  it('nÃ£o deve adicionar Authorization em endpoint /auth/login', () => {
    setup('token-valido');
    http.post('/api/auth/login', {}).subscribe();

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('nÃ£o deve adicionar Authorization em endpoint /auth/refresh', () => {
    setup('token-valido');
    http.post('/api/auth/refresh', {}).subscribe();

    const req = httpMock.expectOne('/api/auth/refresh');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('nÃ£o deve adicionar Authorization em endpoint /auth/logout', () => {
    setup('token-valido');
    http.post('/api/auth/logout', {}).subscribe();

    const req = httpMock.expectOne('/api/auth/logout');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('nÃ£o deve adicionar Authorization quando nÃ£o hÃ¡ token', () => {
    setup(null);
    http.get('/api/protegido').subscribe();

    const req = httpMock.expectOne('/api/protegido');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('deve tentar refresh ao receber 401 em rota protegida', () => {
    setup('token-expirado');
    http.get('/api/dados').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/api/dados');
    req.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(authServiceMock.refresh).toHaveBeenCalled();

    httpMock.expectOne('/api/dados').flush({ retentativa: true });
  });

  it('deve repetir a requisiÃ§Ã£o com novo token apÃ³s refresh bem-sucedido', () => {
    setup('token-expirado');
    let resultado: unknown;
    http.get('/api/dados').subscribe((r) => (resultado = r));

    httpMock.expectOne('/api/dados').flush({}, { status: 401, statusText: 'Unauthorized' });

    const retry = httpMock.expectOne('/api/dados');
    expect(retry.request.headers.get('Authorization')).toBe('Bearer novo-token');
    retry.flush({ ok: true });

    expect(resultado).toEqual({ ok: true });
  });

  it('deve limpar o store quando o refresh falha', () => {
    setup('token-expirado', () => throwError(() => new Error('Refresh failed')));
    http.get('/api/dados').subscribe({ error: () => {} });

    httpMock.expectOne('/api/dados').flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(storeMock.limpar).toHaveBeenCalled();
  });

  it('deve redirecionar para /login quando refresh falha sem SKIP_AUTH_REDIRECT', () => {
    setup('token-expirado', () => throwError(() => new Error('Refresh failed')));
    http.get('/api/dados').subscribe({ error: () => {} });

    httpMock.expectOne('/api/dados').flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('nÃ£o deve redirecionar quando SKIP_AUTH_REDIRECT estÃ¡ ativo', () => {
    setup('token-expirado', () => throwError(() => new Error('Refresh failed')));
    const ctx = new HttpContext().set(SKIP_AUTH_REDIRECT, true);
    http.get('/api/dados', { context: ctx }).subscribe({ error: () => {} });

    httpMock.expectOne('/api/dados').flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('deve propagar erros nÃ£o-401 sem tentar refresh', () => {
    setup('token');
    let err: unknown;
    http.get('/api/dados').subscribe({ error: (e) => (err = e) });

    httpMock.expectOne('/api/dados').flush({}, { status: 500, statusText: 'Server Error' });

    expect(authServiceMock.refresh).not.toHaveBeenCalled();
    expect((err as any).status).toBe(500);
  });

  it('nÃ£o deve tentar refresh em erro 401 do prÃ³prio endpoint /auth/login', () => {
    setup('token');
    http.post('/api/auth/login', {}).subscribe({ error: () => {} });

    httpMock.expectOne('/api/auth/login').flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(authServiceMock.refresh).not.toHaveBeenCalled();
  });
});
