import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CadastroPjFacade } from '../../facades/cadastro-pj.facade';
import { ListaSociosComponent } from './lista-socios.component';

const mockSocios = signal<any[]>([]);
const mockTotalParticipacao = signal(0);

const mockFacade = {
  socios: mockSocios,
  totalParticipacao: mockTotalParticipacao,
  adicionarSocio: vi.fn(),
  atualizarSocio: vi.fn(),
  removerSocio: vi.fn(),
};

const mockDialog = {
  open: vi.fn().mockReturnValue({ afterClosed: () => of(undefined) }),
};

describe('ListaSociosComponent', () => {
  let fixture: ComponentFixture<ListaSociosComponent>;
  let component: ListaSociosComponent;

  beforeEach(async () => {
    mockSocios.set([]);
    mockTotalParticipacao.set(0);
    mockFacade.adicionarSocio.mockClear();
    mockFacade.removerSocio.mockClear();
    mockDialog.open.mockClear();
    mockDialog.open.mockReturnValue({ afterClosed: () => of(undefined) });

    await TestBed.configureTestingModule({
      imports: [ListaSociosComponent, NoopAnimationsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: CadastroPjFacade, useValue: mockFacade },
      ],
    })
      .overrideProvider(MatDialog, { useValue: mockDialog })
      .compileComponents();

    fixture = TestBed.createComponent(ListaSociosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('participacaoValida deve ser true quando não há sócios', () => {
    mockSocios.set([]);
    mockTotalParticipacao.set(0);
    fixture.detectChanges();
    expect(component.participacaoValida()).toBe(true);
  });

  it('participacaoValida deve ser true quando participação soma 100', () => {
    mockSocios.set([{ id: '1', nome: 'João', participacao: 100 }] as any[]);
    mockTotalParticipacao.set(100);
    fixture.detectChanges();
    expect(component.participacaoValida()).toBe(true);
  });

  it('participacaoValida deve ser false quando participação não soma 100', () => {
    mockSocios.set([{ id: '1', nome: 'João', participacao: 50 }] as any[]);
    mockTotalParticipacao.set(50);
    fixture.detectChanges();
    expect(component.participacaoValida()).toBe(false);
  });

  it('incluirSocio deve abrir o dialog MatDialog', () => {
    component.incluirSocio();
    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('removerSocio deve chamar facade.removerSocio quando confirmado', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    component.removerSocio('socio-id-1');
    expect(mockFacade.removerSocio).toHaveBeenCalledWith('socio-id-1');
  });

  it('removerSocio não deve chamar facade.removerSocio quando cancelado', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    component.removerSocio('socio-id-1');
    expect(mockFacade.removerSocio).not.toHaveBeenCalled();
  });

  it('incluirSocio deve chamar facade.adicionarSocio ao fechar com dados', () => {
    const novoSocio = { id: '2', nome: 'Maria', participacao: 50 };
    mockDialog.open.mockReturnValue({ afterClosed: () => of(novoSocio) });
    component.incluirSocio();
    expect(mockFacade.adicionarSocio).toHaveBeenCalledWith(novoSocio);
  });

  it('editarSocio deve abrir o dialog com dados do sócio', () => {
    const socio = { id: '1', nome: 'João', participacao: 100 } as any;
    mockDialog.open.mockReturnValue({ afterClosed: () => of(undefined) });
    component.editarSocio(socio);
    expect(mockDialog.open).toHaveBeenCalled();
    const openArgs = mockDialog.open.mock.calls[mockDialog.open.mock.calls.length - 1];
    expect(openArgs[1].data).toEqual(socio);
  });

  it('editarSocio deve chamar facade.atualizarSocio ao fechar com dados', () => {
    const socioAtualizado = { id: '1', nome: 'João Atualizado', participacao: 100 };
    mockDialog.open.mockReturnValue({ afterClosed: () => of(socioAtualizado) });
    component.editarSocio({ id: '1', nome: 'João', participacao: 100 } as any);
    expect(mockFacade.atualizarSocio).toHaveBeenCalledWith(socioAtualizado);
  });
});
