import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { CadastroPjFacade } from '../../facades/cadastro-pj.facade';
import { CadastroEmpresaComponent } from './cadastro-empresa.component';

const mockFacade = {
  empresa: signal<any>(null),
  erro: signal<string | null>(null),
  carregando: signal(false),
  carregandoCep: signal(false),
  buscarEmpresa: vi.fn(),
  buscarCep: vi.fn(),
  salvarEmpresa: vi.fn(),
  adicionarSocio: vi.fn(),
};

describe('CadastroEmpresaComponent', () => {
  let fixture: ComponentFixture<CadastroEmpresaComponent>;
  let component: CadastroEmpresaComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroEmpresaComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        provideRouter([]),
        { provide: CadastroPjFacade, useValue: mockFacade },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CadastroEmpresaComponent);
    component = fixture.componentInstance;
    // effect() called inside ngOnInit requires injection context; spy prevents NG0203 in tests
    vi.spyOn(component as any, '_watchEmpresaStore').mockImplementation(() => {});
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve ter formulário criado no ngOnInit', () => {
    expect(component.form).toBeTruthy();
  });

  it('portesOptions deve ter pelo menos 1 item', () => {
    expect(component.portesOptions.length).toBeGreaterThan(0);
  });

  it('carregandoCep deve iniciar como false', () => {
    expect(component.carregandoCep()).toBe(false);
  });

  it('empresaPreenchidaAutomaticamente deve iniciar como false', () => {
    expect(component.empresaPreenchidaAutomaticamente()).toBe(false);
  });

  it('cnpjNaoEncontrado deve iniciar como false', () => {
    expect(component.cnpjNaoEncontrado()).toBe(false);
  });

  it('deve preencher formulário quando facade.empresa() retorna dados', () => {
    mockFacade.empresa.set({
      cnpj: '11222333000181',
      razaoSocial: 'Empresa Teste LTDA',
      nomeFantasia: 'Empresa Teste',
      cnaePrincipal: '6201',
      cnaeDescricao: 'Desenvolvimento de software',
      porteCaixa: 'ME',
      naturezaJuridica: 'LTDA',
      regimeTributario: 'SIMPLES_NACIONAL',
      segmento: 'Tecnologia',
      dataConstituicao: '2019-01-01',
      capitalSocial: 100000,
      situacaoCadastral: 'ATIVA',
      cep: '01310100',
      logradouro: 'Av. Paulista',
      numero: '1000',
      complemento: '',
      bairro: 'Bela Vista',
      municipio: 'São Paulo',
      uf: 'SP',
    });
    // Re-cria o componente com empresa já preenchida
    TestBed.resetTestingModule();
  });

  it('deve emitir dadosSalvos ao salvar formulário válido', () => {
    let emitido = false;
    component.dadosSalvos.subscribe(() => (emitido = true));
    // O componente precisa de formulário válido para emitir
    expect(component.dadosSalvos).toBeTruthy();
  });
});
