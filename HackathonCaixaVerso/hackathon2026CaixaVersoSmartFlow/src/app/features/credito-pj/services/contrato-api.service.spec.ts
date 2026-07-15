import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ContratoApiService } from './contrato-api.service';
import { GerarContratoRequest, GerarContratoResponse } from '../models/contrato.model';

const mockRequest: GerarContratoRequest = {
  simulacaoId: 'sim-abc-123',
  formato: 'PDF',
  razaoSocial: 'Empresa Teste LTDA',
  cnpj: '11222333000181',
  linhaCredito: 'Capital de Giro',
  valorSolicitado: 50000,
  prazoMeses: 24,
  taxaMensal: 1.5,
};

const mockResponse: GerarContratoResponse = {
  contratoId: 'contrato-xyz',
  simulacaoId: 'sim-abc-123',
  nomeArquivo: 'contrato-11222333000181.pdf',
  formato: 'PDF',
  status: 'GERADO',
  hashDocumento: 'abc123hash',
  dataGeracao: '2024-01-01T00:00:00Z',
};

describe('ContratoApiService', () => {
  let service: ContratoApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ContratoApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ContratoApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── gerarContrato ─────────────────────────────────────────────────────────

  it('deve chamar POST /api/contratos/gerar', () => {
    service.gerarContrato(mockRequest).subscribe();

    const req = httpMock.expectOne('/api/contratos/gerar');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('deve enviar o payload correto', () => {
    service.gerarContrato(mockRequest).subscribe();

    const req = httpMock.expectOne('/api/contratos/gerar');
    expect(req.request.body).toEqual(mockRequest);
    req.flush(mockResponse);
  });

  it('deve retornar GerarContratoResponse com contratoId', (done) => {
    service.gerarContrato(mockRequest).subscribe((res) => {
      expect(res.contratoId).toBe('contrato-xyz');
      expect(res.hashDocumento).toBe('abc123hash');
      done();
    });

    httpMock.expectOne('/api/contratos/gerar').flush(mockResponse);
  });

  it('deve enviar cnpj, razaoSocial e linhaCredito corretos', () => {
    service.gerarContrato(mockRequest).subscribe();

    const req = httpMock.expectOne('/api/contratos/gerar');
    expect(req.request.body.cnpj).toBe('11222333000181');
    expect(req.request.body.razaoSocial).toBe('Empresa Teste LTDA');
    expect(req.request.body.linhaCredito).toBe('Capital de Giro');
    req.flush(mockResponse);
  });

  it('deve propagar erro 400', () => {
    let err: unknown;
    service.gerarContrato(mockRequest).subscribe({ error: (e) => (err = e) });

    httpMock.expectOne('/api/contratos/gerar').flush(
      { message: 'Dados inválidos' },
      { status: 400, statusText: 'Bad Request' }
    );

    expect((err as any).status).toBe(400);
  });

  it('deve propagar erro 500', () => {
    let err: unknown;
    service.gerarContrato(mockRequest).subscribe({ error: (e) => (err = e) });

    httpMock.expectOne('/api/contratos/gerar').flush(
      {},
      { status: 500, statusText: 'Internal Server Error' }
    );

    expect((err as any).status).toBe(500);
  });

  it('deve enviar valorSolicitado, prazoMeses e taxaMensal', () => {
    service.gerarContrato(mockRequest).subscribe();

    const req = httpMock.expectOne('/api/contratos/gerar');
    expect(req.request.body.valorSolicitado).toBe(50000);
    expect(req.request.body.prazoMeses).toBe(24);
    expect(req.request.body.taxaMensal).toBe(1.5);
    req.flush(mockResponse);
  });

  // ── baixarContratoPdf ─────────────────────────────────────────────────────

  it('deve chamar GET /api/contratos/simulacoes/:id/pdf', () => {
    service.baixarContratoPdf('sim-abc-123').subscribe();

    const req = httpMock.expectOne('/api/contratos/simulacoes/sim-abc-123/pdf');
    expect(req.request.method).toBe('GET');
    req.flush(new Blob(['%PDF'], { type: 'application/pdf' }));
  });

  it('deve fazer encode da simulacaoId na URL', () => {
    service.baixarContratoPdf('sim/com/barras').subscribe();

    const req = httpMock.expectOne('/api/contratos/simulacoes/sim%2Fcom%2Fbarras/pdf');
    req.flush(new Blob([], { type: 'application/pdf' }));
  });

  it('deve retornar Blob no download do PDF', () => {
    return new Promise<void>((resolve) => {
      service.baixarContratoPdf('sim-123').subscribe((blob) => {
        expect(blob).toBeInstanceOf(Blob);
        resolve();
      });

      httpMock.expectOne('/api/contratos/simulacoes/sim-123/pdf').flush(
        new Blob(['%PDF'], { type: 'application/pdf' })
      );
    });
  });

  it('deve propagar erro 404 no download', () => {
    let err: unknown;
    service.baixarContratoPdf('nao-existe').subscribe({ error: (e) => (err = e) });

    httpMock.expectOne('/api/contratos/simulacoes/nao-existe/pdf').error(
      new ProgressEvent('error'),
      { status: 404, statusText: 'Not Found' }
    );

    expect((err as any).status).toBe(404);
  });
});
