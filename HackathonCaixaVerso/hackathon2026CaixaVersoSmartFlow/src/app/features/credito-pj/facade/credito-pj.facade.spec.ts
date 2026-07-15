import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { CreditoPjFacade, GerarContratoDados } from './credito-pj.facade';
import { ContratoApiService } from '../services/contrato-api.service';

const mockDados: GerarContratoDados = {
  razaoSocial: 'Empresa Teste LTDA',
  cnpj: '11222333000181',
  linhaCredito: 'Capital de Giro',
  valorSolicitado: 50000,
  prazoMeses: 24,
  taxaMensal: 1.5,
};

describe('CreditoPjFacade', () => {
  let facade: CreditoPjFacade;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CreditoPjFacade,
        ContratoApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    facade = TestBed.inject(CreditoPjFacade);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('deve criar a facade', () => {
    expect(facade).toBeTruthy();
  });

  it('contratoGerando deve iniciar como false', () => {
    expect(facade.contratoGerando()).toBe(false);
  });

  it('contratoGerado deve iniciar como null', () => {
    expect(facade.contratoGerado()).toBeNull();
  });

  it('erro deve iniciar como null', () => {
    expect(facade.erro()).toBeNull();
  });

  // ── gerarContrato ─────────────────────────────────────────────────────────

  it('gerarContrato deve enviar POST para /api/contratos/gerar', () => {
    facade.gerarContrato(mockDados);

    const req = httpMock.expectOne('/api/contratos/gerar');
    expect(req.request.method).toBe('POST');
    req.flush({
      contratoId: 'c1', simulacaoId: 's1', nomeArquivo: 'c.pdf',
      formato: 'PDF', status: 'GERADO', hashDocumento: 'h1', dataGeracao: '2026-01-01',
    });
  });

  it('após sucesso, contratoGerado deve ser populado', () => {
    facade.gerarContrato(mockDados);

    httpMock.expectOne('/api/contratos/gerar').flush({
      contratoId: 'c1', simulacaoId: 's1', nomeArquivo: 'c.pdf',
      formato: 'PDF', status: 'GERADO', hashDocumento: 'h1', dataGeracao: '2026-01-01',
    });

    expect(facade.contratoGerado()?.contratoId).toBe('c1');
    expect(facade.contratoGerando()).toBe(false);
    expect(facade.erro()).toBeNull();
  });

  it('após erro, facade deve popular sinal erro', () => {
    facade.gerarContrato(mockDados);

    httpMock.expectOne('/api/contratos/gerar').flush(
      {},
      { status: 500, statusText: 'Server Error' },
    );

    expect(facade.erro()).toBeTruthy();
    expect(facade.contratoGerando()).toBe(false);
  });

  it('gerarContrato não deve chamar API se já está gerando', () => {
    facade.gerarContrato(mockDados);
    facade.gerarContrato(mockDados); // segundo chamado ignorado

    // Deve haver apenas 1 requisição
    httpMock.expectOne('/api/contratos/gerar').flush({
      contratoId: 'c1', simulacaoId: 's1', nomeArquivo: 'c.pdf',
      formato: 'PDF', status: 'GERADO', hashDocumento: 'h1', dataGeracao: '2026-01-01',
    });
  });

  // ── limparContrato ────────────────────────────────────────────────────────

  it('limparContrato deve resetar contrato e erro', () => {
    facade.gerarContrato(mockDados);
    httpMock.expectOne('/api/contratos/gerar').flush({
      contratoId: 'c1', simulacaoId: 's1', nomeArquivo: 'c.pdf',
      formato: 'PDF', status: 'GERADO', hashDocumento: 'h1', dataGeracao: '2026-01-01',
    });

    facade.limparContrato();

    expect(facade.contratoGerado()).toBeNull();
    expect(facade.erro()).toBeNull();
  });
});
