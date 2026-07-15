import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { EMPTY, of, Subject, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { LoginComponent } from './login.component';
import { AutenticacaoService } from '../../../../core/services/autenticacao.service';
import { AutenticacaoStore } from '../../../../core/store/autenticacao.store';

function criarMockStore(
  overrides: { carregando?: boolean; erro?: string | null } = {}
) {
  return {
    carregando: vi.fn().mockReturnValue(overrides.carregando ?? false) as any,
    erro: vi.fn().mockReturnValue(overrides.erro ?? null) as any,
    iniciarCarregamento: vi.fn(),
    definirErro: vi.fn(),
    limpar: vi.fn(),
  };
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let storeMock: ReturnType<typeof criarMockStore>;
  let authMock: { login: ReturnType<typeof vi.fn> };

  function configurar(
    storeOpts: Parameters<typeof criarMockStore>[0] = {},
    loginRetorno: any = EMPTY
  ) {
    storeMock = criarMockStore(storeOpts);
    authMock = { login: vi.fn().mockReturnValue(loginRetorno) };

    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([
          { path: 'pagina-inicial', component: LoginComponent },
          { path: 'login', component: LoginComponent },
        ]),
        { provide: AutenticacaoStore, useValue: storeMock },
        { provide: AutenticacaoService, useValue: authMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: { get: vi.fn().mockReturnValue(null) } },
          },
        },
      ],
    });

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  afterEach(() => TestBed.resetTestingModule());

  // ── Criação ───────────────────────────────────────────────────────────────

  it('deve criar o componente', () => {
    configurar();
    expect(component).toBeTruthy();
  });

  // ── Estado inicial do formulário ──────────────────────────────────────────

  it('formulário deve iniciar inválido', () => {
    configurar();
    expect(component.form.invalid).toBe(true);
  });

  it('campo matrícula deve ser obrigatório', () => {
    configurar();
    const ctrl = component.form.get('matricula')!;
    ctrl.setValue('');
    expect(ctrl.hasError('required')).toBe(true);
  });

  it('campo senha deve ser obrigatório', () => {
    configurar();
    const ctrl = component.form.get('senha')!;
    ctrl.setValue('');
    expect(ctrl.hasError('required')).toBe(true);
  });

  it('matrícula no formato inválido deve ter erro de padrão', () => {
    configurar();
    component.form.get('matricula')!.setValue('a999999');
    expect(component.form.get('matricula')!.hasError('pattern')).toBe(true);
  });

  it('matrícula no formato c000000 deve ser válida', () => {
    configurar();
    component.form.get('matricula')!.setValue('c123456');
    expect(component.form.get('matricula')!.valid).toBe(true);
  });

  it('matrícula no formato C000000 maiúsculo deve ser válida', () => {
    configurar();
    component.form.get('matricula')!.setValue('C654321');
    expect(component.form.get('matricula')!.valid).toBe(true);
  });

  it('formulário válido quando matrícula e senha preenchidos', () => {
    configurar();
    component.form.setValue({ matricula: 'c123456', senha: 'minhasenha' });
    expect(component.form.valid).toBe(true);
  });

  // ── Template ──────────────────────────────────────────────────────────────

  it('deve exibir erro de matrícula inválida quando tocado', () => {
    configurar();
    component.form.get('matricula')!.setValue('invalido');
    component.form.get('matricula')!.markAsTouched();
    fixture.detectChanges();

    const el = fixture.nativeElement.querySelector('.campo-erro');
    expect(el).not.toBeNull();
  });

  it('não deve exibir erro antes do campo ser tocado', () => {
    configurar();
    const erros = fixture.nativeElement.querySelectorAll('.campo-erro');
    expect(erros.length).toBe(0);
  });

  it('input de matrícula deve ter id e label associados', () => {
    configurar();
    const input = fixture.nativeElement.querySelector('#matricula');
    const label = fixture.nativeElement.querySelector('label[for="matricula"]');
    expect(input).not.toBeNull();
    expect(label).not.toBeNull();
  });

  it('input de senha deve ter id e label associados', () => {
    configurar();
    const input = fixture.nativeElement.querySelector('#senha');
    const label = fixture.nativeElement.querySelector('label[for="senha"]');
    expect(input).not.toBeNull();
    expect(label).not.toBeNull();
  });

  it('botão de submit deve existir', () => {
    configurar();
    const btn = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(btn).not.toBeNull();
  });

  it('formulário deve ter atributo novalidate', () => {
    configurar();
    const form = fixture.nativeElement.querySelector('form');
    expect(form.hasAttribute('novalidate')).toBe(true);
  });

  // ── Submit / fluxo de login ───────────────────────────────────────────────

  it('onSubmit não deve chamar o service quando formulário inválido', () => {
    configurar();
    component.onSubmit();
    expect(authMock.login).not.toHaveBeenCalled();
  });

  it('onSubmit deve chamar iniciarCarregamento quando formulário válido', () => {
    configurar({}, of(undefined));
    component.form.setValue({ matricula: 'c123456', senha: 'senha123' });
    component.onSubmit();

    expect(storeMock.iniciarCarregamento).toHaveBeenCalled();
  });

  it('onSubmit deve chamar authService.login com matrícula e senha', () => {
    configurar({}, of(undefined));
    component.form.setValue({ matricula: 'c123456', senha: 'minha123' });
    component.onSubmit();

    expect(authMock.login).toHaveBeenCalledWith('c123456', 'minha123');
  });

  it('múltiplos onSubmit simultâneos não disparam múltiplos logins (exhaustMap)', () => {
    // Subject que nunca completa mantém o exhaustMap ocupado
    const loginPendente = new Subject<void>();
    configurar({}, loginPendente.asObservable());
    component.form.setValue({ matricula: 'c123456', senha: 'senha' });
    component.onSubmit();
    component.onSubmit();
    component.onSubmit();

    // exhaustMap: apenas 1 chamada ao service enquanto o observable anterior ainda está ativo
    expect(authMock.login).toHaveBeenCalledTimes(1);
  });

  it('deve definir erro 401 com mensagem amigável', () => {
    const err401 = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    configurar({}, throwError(() => err401));

    component.form.setValue({ matricula: 'c123456', senha: 'errada' });
    component.onSubmit();

    expect(storeMock.definirErro).toHaveBeenCalledWith('Matrícula ou senha incorretos.');
  });

  it('deve definir erro 429 com mensagem de rate-limit', () => {
    const err429 = new HttpErrorResponse({ status: 429, statusText: 'Too Many Requests' });
    configurar({}, throwError(() => err429));

    component.form.setValue({ matricula: 'c123456', senha: 'senha' });
    component.onSubmit();

    expect(storeMock.definirErro).toHaveBeenCalledWith(
      'Muitas tentativas. Aguarde um minuto e tente novamente.'
    );
  });

  it('deve definir erro genérico para status 500', () => {
    const err500 = new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error' });
    configurar({}, throwError(() => err500));

    component.form.setValue({ matricula: 'c123456', senha: 'senha' });
    component.onSubmit();

    expect(storeMock.definirErro).toHaveBeenCalledWith(
      'Erro ao conectar ao servidor. Tente novamente.'
    );
  });
});

