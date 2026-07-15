import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PesquisasService } from '../../services/pesquisas.service';
import { PesquisasListaComponent } from './pesquisas-lista.component';

const mockPesquisasService = {
  uploadDocumento: vi.fn().mockReturnValue(of({ nomeSalvo: 'arquivo_salvo.pdf' })),
};

const mockSnackBar = {
  open: vi.fn(),
};

describe('PesquisasListaComponent', () => {
  let fixture: ComponentFixture<PesquisasListaComponent>;
  let component: PesquisasListaComponent;

  beforeEach(async () => {
    mockPesquisasService.uploadDocumento.mockReset();
    mockPesquisasService.uploadDocumento.mockReturnValue(of({ nomeSalvo: 'arquivo_salvo.pdf' }));
    mockSnackBar.open.mockClear();

    await TestBed.configureTestingModule({
      imports: [PesquisasListaComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: PesquisasService, useValue: mockPesquisasService },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    })
      .overrideProvider(MatSnackBar, { useValue: mockSnackBar })
      .overrideProvider(PesquisasService, { useValue: mockPesquisasService })
      .compileComponents();

    fixture = TestBed.createComponent(PesquisasListaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve inicializar lista de pesquisas ao setar cnpj', () => {
    fixture.componentRef.setInput('cnpj', '11222333000181');
    fixture.detectChanges();
    expect(component.pesquisas().length).toBeGreaterThan(0);
  });

  it('totalSelecionadas deve contar pesquisas selecionadas', () => {
    fixture.componentRef.setInput('cnpj', '11222333000181');
    fixture.detectChanges();
    const total = component.pesquisas().filter(p => p.selecionada).length;
    expect(component.totalSelecionadas()).toBe(total);
  });

  it('alternarTodas(false) deve desmarcar todas', () => {
    fixture.componentRef.setInput('cnpj', '11222333000181');
    fixture.detectChanges();
    component.alternarTodas(false);
    expect(component.totalSelecionadas()).toBe(0);
  });

  it('alternarTodas(true) deve marcar todas', () => {
    fixture.componentRef.setInput('cnpj', '11222333000181');
    fixture.detectChanges();
    component.alternarTodas(false);
    component.alternarTodas(true);
    expect(component.todasMarcadas()).toBe(true);
  });

  it('alternarPesquisa deve alterar seleção de pesquisa específica', () => {
    fixture.componentRef.setInput('cnpj', '11222333000181');
    fixture.detectChanges();
    const id = component.pesquisas()[0].id;
    component.alternarPesquisa(id, false);
    const pesquisa = component.pesquisas().find(p => p.id === id);
    expect(pesquisa?.selecionada).toBe(false);
  });

  it('efetuarPesquisas deve chamar snackBar quando nenhuma selecionada', () => {
    fixture.componentRef.setInput('cnpj', '11222333000181');
    fixture.detectChanges();
    component.alternarTodas(false);
    component.efetuarPesquisas();
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      expect.stringContaining('Selecione'),
      expect.any(String),
      expect.any(Object),
    );
  });

  it('efetuarPesquisas deve chamar window.open para selecionadas', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    fixture.componentRef.setInput('cnpj', '11222333000181');
    fixture.detectChanges();
    component.alternarTodas(true);
    component.efetuarPesquisas();
    expect(openSpy).toHaveBeenCalled();
  });

  it('grupos deve retornar grupos únicos', () => {
    fixture.componentRef.setInput('cnpj', '11222333000181');
    fixture.detectChanges();
    const gruposUnicos = new Set(component.pesquisas().map(p => p.grupo));
    expect(component.grupos().length).toBe(gruposUnicos.size);
  });

  it('todasMarcadas deve ser true quando todas marcadas', () => {
    fixture.componentRef.setInput('cnpj', '11222333000181');
    fixture.detectChanges();
    component.alternarTodas(true);
    expect(component.todasMarcadas()).toBe(true);
  });

  it('uploadArquivo deve chamar snackBar ao enviar PDF não-PDF', () => {
    const mockFile = new File(['content'], 'test.docx', { type: 'application/msword' });
    const input = document.createElement('input');
    Object.defineProperty(input, 'files', { value: [mockFile] });
    const event = { target: input } as unknown as Event;

    const pesquisa = component.pesquisas()[0];
    component.uploadArquivo(event, pesquisa);

    expect(mockSnackBar.open).toHaveBeenCalledWith(
      expect.stringContaining('PDF'),
      expect.any(String),
      expect.any(Object),
    );
  });

  it('uploadArquivo deve chamar pesquisasService.uploadDocumento com PDF', () => {
    fixture.componentRef.setInput('cnpj', '11222333000181');
    fixture.detectChanges();

    const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    const input = document.createElement('input');
    Object.defineProperty(input, 'files', { value: [mockFile] });
    const event = { target: input } as unknown as Event;

    const pesquisa = component.pesquisas()[0];
    component.uploadArquivo(event, pesquisa);

    expect(mockPesquisasService.uploadDocumento).toHaveBeenCalled();
  });

  it('uploadArquivo deve chamar snackBar de erro quando upload falha', () => {
    mockPesquisasService.uploadDocumento.mockReturnValue(throwError(() => new Error('fail')));
    fixture.componentRef.setInput('cnpj', '11222333000181');
    fixture.detectChanges();

    const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    const input = document.createElement('input');
    Object.defineProperty(input, 'files', { value: [mockFile] });
    const event = { target: input } as unknown as Event;

    component.uploadArquivo(event, component.pesquisas()[0]);

    expect(mockSnackBar.open).toHaveBeenCalledWith(
      expect.stringContaining('Erro'),
      expect.any(String),
      expect.any(Object),
    );
  });

  it('parcialmenteMarcadas deve ser true quando algumas marcadas', () => {
    fixture.componentRef.setInput('cnpj', '11222333000181');
    fixture.detectChanges();
    component.alternarTodas(false);
    component.alternarPesquisa(component.pesquisas()[0].id, true);
    expect(component.parcialmenteMarcadas()).toBe(true);
  });

  it('atualizarIdentificadorEmpresa deve atualizar o identificador', () => {
    component.atualizarIdentificadorEmpresa('NOVO-ID');
    expect(component.identificadorEmpresa()).toBe('NOVO-ID');
  });

  it('atualizarIdentificadorEmpresa com vazio deve usar fallback', () => {
    component.atualizarIdentificadorEmpresa('');
    expect(component.identificadorEmpresa()).toBe('EMPRESA-SEM-IDENTIFICADOR');
  });
});
