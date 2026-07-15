import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CreditoPjFacade } from '../../facade/credito-pj.facade';
import { ContratoMinutaComponent } from './contrato-minuta.component';

const mockFacade = {
  gerarContrato: vi.fn(),
  contratoGerando: vi.fn().mockReturnValue(false),
  contratoGerado: vi.fn().mockReturnValue(null),
  erro: vi.fn().mockReturnValue(null),
  limparContrato: vi.fn(),
};

describe('ContratoMinutaComponent', () => {
  let fixture: ComponentFixture<ContratoMinutaComponent>;
  let component: ContratoMinutaComponent;

  beforeEach(async () => {
    mockFacade.gerarContrato.mockClear();

    await TestBed.configureTestingModule({
      imports: [ContratoMinutaComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: CreditoPjFacade, useValue: mockFacade },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContratoMinutaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve aceitar @Input valorSolicitado', () => {
    component.valorSolicitado = 75000;
    expect(component.valorSolicitado).toBe(75000);
  });

  it('valorParcela deve ser 0 quando prazoMeses é 0', () => {
    component.prazoMeses = 0;
    component.taxaMensal = 1.5;
    expect(component.valorParcela).toBe(0);
  });

  it('valorParcela deve ser 0 quando taxaMensal é 0', () => {
    component.prazoMeses = 12;
    component.taxaMensal = 0;
    expect(component.valorParcela).toBe(0);
  });

  it('valorParcela deve ser calculado quando há prazo e taxa', () => {
    component.valorSolicitado = 60000;
    component.prazoMeses = 24;
    component.taxaMensal = 1.5;
    expect(component.valorParcela).toBeGreaterThan(0);
  });

  it('valorTotal deve ser valorParcela * prazoMeses', () => {
    component.valorSolicitado = 60000;
    component.prazoMeses = 24;
    component.taxaMensal = 1.5;
    expect(component.valorTotal).toBeCloseTo(component.valorParcela * 24, 2);
  });

  it('gerarContrato não deve chamar facade quando vm é null', () => {
    component.vm = null;
    component.gerarContrato();
    expect(mockFacade.gerarContrato).not.toHaveBeenCalled();
  });

  it('gerarContrato deve chamar facade.gerarContrato quando vm está definido', () => {
    component.vm = { razaoSocial: 'Empresa Teste', cnpj: '11222333000181', socios: [] };
    component.linhaCredito = 'Capital de Giro';
    component.valorSolicitado = 50000;
    component.prazoMeses = 24;
    component.taxaMensal = 1.5;
    component.gerarContrato();
    expect(mockFacade.gerarContrato).toHaveBeenCalled();
  });

  it('socios deve retornar — quando vm não tem sócios', () => {
    component.vm = null;
    expect(component.socios).toBe('—');
  });

  it('socios deve retornar lista formatada quando vm tem sócios', () => {
    component.vm = { socios: [{ nome: 'João Silva', cpf: '123.456.789-00' }] };
    expect(component.socios).toContain('João Silva');
  });

  it('deve emitir evento voltar', () => {
    let emitido = false;
    component.voltar.subscribe(() => (emitido = true));
    component.voltar.emit();
    expect(emitido).toBe(true);
  });

  it('assinaturaModalAberta deve iniciar como false', () => {
    expect(component.assinaturaModalAberta()).toBe(false);
  });

  it('assinaturaStatus deve iniciar como idle', () => {
    expect(component.assinaturaStatus()).toBe('idle');
  });

  it('iniciarAssinaturaDigital deve abrir modal e setar status aguardando', () => {
    component.iniciarAssinaturaDigital();
    expect(component.assinaturaModalAberta()).toBe(true);
    expect(component.assinaturaStatus()).toBe('aguardando');
  });

  it('fecharAssinatura deve fechar modal e resetar status para idle', () => {
    component.iniciarAssinaturaDigital();
    component.fecharAssinatura();
    expect(component.assinaturaModalAberta()).toBe(false);
    expect(component.assinaturaStatus()).toBe('idle');
  });

  it('imprimirContrato deve chamar window.print quando elemento ccb não existe', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    component.imprimirContrato();
    expect(printSpy).toHaveBeenCalled();
  });

  it('dataVencimento deve ser uma data futura quando prazoMeses > 0', () => {
    component.prazoMeses = 12;
    const vencimento = component.dataVencimento;
    expect(vencimento.getTime()).toBeGreaterThan(new Date().getTime());
  });
});
