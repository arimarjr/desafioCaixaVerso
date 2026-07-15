import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AutenticacaoService } from './autenticacao.service';
import { AutenticacaoStore } from '../store/autenticacao.store';
import { LoginResponseDto } from '../models/autenticacao.dto';

const mockLoginResponse: LoginResponseDto = {
  accessToken: 'access-token-123',
  expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
  usuario: {
    matricula: 'c123456',
    nome: 'Maria Fernanda Lima',
    perfil: 'GERENTE',
  },
};

describe('AutenticacaoService', () => {
  let service: AutenticacaoService;
  let httpMock: HttpTestingController;
  let store: AutenticacaoStore;
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    routerMock = { navigate: vi.fn().mockResolvedValue(true) };
    sessionStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        AutenticacaoService,
        AutenticacaoStore,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerMock },
      ],
    });

    service = TestBed.inject(AutenticacaoService);
    httpMock = TestBed.inject(HttpTestingController);
    store = TestBed.inject(AutenticacaoStore);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  // ── login ─────────────────────────────────────────────────────────────────

  it('deve chamar endpoint POST /api/auth/login com matrícula e senha', () => {
    service.login('c123456', 'senha123').subscribe();

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ matricula: 'c123456', senha: 'senha123' });
    req.flush(mockLoginResponse);
  });

  it('deve usar withCredentials: true no login', () => {
    service.login('c123456', 'senha').subscribe();

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.withCredentials).toBe(true);
    req.flush(mockLoginResponse);
  });

  it('deve atualizar o store após login bem-sucedido', () => {
    service.login('c123456', 'senha').subscribe();

    const req = httpMock.expectOne('/api/auth/login');
    req.flush(mockLoginResponse);

    expect(store.autenticado()).toBe(true);
    expect(store.accessToken()).toBe('access-token-123');
  });

  it('deve mapear nome para nomeAbreviado (primeiro + último nome)', () => {
    service.login('c123456', 'senha').subscribe();

    const req = httpMock.expectOne('/api/auth/login');
    req.flush(mockLoginResponse);

    expect(store.nomeUsuario()).toBe('Maria Lima');
  });

  it('deve manter nome completo quando usuário tem apenas um nome', () => {
    service.login('c123456', 'senha').subscribe();

    const req = httpMock.expectOne('/api/auth/login');
    req.flush({ ...mockLoginResponse, usuario: { ...mockLoginResponse.usuario, nome: 'Rodrigo' } });

    expect(store.nomeUsuario()).toBe('Rodrigo');
  });

  it('deve propagar erro HTTP do login', () => {
    let erroCapturado: unknown;
    service.login('c123456', 'errada').subscribe({
      error: (e) => (erroCapturado = e),
    });

    const req = httpMock.expectOne('/api/auth/login');
    req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(erroCapturado).toBeTruthy();
  });

  it('deve retornar void no sucesso do login', (done) => {
    service.login('c123456', 'senha').subscribe((result) => {
      expect(result).toBeUndefined();
      done();
    });

    httpMock.expectOne('/api/auth/login').flush(mockLoginResponse);
  });

  // ── refresh ───────────────────────────────────────────────────────────────

  it('deve chamar endpoint POST /api/auth/refresh', () => {
    service.refresh().subscribe();

    const req = httpMock.expectOne('/api/auth/refresh');
    expect(req.request.method).toBe('POST');
    req.flush(mockLoginResponse);
  });

  it('deve usar withCredentials: true no refresh', () => {
    service.refresh().subscribe();

    const req = httpMock.expectOne('/api/auth/refresh');
    expect(req.request.withCredentials).toBe(true);
    req.flush(mockLoginResponse);
  });

  it('deve atualizar token no store após refresh', () => {
    service.refresh().subscribe();

    httpMock.expectOne('/api/auth/refresh').flush(mockLoginResponse);

    expect(store.accessToken()).toBe('access-token-123');
  });

  it('deve retornar LoginResponseDto no refresh', (done) => {
    service.refresh().subscribe((res) => {
      expect(res.accessToken).toBe('access-token-123');
      done();
    });

    httpMock.expectOne('/api/auth/refresh').flush(mockLoginResponse);
  });

  // ── logout ────────────────────────────────────────────────────────────────

  it('deve chamar endpoint POST /api/auth/logout', () => {
    service.logout().subscribe();

    const req = httpMock.expectOne('/api/auth/logout');
    expect(req.request.method).toBe('POST');
    req.flush(null);
  });

  it('deve usar withCredentials: true no logout', () => {
    service.logout().subscribe();

    const req = httpMock.expectOne('/api/auth/logout');
    expect(req.request.withCredentials).toBe(true);
    req.flush(null);
  });

  it('deve limpar o store após logout', () => {
    store.definirSessao('tok', {
      matricula: 'c1', nome: 'X', nomeAbreviado: 'X',
      perfil: 'G', expiresAt: new Date(),
    });

    service.logout().subscribe();
    httpMock.expectOne('/api/auth/logout').flush(null);

    expect(store.autenticado()).toBe(false);
  });

  it('deve redirecionar para /login após logout (via finalize)', () => {
    service.logout().subscribe();
    httpMock.expectOne('/api/auth/logout').flush(null);

    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  // ── verificarSessao ───────────────────────────────────────────────────────

  it('deve chamar GET /api/auth/me', () => {
    service.verificarSessao().subscribe();

    const req = httpMock.expectOne('/api/auth/me');
    expect(req.request.method).toBe('GET');
    req.flush({ matricula: 'c123456', nome: 'X', perfil: 'G' });
  });

  it('deve usar withCredentials: true no verificarSessao', () => {
    service.verificarSessao().subscribe();

    const req = httpMock.expectOne('/api/auth/me');
    expect(req.request.withCredentials).toBe(true);
    req.flush({ matricula: 'c123456', nome: 'X', perfil: 'G' });
  });

  it('deve propagar erro 401 do verificarSessao', () => {
    let err: unknown;
    service.verificarSessao().subscribe({ error: (e) => (err = e) });

    httpMock.expectOne('/api/auth/me').flush(
      {},
      { status: 401, statusText: 'Unauthorized' }
    );

    expect(err).toBeTruthy();
  });

  it('deve propagar erro 500 do verificarSessao', () => {
    let err: unknown;
    service.verificarSessao().subscribe({ error: (e) => (err = e) });

    httpMock.expectOne('/api/auth/me').flush(
      {},
      { status: 500, statusText: 'Internal Server Error' }
    );

    expect(err).toBeTruthy();
  });
});
