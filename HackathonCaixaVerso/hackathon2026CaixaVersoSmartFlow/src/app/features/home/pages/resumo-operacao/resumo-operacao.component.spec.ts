import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePtBr from '@angular/common/locales/pt';
import { ResumoOperacaoComponent } from './resumo-operacao.component';

registerLocaleData(localePtBr, 'pt-BR');

describe('ResumoOperacaoComponent', () => {
  let fixture: ComponentFixture<ResumoOperacaoComponent>;
  let component: ResumoOperacaoComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumoOperacaoComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [{ provide: LOCALE_ID, useValue: 'pt-BR' }],
    }).compileComponents();

    fixture = TestBed.createComponent(ResumoOperacaoComponent);
    component = fixture.componentInstance;
    component.valorSolicitado = 100000;
    component.prazoMeses = 12;
    component.taxaMensal = 1.5;
    component.carenciaMeses = 0;
    component.garantias = [];
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('valorParcela deve ser maior que zero quando há prazo e taxa', () => {
    expect(component.valorParcela).toBeGreaterThan(0);
  });

  it('valorParcela deve ser zero quando prazoMeses é zero', () => {
    component.prazoMeses = 0;
    expect(component.valorParcela).toBe(0);
  });

  it('valorParcela deve ser zero quando taxaMensal é zero', () => {
    component.taxaMensal = 0;
    expect(component.valorParcela).toBe(0);
  });

  it('iof deve ser calculado sobre o valor solicitado', () => {
    const iofEsperado = 100000 * (0.0038 + 0.000082 * 12 * 30);
    expect(component.iof).toBeCloseTo(iofEsperado, 2);
  });

  it('tac deve ser 1.5% do valor solicitado', () => {
    expect(component.tac).toBeCloseTo(100000 * 0.015, 2);
  });

  it('valorLiberado deve descontar iof e tac', () => {
    expect(component.valorLiberado).toBeCloseTo(100000 - component.iof - component.tac, 2);
  });

  it('valorTotalPago deve ser parcela vezes prazo', () => {
    expect(component.valorTotalPago).toBeCloseTo(component.valorParcela * 12, 2);
  });

  it('totalJuros deve ser valorTotalPago menos valorSolicitado', () => {
    expect(component.totalJuros).toBeCloseTo(component.valorTotalPago - 100000, 2);
  });

  it('totalGarantias deve ser zero sem garantias', () => {
    expect(component.totalGarantias).toBe(0);
  });

  it('totalGarantias deve somar valores das garantias', () => {
    component.garantias = [{ id: '1', descricao: 'Imóvel', valor: 50000 }, { id: '2', descricao: 'Veículo', valor: 20000 }];
    expect(component.totalGarantias).toBe(70000);
  });

  it('deve emitir evento voltar', () => {
    let emitido = false;
    component.voltar.subscribe(() => (emitido = true));
    component.voltar.emit();
    expect(emitido).toBe(true);
  });

  it('deve emitir evento gerarMinuta', () => {
    let emitido = false;
    component.gerarMinuta.subscribe(() => (emitido = true));
    component.gerarMinuta.emit();
    expect(emitido).toBe(true);
  });

  it('dataProposta deve ser uma string de data não vazia', () => {
    expect(component.dataProposta).toBeTruthy();
    expect(component.dataProposta.length).toBeGreaterThan(0);
  });
});
