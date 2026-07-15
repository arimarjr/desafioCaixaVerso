import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { CadastroPjDataAccess } from './cadastro-pj.data-access';
import { EmpresaMockDto } from '../models/empresa.dto';

const mockEmpresaDto: EmpresaMockDto = {
  cadastroEmpresa: {
    cnpj: '11222333000181',
    razaoSocial: 'Empresa Teste LTDA',
    nomeFantasia: 'Empresa Teste',
    cnaePrincipal: '6201500',
    descricaoCnaePrincipal: 'Desenvolvimento de software',
    naturezaJuridica: 'Sociedade Limitada - LTDA',
    porteCaixa: 'EPP',
    dataConstituicao: '2015-03-10',
    capitalSocial: 100000,
    restricaoCadastral: false,
    endereco: {
      logradouro: 'Av. Paulista',
      numero: '1000',
      complemento: '',
      bairro: 'Bela Vista',
      municipio: 'São Paulo',
      uf: 'SP',
      cep: '01310100',
    },
    contatos: {
      telefoneComercial: '1133333333',
      emailPrincipal: 'contato@empresa.com',
    },
  } as any,
  representantesLegais: {
    socios: [
      {
        id: '1',
        nomeSocio: 'Ana Lima',
        cpf: '12345678901',
        percentualParticipacaoSocietaria: 100,
        dataIngresso: '2015-03-10',
      } as any,
    ],
  } as any,
};

const mockDadosAdministrativos = {
  dataReferencia: '2024-01-01',
  documentoFaturamento: '1' as const,
  dataUltimaAtualizacaoContratual: '2024-01-01',
  alterouSociosMaior50: false,
  excluiuAdministradoresAnteriores: false,
  alterouObjetoSocial: false,
  alterouCnaePrincipal: false,
  alterouMunicipio: false,
  deixouSerSociedadeSimples: false,
  pvResponsavel: 'c123456',
};

