import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { CadastroPjPageComponent } from './cadastro-pj-page.component';
import { CadastroPjFacade } from '../../facades/cadastro-pj.facade';
import { CadastroPjStore } from '../../store/cadastro-pj.store';
import { CadastroPjDataAccess } from '../../data-access/cadastro-pj.data-access';

const mockSocios = signal<any[]>([]);
const mockEmpresa = signal<any>(null);

const mockFacade = {
  empresa: mockEmpresa,
  socios: mockSocios,
  carregando: signal(false),
  possuiErro: signal(false),
  erro: signal<string | null>(null),
  carregandoCep: signal(false),
  etapaAtual: signal(0),
  totalParticipacao: signal(0),
  faturamentos: signal([]),
  empresaCarregada: signal(false),
  buscarEmpresa: vi.fn(),
  buscarCep: vi.fn(),
  salvarEmpresa: vi.fn(),
  adicionarSocio: vi.fn(),
  removerSocio: vi.fn(),
  atualizarSocio: vi.fn(),
  adicionarFaturamento: vi.fn(),
  removerFaturamento: vi.fn(),
  atualizarFaturamento: vi.fn(),
  avaliarEmpresa: vi.fn().mockReturnValue(of(null)),
  avancarEtapa: vi.fn(),
  definirErro: vi.fn(),
};

const mockDialog = {
  open: vi.fn().mockReturnValue({
    close: vi.fn(),
    afterClosed: () => of(undefined),
  }),
};

describe('CadastroPjPageComponent', () => {
  let fixture: ComponentFixture<CadastroPjPageComponent>;
  let component: CadastroPjPageComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroPjPageComponent, NoopAnimationsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => null } } },
        },
        { provide: CadastroPjFacade, useValue: mockFacade },
      ],
    })
      .overrideProvider(CadastroPjFacade, { useValue: mockFacade })
      .overrideProvider(CadastroPjStore, { useValue: {} })
      .overrideProvider(CadastroPjDataAccess, { useValue: {} })
      .overrideProvider(MatDialog, { useValue: mockDialog })
      .compileComponents();

    fixture = TestBed.createComponent(CadastroPjPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    fixture.detectChanges(); // stabilize ngAfterViewInit stepper init (NG0100)
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('cnpj deve iniciar como string vazia sem parâmetro na rota', () => {
    expect(component.cnpj()).toBe('');
  });

  it('carregando deve expor signal do facade', () => {
    expect(component.carregando()).toBe(false);
  });

  it('cpfsSociosParaPesquisa deve retornar array vazio quando sem sócios', () => {
    expect(component.cpfsSociosParaPesquisa).toEqual([]);
  });

  it('cpfsSociosParaPesquisa deve mapear cpf e nome dos sócios', () => {
    mockSocios.set([{ nome: 'João', cpf: '11144477735', participacao: 100 }]);
    expect(component.cpfsSociosParaPesquisa[0].nome).toBe('João');
    expect(component.cpfsSociosParaPesquisa[0].cpf).toBe('11144477735');
    mockSocios.set([]);
  });
});
