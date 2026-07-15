import { TestBed } from '@angular/core/testing';
import { AutenticacaoStore } from './autenticacao.store';
import { UsuarioSessaoVm } from '../models/autenticacao.vm';

const mockUsuario: UsuarioSessaoVm = {
  matricula: 'c123456',
  nome: 'João Silva Souza',
  nomeAbreviado: 'João Souza',
  perfil: 'GERENTE',
  expiresAt: new Date(Date.now() + 3_600_000),
};

describe('AutenticacaoStore', () => {
  let store: AutenticacaoStore;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [AutenticacaoStore] });
    store = TestBed.inject(AutenticacaoStore);
  });

  afterEach(() => sessionStorage.clear());

  // ── Estado inicial ────────────────────────────────────────────────────────

  it('deve ter estado inicial não autenticado', () => {
    expect(store.autenticado()).toBe(false);
    expect(store.accessToken()).toBeNull();
    expect(store.usuario()).toBeNull();
    expect(store.carregando()).toBe(false);
    expect(store.erro()).toBeNull();
  });

  it('nomeUsuario deve retornar string vazia quando não autenticado', () => {
    expect(store.nomeUsuario()).toBe('');
  });

  it('perfilUsuario deve retornar string vazia quando não autenticado', () => {
    expect(store.perfilUsuario()).toBe('');
  });

  // ── definirSessao ─────────────────────────────────────────────────────────

  it('deve autenticar ao chamar definirSessao', () => {
    store.definirSessao('token-abc', mockUsuario);

    expect(store.autenticado()).toBe(true);
    expect(store.accessToken()).toBe('token-abc');
    expect(store.usuario()).toEqual(mockUsuario);
    expect(store.carregando()).toBe(false);
    expect(store.erro()).toBeNull();
  });

  it('definirSessao deve salvar token e usuário no sessionStorage', () => {
    store.definirSessao('token-xyz', mockUsuario);

    expect(sessionStorage.getItem('pj_access_token')).toBe('token-xyz');
    const salvo = JSON.parse(sessionStorage.getItem('pj_usuario')!);
    expect(salvo.matricula).toBe(mockUsuario.matricula);
  });

  it('nomeUsuario deve retornar nomeAbreviado após autenticação', () => {
    store.definirSessao('t', mockUsuario);
    expect(store.nomeUsuario()).toBe('João Souza');
  });

  it('perfilUsuario deve retornar perfil após autenticação', () => {
    store.definirSessao('t', mockUsuario);
    expect(store.perfilUsuario()).toBe('GERENTE');
  });

  // ── atualizarToken ────────────────────────────────────────────────────────

  it('deve atualizar token sem alterar estado de loading', () => {
    store.definirSessao('token-original', mockUsuario);
    const usuarioAtualizado = { ...mockUsuario, perfil: 'DIRETOR' };
    store.atualizarToken('token-novo', usuarioAtualizado);

    expect(store.accessToken()).toBe('token-novo');
    expect(store.usuario()?.perfil).toBe('DIRETOR');
  });

  it('atualizarToken deve persistir no sessionStorage', () => {
    store.definirSessao('t1', mockUsuario);
    store.atualizarToken('t2', mockUsuario);
    expect(sessionStorage.getItem('pj_access_token')).toBe('t2');
  });

  // ── iniciarCarregamento ───────────────────────────────────────────────────

  it('iniciarCarregamento deve setar carregando=true e limpar erro', () => {
    store.definirErro('algum erro');
    store.iniciarCarregamento();

    expect(store.carregando()).toBe(true);
    expect(store.erro()).toBeNull();
  });

  // ── definirErro ───────────────────────────────────────────────────────────

  it('definirErro deve setar mensagem de erro e parar carregamento', () => {
    store.iniciarCarregamento();
    store.definirErro('Matrícula ou senha incorretos.');

    expect(store.erro()).toBe('Matrícula ou senha incorretos.');
    expect(store.carregando()).toBe(false);
  });

  // ── limpar ────────────────────────────────────────────────────────────────

  it('limpar deve resetar todo o estado', () => {
    store.definirSessao('t', mockUsuario);
    store.limpar();

    expect(store.autenticado()).toBe(false);
    expect(store.accessToken()).toBeNull();
    expect(store.usuario()).toBeNull();
    expect(store.carregando()).toBe(false);
    expect(store.erro()).toBeNull();
  });

  it('limpar deve remover dados do sessionStorage', () => {
    store.definirSessao('t', mockUsuario);
    store.limpar();

    expect(sessionStorage.getItem('pj_access_token')).toBeNull();
    expect(sessionStorage.getItem('pj_usuario')).toBeNull();
  });

  // ── Recuperação de sessão ─────────────────────────────────────────────────

  it('deve restaurar sessão válida do sessionStorage na construção', () => {
    sessionStorage.setItem('pj_access_token', 'token-salvo');
    sessionStorage.setItem('pj_usuario', JSON.stringify(mockUsuario));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [AutenticacaoStore] });
    const novoStore = TestBed.inject(AutenticacaoStore);

    expect(novoStore.autenticado()).toBe(true);
    expect(novoStore.accessToken()).toBe('token-salvo');
  });

  it('não deve restaurar sessão expirada do sessionStorage', () => {
    const expirado = { ...mockUsuario, expiresAt: new Date(Date.now() - 1000) };
    sessionStorage.setItem('pj_access_token', 'token-exp');
    sessionStorage.setItem('pj_usuario', JSON.stringify(expirado));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [AutenticacaoStore] });
    const novoStore = TestBed.inject(AutenticacaoStore);

    expect(novoStore.autenticado()).toBe(false);
  });

  it('não deve quebrar quando sessionStorage está vazio', () => {
    expect(() => store).not.toThrow();
    expect(store.autenticado()).toBe(false);
  });

  it('não deve quebrar quando sessionStorage contém JSON inválido', () => {
    sessionStorage.setItem('pj_access_token', 't');
    sessionStorage.setItem('pj_usuario', '{INVALID}');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [AutenticacaoStore] });
    expect(() => TestBed.inject(AutenticacaoStore)).not.toThrow();
  });
});
