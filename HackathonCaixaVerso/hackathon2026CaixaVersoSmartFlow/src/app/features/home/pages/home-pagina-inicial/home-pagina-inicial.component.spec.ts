import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { HomePaginaInicialComponent } from './home-pagina-inicial.component';
import { DadosMockService } from '../../../../core/services/dados-mock.service';
import { AvaliacaoPersistenciaService } from '../../../../core/services/avaliacao-persistencia.service';

const mockDadosMock = {
  buscarEmpresa: vi.fn().mockReturnValue(of(null)),
  buscarEmpresaPorCNPJ: vi.fn().mockReturnValue(null),
};

const mockAvaliacaoSvc = {
  salvar: vi.fn(),
  carregar: vi.fn().mockReturnValue(null),
};

describe('HomePaginaInicialComponent', () => {
  let fixture: ComponentFixture<HomePaginaInicialComponent>;
  let component: HomePaginaInicialComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePaginaInicialComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: DadosMockService, useValue: mockDadosMock },
        { provide: AvaliacaoPersistenciaService, useValue: mockAvaliacaoSvc },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePaginaInicialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('empresaVm deve iniciar como null', () => {
    expect(component.empresaVm()).toBeNull();
  });

  it('carregando deve iniciar como false', () => {
    expect(component.carregando()).toBe(false);
  });

  it('erroNaoEncontrado deve iniciar como false', () => {
    expect(component.erroNaoEncontrado()).toBe(false);
  });

  it('stepAtivo deve iniciar como 0', () => {
    expect(component.stepAtivo()).toBe(0);
  });

  it('recomendacaoIa deve iniciar como null', () => {
    expect(component.recomendacaoIa()).toBeNull();
  });

  it('carregandoIa deve iniciar como false', () => {
    expect(component.carregandoIa()).toBe(false);
  });

  it('respostaIaEstruturada deve ser null quando recomendacaoIa é null', () => {
    expect(component.respostaIaEstruturada()).toBeNull();
  });

  it('etapas deve ter 6 itens', () => {
    expect(component.etapas.length).toBe(6);
  });

  // ── avancarEtapa ─────────────────────────────────────────────────────────

  it('avancarEtapa deve incrementar stepAtivo', () => {
    component.stepAtivo.set(0);
    component.avancarEtapa();
    expect(component.stepAtivo()).toBe(1);
  });

  it('avancarEtapa não deve ultrapassar o limite de etapas', () => {
    component.stepAtivo.set(5); // última etapa
    component.avancarEtapa();
    expect(component.stepAtivo()).toBe(5);
  });

  // ── irParaEtapa ───────────────────────────────────────────────────────────

  it('irParaEtapa deve navegar para etapa anterior ou atual', () => {
    component.stepAtivo.set(3);
    component.irParaEtapa(1);
    expect(component.stepAtivo()).toBe(1);
  });

  it('irParaEtapa não deve avançar para etapa à frente do passo atual', () => {
    component.stepAtivo.set(1);
    component.irParaEtapa(3);
    expect(component.stepAtivo()).toBe(1);
  });

  it('irParaEtapa para a etapa atual deve manter o step', () => {
    component.stepAtivo.set(2);
    component.irParaEtapa(2);
    expect(component.stepAtivo()).toBe(2);
  });

  // ── sociosParaPesquisa ────────────────────────────────────────────────────

  it('sociosParaPesquisa deve retornar array vazio quando empresaVm é null', () => {
    component.empresaVm.set(null);
    expect(component.sociosParaPesquisa()).toEqual([]);
  });

  it('sociosParaPesquisa deve mapear socios da empresaVm', () => {
    component.empresaVm.set({
      socios: [{ nome: 'João', cpf: '111.444.777-35', status: 'ok' }],
    } as any);
    const socios = component.sociosParaPesquisa();
    expect(socios.length).toBe(1);
    expect(socios[0].nome).toBe('João');
    expect(socios[0].cpf).toBe('111.444.777-35');
  });

  // ── aoReceberCnpj + HTTP ───────────────────────────────────────────────────

  it('aoReceberCnpj deve marcar carregando como true e limpar erro', () => {
    const httpMock = TestBed.inject(HttpTestingController);

    component.erroNaoEncontrado.set(true);
    component.aoReceberCnpj('11222333000181');
    expect(component.carregando()).toBe(true);
    expect(component.erroNaoEncontrado()).toBe(false);

    // Abort pending requests cleanly (catchError handles the error)
    httpMock.match(() => true).forEach(r => r.error(new ErrorEvent('network error')));
  });
});