describe('CadastroPjDataAccess', () => {
  let service: CadastroPjDataAccess;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CadastroPjDataAccess,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(CadastroPjDataAccess);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── buscarEmpresaReceita ──────────────────────────────────────────────────

  it('deve chamar GET /api/empresas/:cnpj com CNPJ limpo', () => {
    service.buscarEmpresaReceita('11.222.333/0001-81').subscribe();

    const req = httpMock.expectOne('/api/empresas/11222333000181');
    expect(req.request.method).toBe('GET');
    req.flush(mockEmpresaDto);
  });

  it('deve remover máscara do CNPJ antes de chamar a API', () => {
    service.buscarEmpresaReceita('11.222.333/0001-81').subscribe();

    const req = httpMock.expectOne('/api/empresas/11222333000181');
    req.flush(mockEmpresaDto);
  });

  it('deve mapear resposta mock para DTO da Receita Federal', (done) => {
    service.buscarEmpresaReceita('11222333000181').subscribe((dto) => {
      expect(dto.cnpj).toBe('11222333000181');
      expect(dto.razao_social).toBe('Empresa Teste LTDA');
      expect(dto.situacao_cadastral).toBe('ATIVA');
      done();
    });

    httpMock.expectOne('/api/empresas/11222333000181').flush(mockEmpresaDto);
  });

  it('deve mapear sócios do QSA corretamente', (done) => {
    service.buscarEmpresaReceita('11222333000181').subscribe((dto) => {
      expect(dto.qsa).toHaveLength(1);
      expect(dto.qsa[0].nome_socio_razao_social).toBe('Ana Lima');
      expect(dto.qsa[0].percentual_capital_social).toBe(100);
      done();
    });

    httpMock.expectOne('/api/empresas/11222333000181').flush(mockEmpresaDto);
  });

  it('deve mapear empresa com restrição cadastral como INAPTA', (done) => {
    const dtoComRestricao = {
      ...mockEmpresaDto,
      cadastroEmpresa: { ...mockEmpresaDto.cadastroEmpresa, restricaoCadastral: true },
    };

    service.buscarEmpresaReceita('11222333000181').subscribe((dto) => {
      expect(dto.situacao_cadastral).toBe('INAPTA');
      done();
    });

    httpMock.expectOne('/api/empresas/11222333000181').flush(dtoComRestricao);
  });

  it('deve propagar erro HTTP', () => {
    let erroCapturado: unknown;
    service.buscarEmpresaReceita('99999999000199').subscribe({ error: (e) => (erroCapturado = e) });

    httpMock.expectOne('/api/empresas/99999999000199').flush(
      {},
      { status: 404, statusText: 'Not Found' }
    );

    expect(erroCapturado).toBeTruthy();
  });

  // ── avaliarEmpresa ────────────────────────────────────────────────────────

  it('deve chamar POST /api/avaliacoes/avaliar com CNPJ limpo', () => {
    service.avaliarEmpresa('11.222.333/0001-81', mockDadosAdministrativos).subscribe();

    const req = httpMock.expectOne('/api/avaliacoes/avaliar');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.cnpj).toBe('11222333000181');
    req.flush({ resultado: 'APROVADO', justificativa: 'Ok', limiteAprovado: 100000, classificacaoRisco: 'A', scoreInterno: 850, dataAvaliacao: '2024-01-01' });
  });

  it('deve enviar payload com dados administrativos corretos', () => {
    service.avaliarEmpresa('11222333000181', mockDadosAdministrativos).subscribe();

    const req = httpMock.expectOne('/api/avaliacoes/avaliar');
    expect(req.request.body.dadosAdministrativos.documentoFaturamento).toBe('1');
    expect(req.request.body.dadosAdministrativos.pvResponsavel).toBe('c123456');
    req.flush({ resultado: 'APROVADO', justificativa: 'Ok', limiteAprovado: 100000, classificacaoRisco: 'A', scoreInterno: 850, dataAvaliacao: '2024-01-01' });
  });

  it('deve mapear DTO de avaliação para ViewModel', (done) => {
    service.avaliarEmpresa('11222333000181', mockDadosAdministrativos).subscribe((vm) => {
      expect(vm.resultado).toBe('APROVADO');
      expect(vm.limiteAprovado).toBe(100000);
      expect(vm.scoreInterno).toBe(850);
      done();
    });

    httpMock.expectOne('/api/avaliacoes/avaliar').flush({
      resultado: 'APROVADO',
      justificativa: 'Boa situação',
      limiteAprovado: 100000,
      classificacaoRisco: 'A',
      scoreInterno: 850,
      dataAvaliacao: '2024-01-01',
    });
  });

  it('deve tratar resultado REPROVADO corretamente', (done) => {
    service.avaliarEmpresa('11222333000181', mockDadosAdministrativos).subscribe((vm) => {
      expect(vm.resultado).toBe('REPROVADO');
      expect(vm.limiteAprovado).toBeNull();
      done();
    });

    httpMock.expectOne('/api/avaliacoes/avaliar').flush({
      resultado: 'REPROVADO',
      justificativa: 'Restrições cadastrais',
      limiteAprovado: null,
      classificacaoRisco: 'E',
      scoreInterno: 200,
      dataAvaliacao: '2024-01-01',
    });
  });

  // ── buscarCep ─────────────────────────────────────────────────────────────

  it('deve chamar API do ViaCEP com CEP limpo', () => {
    service.buscarCep('01310-100').subscribe();

    const req = httpMock.expectOne('https://viacep.com.br/ws/01310100/json/');
    expect(req.request.method).toBe('GET');
    req.flush({ logradouro: 'Av. Paulista', bairro: 'Bela Vista', localidade: 'São Paulo', uf: 'SP' });
  });

  it('deve retornar null quando CEP tem menos de 8 dígitos', (done) => {
    service.buscarCep('0131').subscribe((result) => {
      expect(result).toBeNull();
      done();
    });
  });

  it('deve retornar endereço quando CEP válido', (done) => {
    service.buscarCep('01310100').subscribe((result) => {
      expect(result?.logradouro).toBe('Av. Paulista');
      done();
    });

    httpMock.expectOne('https://viacep.com.br/ws/01310100/json/').flush({
      logradouro: 'Av. Paulista', bairro: 'Bela Vista', localidade: 'São Paulo', uf: 'SP',
    });
  });

  it('deve retornar null quando ViaCEP retorna erro: true', (done) => {
    service.buscarCep('00000000').subscribe((result) => {
      expect(result).toBeNull();
      done();
    });

    httpMock.expectOne('https://viacep.com.br/ws/00000000/json/').flush({ erro: true });
  });

  it('deve retornar null quando ViaCEP retorna erro HTTP', (done) => {
    service.buscarCep('00000000').subscribe((result) => {
      expect(result).toBeNull();
      done();
    });

    httpMock.expectOne('https://viacep.com.br/ws/00000000/json/').flush(
      {},
      { status: 400, statusText: 'Bad Request' }
    );
  });
});
