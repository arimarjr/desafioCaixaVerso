import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { AvaliacaoPersistenciaService, SalvarAvaliacaoPayload } from './avaliacao-persistencia.service';

const mockPayload: SalvarAvaliacaoPayload = {
  cnpj: '11222333000181',
  razaoSocial: 'Empresa Teste LTDA',
  nomeFantasia: 'Empresa Teste',
  segmento: 'Tecnologia',
  porteCaixa: 'ME',
  porteEmpresa: 'ME',
  ratingBadge: 'A',
  ratingAprovado: true,
  limiteGlobal: '100000',
  faturamentoAnual: '500000',
  nepj: '0',
  nepjClassificacao: 'Normal',
  tempoRelacionamento: '5 anos',
  possuiRestricao: false,
};

describe('AvaliacaoPersistenciaService', () => {
  let service: AvaliacaoPersistenciaService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AvaliacaoPersistenciaService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(AvaliacaoPersistenciaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('deve criar o serviço', () => {
    expect(service).toBeTruthy();
  });

  // ── salvar ────────────────────────────────────────────────────────────────

  it('salvar deve enviar POST para /api/avaliacoes', () => {
    service.salvar(mockPayload);

    const req = httpMock.expectOne('/api/avaliacoes');
    expect(req.request.method).toBe('POST');
    req.flush({ id: '1', dataHoraAvaliacao: '2026-01-01T00:00:00Z', ...mockPayload });
  });

  it('salvar deve enviar o payload correto', () => {
    service.salvar(mockPayload);

    const req = httpMock.expectOne('/api/avaliacoes');
    expect(req.request.body.cnpj).toBe('11222333000181');
    expect(req.request.body.razaoSocial).toBe('Empresa Teste LTDA');
    req.flush({ id: '1', dataHoraAvaliacao: '2026-01-01T00:00:00Z', ...mockPayload });
  });

  it('salvar deve silenciar erros HTTP (catchError → EMPTY)', () => {
    service.salvar(mockPayload);

    const req = httpMock.expectOne('/api/avaliacoes');
    req.flush({ message: 'Erro' }, { status: 500, statusText: 'Server Error' });
    // Não deve lançar exceção
    expect(true).toBe(true);
  });

  // ── listar ────────────────────────────────────────────────────────────────

  it('listar deve enviar GET para /api/avaliacoes', () => {
    service.listar().subscribe();

    const req = httpMock.expectOne('/api/avaliacoes');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('listar deve retornar array de avaliações', () => {
    const mockItems = [
      { id: '1', dataHoraAvaliacao: '2026-01-01T00:00:00Z', ...mockPayload },
    ];
    let resultado: any[] = [];

    service.listar().subscribe((items) => (resultado = items as any[]));

    httpMock.expectOne('/api/avaliacoes').flush(mockItems);
    expect(resultado.length).toBe(1);
    expect(resultado[0].id).toBe('1');
  });

  it('listar deve silenciar erros HTTP retornando EMPTY', () => {
    let erro: any = null;
    service.listar().subscribe({ error: (e) => (erro = e) });

    httpMock.expectOne('/api/avaliacoes').flush(
      { message: 'Erro' },
      { status: 500, statusText: 'Server Error' },
    );

    expect(erro).toBeNull();
  });
});
