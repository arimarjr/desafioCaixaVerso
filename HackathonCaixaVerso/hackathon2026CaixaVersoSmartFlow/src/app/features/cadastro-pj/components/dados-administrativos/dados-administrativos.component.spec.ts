import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DadosAdministrativosComponent } from './dados-administrativos.component';

describe('DadosAdministrativosComponent', () => {
  let fixture: ComponentFixture<DadosAdministrativosComponent>;
  let component: DadosAdministrativosComponent;

  const empresaMock: any = {
    cnpj: '11222333000181', razaoSocial: 'Empresa Teste', nomeFantasia: 'Teste',
    situacaoCadastral: 'ATIVA', dataAbertura: '2000-01-01',
    cnaePrincipal: { codigo: '6201500', descricao: 'Desenvolvimento' },
    cnaeSecundarios: [], naturezaJuridica: { codigo: '2062', descricao: 'Ltda' },
    endereco: { logradouro: 'Rua A', numero: '1', complemento: '', bairro: 'Centro',
      municipio: 'SP', uf: 'SP', cep: '01001000' },
    socios: [], capitalSocial: 100000, porteEmpresa: 'ME',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DadosAdministrativosComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DadosAdministrativosComponent);
    component = fixture.componentInstance;
    component.empresa = empresaMock;
    component.socios = [];
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve aceitar @Input empresa', () => {
    expect(component.empresa.cnpj).toBe('11222333000181');
  });

  it('deve aceitar @Input socios vazio', () => {
    expect(component.socios).toEqual([]);
  });

  it('solicitarAvaliacao deve emitir evento avaliacaoSolicitada', () => {
    let emitido: any;
    component.avaliacaoSolicitada.subscribe((v) => (emitido = v));

    component.solicitarAvaliacao();

    expect(emitido).toBeDefined();
    expect(emitido.pvResponsavel).toBe('');
    expect(emitido.alterouSociosMaior50).toBe(false);
  });

  it('solicitarAvaliacao deve incluir dataReferencia no payload', () => {
    let emitido: any;
    component.avaliacaoSolicitada.subscribe((v) => (emitido = v));
    component.solicitarAvaliacao();
    expect(emitido.dataReferencia).toBeTruthy();
  });
});
