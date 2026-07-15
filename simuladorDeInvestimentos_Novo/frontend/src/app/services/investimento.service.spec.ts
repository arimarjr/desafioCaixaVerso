import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { InvestimentoService } from './investimento.service';
import { SimulacaoPayload, SimulacaoResult } from '../models/simulacao.model';
import { PerfilRisco } from '../models/perfil-risco.model';

describe('InvestimentoService', () => {
  let service: InvestimentoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [InvestimentoService]
    });

    service = TestBed.inject(InvestimentoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => expect(service).toBeTruthy());

  it('login should post credentials and return token', () => {
    const mockToken = { token: '12345' };
    service.login('usuario@email.com', 'senha123').subscribe(res => {
      expect(res.token).toBe('12345');
    });
    const req = httpMock.expectOne('http://localhost:3000/autenticacao/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockToken);
  });

  it('getPerfilRisco should call correct URL', () => {
    const mockPerfil: PerfilRisco = { perfil: 'Conservador' } as any;
    service.getPerfilRisco(1).subscribe(res => expect(res.perfil).toBe('Conservador'));
    const req = httpMock.expectOne('http://localhost:3000/perfil-risco/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockPerfil);
  });

  it('getHistoricoInvestimentos should call correct URL', () => {
    service.getHistoricoInvestimentos(1).subscribe(res => expect(res.length).toBe(0));
    const req = httpMock.expectOne('http://localhost:3000/investimentos/1');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('simularInvestimento should post payload and return result', () => {
    const payload: SimulacaoPayload = { valor: 1000, prazoMeses: 12, tipo: 'CDB' };
    const mockResult: SimulacaoResult = { valorFinal: 1100 } as any;

    service.simularInvestimento(payload).subscribe(res => {
      expect(res.valorFinal).toBe(1100);
    });

    const req = httpMock.expectOne('http://localhost:3000/simular-investimento');
    expect(req.request.method).toBe('POST');
    req.flush(mockResult);
  });

  it('getProdutosRecomendados should call correct URL with perfil', () => {
    const mockProdutos = [{ nome: 'Produto1' }];
    service.getProdutosRecomendados('Conservador').subscribe(res => {
      expect(res.length).toBe(1);
    });
    const req = httpMock.expectOne('http://localhost:3000/produtos-recomendados/Conservador');
    expect(req.request.method).toBe('GET');
    req.flush(mockProdutos);
  });
});
