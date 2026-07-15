import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CabecalhoHeaderComponent } from './cabecalho-header.component';
import { AutenticacaoStore } from '../../store/autenticacao.store';
import { AutenticacaoService } from '../../services/autenticacao.service';

const mockStore = {
  usuario: vi.fn().mockReturnValue({ nome: 'Ana Lima', nomeAbreviado: 'Ana Lima', perfil: 'G' }),
  autenticado: vi.fn().mockReturnValue(true),
  accessToken: vi.fn().mockReturnValue('tok'),
  carregando: vi.fn().mockReturnValue(false),
  erro: vi.fn().mockReturnValue(null),
  nomeUsuario: vi.fn().mockReturnValue('Ana Lima'),
};

const mockAuthService = { logout: vi.fn().mockReturnValue({ subscribe: vi.fn() }) };

describe('CabecalhoHeaderComponent', () => {
  let fixture: ComponentFixture<CabecalhoHeaderComponent>;
  let component: CabecalhoHeaderComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CabecalhoHeaderComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AutenticacaoStore, useValue: mockStore },
        { provide: AutenticacaoService, useValue: mockAuthService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CabecalhoHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('menuAberto deve iniciar como false', () => {
    expect(component.menuAberto).toBe(false);
  });

  it('toggle deve alternar menuAberto', () => {
    component.toggle(undefined as any);
    expect(component.menuAberto).toBe(true);
    component.toggle(undefined as any);
    expect(component.menuAberto).toBe(false);
  });

  it('fecharMenu deve setar menuAberto como false', () => {
    component.menuAberto = true;
    component.fecharMenu();
    expect(component.menuAberto).toBe(false);
  });

  it('dadosCabecalho deve retornar nome do usuário do store', () => {
    expect(component.dadosCabecalho.user.name).toBe('Ana Lima');
  });

  it('botoesCabecalho deve ter botão Sair', () => {
    const botaoSair = component.botoesCabecalho.find(b => b.label === 'Sair');
    expect(botaoSair).toBeDefined();
  });

  it('handler Sair deve chamar authService.logout', () => {
    component.handlersBotoes['Sair']();
    expect(mockAuthService.logout).toHaveBeenCalled();
  });

  it('onDocumentClick deve ignorar clique quando _skipNextDocumentClick é true', () => {
    component.menuAberto = true;
    (component as any)._skipNextDocumentClick = true;
    component.onDocumentClick();
    expect((component as any)._skipNextDocumentClick).toBe(false);
    expect(component.menuAberto).toBe(true);
  });

  it('onDocumentClick deve fechar menu quando menuAberto é true', () => {
    component.menuAberto = true;
    (component as any)._skipNextDocumentClick = false;
    component.onDocumentClick();
    expect(component.menuAberto).toBe(false);
  });

  it('onDocumentClick não deve alterar menu quando já está fechado', () => {
    component.menuAberto = false;
    (component as any)._skipNextDocumentClick = false;
    component.onDocumentClick();
    expect(component.menuAberto).toBe(false);
  });
});
