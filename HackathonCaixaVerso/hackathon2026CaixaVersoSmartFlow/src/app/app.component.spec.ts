import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AppComponent } from './app.component';
import { AutenticacaoStore } from './core/store/autenticacao.store';
import { AutenticacaoService } from './core/services/autenticacao.service';

const mockStore = {
  usuario: vi.fn().mockReturnValue({ nome: 'Ana', nomeAbreviado: 'Ana', perfil: 'G' }),
  autenticado: vi.fn().mockReturnValue(true),
  accessToken: vi.fn().mockReturnValue('tok'),
  carregando: vi.fn().mockReturnValue(false),
  erro: vi.fn().mockReturnValue(null),
  nomeUsuario: vi.fn().mockReturnValue('Ana'),
};

const mockAuthService = { logout: vi.fn().mockReturnValue({ subscribe: vi.fn() }) };

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AutenticacaoStore, useValue: mockStore },
        { provide: AutenticacaoService, useValue: mockAuthService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('deve criar o componente raiz', () => {
    expect(component).toBeTruthy();
  });

  it('deve ter title igual a frontendAngular', () => {
    expect(component.title).toBe('frontendAngular');
  });
});
