import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { PesquisasService, UploadDocumentoPayload } from './pesquisas.service';
import { UploadPesquisaResponse } from '../models/upload-pesquisa-response.model';

const mockResponse: UploadPesquisaResponse = {
  pesquisaId: 'pesq-abc',
  nomeArquivo: 'documento.pdf',
  status: 'ENVIADO',
  dataEnvio: '2024-01-01T10:00:00Z',
};

function criarArquivoPdf(nome = 'documento.pdf', tamanhoKb = 100): File {
  const conteudo = new Uint8Array(tamanhoKb * 1024);
  return new File([conteudo], nome, { type: 'application/pdf' });
}

describe('PesquisasService', () => {
  let service: PesquisasService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PesquisasService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(PesquisasService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── uploadDocumento ───────────────────────────────────────────────────────

  it('deve chamar POST /api/pesquisas-documentos/upload', () => {
    const payload: UploadDocumentoPayload = {
      identificadorEmpresa: '11222333000181',
      pesquisaId: 'pesq-001',
      nomePesquisa: 'Certidão Federal',
      arquivo: criarArquivoPdf(),
    };

    service.uploadDocumento(payload).subscribe();

    const req = httpMock.expectOne('/api/pesquisas-documentos/upload');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('deve enviar FormData com o arquivo', () => {
    const arquivo = criarArquivoPdf('certidao.pdf');
    const payload: UploadDocumentoPayload = {
      identificadorEmpresa: '11222333000181',
      pesquisaId: 'pesq-001',
      nomePesquisa: 'Certidão Federal',
      arquivo,
    };

    service.uploadDocumento(payload).subscribe();

    const req = httpMock.expectOne('/api/pesquisas-documentos/upload');
    expect(req.request.body).toBeInstanceOf(FormData);
    expect((req.request.body as FormData).get('arquivo')).toBeInstanceOf(File);
    req.flush(mockResponse);
  });

  it('deve incluir identificadorEmpresa no FormData', () => {
    const payload: UploadDocumentoPayload = {
      identificadorEmpresa: '11222333000181',
      pesquisaId: 'pesq-001',
      nomePesquisa: 'Certidão Federal',
      arquivo: criarArquivoPdf(),
    };

    service.uploadDocumento(payload).subscribe();

    const req = httpMock.expectOne('/api/pesquisas-documentos/upload');
    const formData = req.request.body as FormData;
    expect(formData.get('identificadorEmpresa')).toBe('11222333000181');
    req.flush(mockResponse);
  });

  it('deve incluir pesquisaId no FormData', () => {
    const payload: UploadDocumentoPayload = {
      identificadorEmpresa: '11222333000181',
      pesquisaId: 'pesq-001',
      nomePesquisa: 'Certidão Federal',
      arquivo: criarArquivoPdf(),
    };

    service.uploadDocumento(payload).subscribe();

    const req = httpMock.expectOne('/api/pesquisas-documentos/upload');
    const formData = req.request.body as FormData;
    expect(formData.get('pesquisaId')).toBe('pesq-001');
    req.flush(mockResponse);
  });

  it('deve incluir nomePesquisa no FormData', () => {
    const payload: UploadDocumentoPayload = {
      identificadorEmpresa: '11222333000181',
      pesquisaId: 'pesq-001',
      nomePesquisa: 'Certidão Federal',
      arquivo: criarArquivoPdf(),
    };

    service.uploadDocumento(payload).subscribe();

    const req = httpMock.expectOne('/api/pesquisas-documentos/upload');
    const formData = req.request.body as FormData;
    expect(formData.get('nomePesquisa')).toBe('Certidão Federal');
    req.flush(mockResponse);
  });

  it('deve retornar UploadPesquisaResponse no sucesso', (done) => {
    const payload: UploadDocumentoPayload = {
      identificadorEmpresa: '11222333000181',
      pesquisaId: 'pesq-001',
      nomePesquisa: 'Certidão Federal',
      arquivo: criarArquivoPdf(),
    };

    service.uploadDocumento(payload).subscribe((res) => {
      expect(res.pesquisaId).toBe('pesq-abc');
      expect(res.status).toBe('ENVIADO');
      done();
    });

    httpMock.expectOne('/api/pesquisas-documentos/upload').flush(mockResponse);
  });

  it('deve propagar erro 400', () => {
    let err: unknown;
    const payload: UploadDocumentoPayload = {
      identificadorEmpresa: '',
      pesquisaId: '',
      nomePesquisa: '',
      arquivo: criarArquivoPdf(),
    };

    service.uploadDocumento(payload).subscribe({ error: (e) => (err = e) });

    httpMock.expectOne('/api/pesquisas-documentos/upload').flush(
      { message: 'Arquivo inválido' },
      { status: 400, statusText: 'Bad Request' }
    );

    expect((err as any).status).toBe(400);
  });

  it('deve propagar erro 413 (arquivo muito grande)', () => {
    let err: unknown;
    const payload: UploadDocumentoPayload = {
      identificadorEmpresa: '11222333000181',
      pesquisaId: 'pesq-001',
      nomePesquisa: 'Arquivo',
      arquivo: criarArquivoPdf('grande.pdf', 20480), // 20MB
    };

    service.uploadDocumento(payload).subscribe({ error: (e) => (err = e) });

    httpMock.expectOne('/api/pesquisas-documentos/upload').flush(
      {},
      { status: 413, statusText: 'Payload Too Large' }
    );

    expect((err as any).status).toBe(413);
  });

  it('deve propagar erro 500', () => {
    let err: unknown;
    const payload: UploadDocumentoPayload = {
      identificadorEmpresa: '11222333000181',
      pesquisaId: 'pesq-001',
      nomePesquisa: 'Certidão Federal',
      arquivo: criarArquivoPdf(),
    };

    service.uploadDocumento(payload).subscribe({ error: (e) => (err = e) });

    httpMock.expectOne('/api/pesquisas-documentos/upload').flush(
      {},
      { status: 500, statusText: 'Internal Server Error' }
    );

    expect((err as any).status).toBe(500);
  });
});
