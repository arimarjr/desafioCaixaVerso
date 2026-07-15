import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePtBr from '@angular/common/locales/pt';
import { GarantiasComponent } from './garantias.component';

registerLocaleData(localePtBr, 'pt-BR');

describe('GarantiasComponent', () => {
  let fixture: ComponentFixture<GarantiasComponent>;
  let component: GarantiasComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GarantiasComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [{ provide: LOCALE_ID, useValue: 'pt-BR' }],
    }).compileComponents();

    fixture = TestBed.createComponent(GarantiasComponent);
    component = fixture.componentInstance;
    component.valorContratado = 100000;
    component.linhaCredito = 'Capital de Giro';
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve ter formulário com campos tipoGarantia e valorGarantia', () => {
    expect(component.form.get('tipoGarantia')).toBeTruthy();
    expect(component.form.get('valorGarantia')).toBeTruthy();
  });

  it('garantiasAdicionadas deve iniciar vazia', () => {
    expect(component.garantiasAdicionadas().length).toBe(0);
  });

  it('totalEmGarantias deve iniciar como 0', () => {
    expect(component.totalEmGarantias()).toBe(0);
  });

  it('percentualCobertura deve iniciar como 0', () => {
    expect(component.percentualCobertura()).toBe(0);
  });

  it('totalPercentualBandeiras deve ser 0 quando nenhuma bandeira selecionada', () => {
    expect(component.totalPercentualBandeiras()).toBe(0);
  });

  it('valorMinimoGarantia deve ser 12.5% do valorContratado', () => {
    expect(component.valorMinimoGarantia).toBe(100000 * 0.125);
  });

  it('valorMinimoGarantiaTexto deve retornar string formatada', () => {
    expect(component.valorMinimoGarantiaTexto).toBeTruthy();
    expect(component.valorMinimoGarantiaTexto.length).toBeGreaterThan(0);
  });

  it('isFaturamentoCartao deve ser false quando tipoGarantia está vazio', () => {
    expect(component.isFaturamentoCartao).toBe(false);
  });

  it('isFaturamentoCartao deve ser true quando tipoGarantia é faturamento_cartao', () => {
    component.form.get('tipoGarantia')!.setValue('faturamento_cartao');
    expect(component.isFaturamentoCartao).toBe(true);
  });

  // ── toggleBandeira ──────────────────────────────────────────────────────

  it('toggleBandeira deve marcar bandeira como selecionada', () => {
    component.toggleBandeira('visa');
    const visa = component.bandeiras().find(b => b.id === 'visa');
    expect(visa?.selecionada).toBe(true);
  });

  it('toggleBandeira deve desmarcar bandeira já selecionada', () => {
    component.toggleBandeira('visa');
    component.toggleBandeira('visa');
    const visa = component.bandeiras().find(b => b.id === 'visa');
    expect(visa?.selecionada).toBe(false);
  });

  // ── atualizarPercentual ────────────────────────────────────────────────

  it('atualizarPercentual deve atualizar percentual da bandeira', () => {
    component.toggleBandeira('visa');
    const input = document.createElement('input');
    input.value = '100';
    component.atualizarPercentual('visa', { target: input } as any as Event);
    const visa = component.bandeiras().find(b => b.id === 'visa');
    expect(visa?.percentual).toBe(100);
  });

  it('atualizarPercentual com valor vazio deve definir null', () => {
    component.toggleBandeira('visa');
    const input = document.createElement('input');
    input.value = '';
    component.atualizarPercentual('visa', { target: input } as any as Event);
    const visa = component.bandeiras().find(b => b.id === 'visa');
    expect(visa?.percentual).toBeNull();
  });

  // ── onAdicionar ─────────────────────────────────────────────────────────

  it('onAdicionar não deve adicionar quando formulário inválido', () => {
    component.onAdicionar();
    expect(component.garantiasAdicionadas().length).toBe(0);
  });

  it('onAdicionar deve exibir erro quando sem bandeiras para faturamento_cartao', () => {
    component.form.patchValue({ tipoGarantia: 'faturamento_cartao', valorGarantia: 15000 });
    component.onAdicionar();
    expect(component.erroBandeiras()).toBeTruthy();
  });

  it('onAdicionar deve exibir erro quando total bandeiras diferente de 100%', () => {
    component.form.patchValue({ tipoGarantia: 'faturamento_cartao', valorGarantia: 15000 });
    component.toggleBandeira('visa');
    const input = document.createElement('input');
    input.value = '50';
    component.atualizarPercentual('visa', { target: input } as any as Event);
    component.onAdicionar();
    expect(component.erroBandeiras()).toContain('100%');
  });

  it('onAdicionar deve adicionar garantia quando form válido com bandeiras corretas', () => {
    component.form.patchValue({ tipoGarantia: 'faturamento_cartao', valorGarantia: 15000 });
    component.toggleBandeira('visa');
    const input = document.createElement('input');
    input.value = '100';
    component.atualizarPercentual('visa', { target: input } as any as Event);
    component.onAdicionar();
    expect(component.garantiasAdicionadas().length).toBe(1);
  });

  it('onRemoverGarantia deve remover garantia da lista', () => {
    component.form.patchValue({ tipoGarantia: 'faturamento_cartao', valorGarantia: 15000 });
    component.toggleBandeira('visa');
    const input = document.createElement('input');
    input.value = '100';
    component.atualizarPercentual('visa', { target: input } as any as Event);
    component.onAdicionar();
    expect(component.garantiasAdicionadas().length).toBe(1);
    component.onRemoverGarantia(0);
    expect(component.garantiasAdicionadas().length).toBe(0);
  });

  // ── aoDigitarValorGarantia ────────────────────────────────────────────

  it('aoDigitarValorGarantia deve converter centavos para reais no form', () => {
    const input = document.createElement('input');
    input.value = '10000'; // R$ 100,00
    component.aoDigitarValorGarantia({ target: input } as any as Event);
    expect(component.form.get('valorGarantia')!.value).toBe(100);
  });

  it('aoDigitarValorGarantia com valor vazio deve setar null', () => {
    const input = document.createElement('input');
    input.value = '';
    component.aoDigitarValorGarantia({ target: input } as any as Event);
    expect(component.form.get('valorGarantia')!.value).toBeNull();
  });

  it('aoSairValorGarantia deve marcar campo como touched', () => {
    component.aoSairValorGarantia();
    expect(component.form.get('valorGarantia')!.touched).toBe(true);
  });

  // ── acessores ──────────────────────────────────────────────────────────

  it('tipoGarantia getter deve retornar o controle do form', () => {
    expect(component.tipoGarantia).toBeTruthy();
  });

  it('valorGarantia getter deve retornar o controle do form', () => {
    expect(component.valorGarantia).toBeTruthy();
  });

  // ── eventos ───────────────────────────────────────────────────────────

  it('onVoltar deve emitir evento voltar', () => {
    let emitido = false;
    component.voltar.subscribe(() => (emitido = true));
    component.onVoltar();
    expect(emitido).toBe(true);
  });

  it('onSalvar deve executar sem erro', () => {
    expect(() => component.onSalvar()).not.toThrow();
  });

  it('onAvancar deve executar sem erro', () => {
    expect(() => component.onAvancar()).not.toThrow();
  });

  // ── totalPercentualBandeiras com seleção ──────────────────────────────

  it('totalPercentualBandeiras deve somar percentuais das bandeiras selecionadas', () => {
    component.toggleBandeira('visa');
    component.toggleBandeira('master');
    const inp1 = document.createElement('input'); inp1.value = '60';
    const inp2 = document.createElement('input'); inp2.value = '40';
    component.atualizarPercentual('visa', { target: inp1 } as any as Event);
    component.atualizarPercentual('master', { target: inp2 } as any as Event);
    expect(component.totalPercentualBandeiras()).toBe(100);
  });

  // ── validator ────────────────────────────────────────────────────────

  it('valorGarantia deve ter erro valorMinimo quando valor menor que mínimo', () => {
    const ctrl = component.form.get('valorGarantia')!;
    ctrl.setValue(1000); // Menor que 12500 (12.5% de 100000)
    ctrl.markAsTouched();
    expect(ctrl.hasError('valorMinimo')).toBe(true);
  });

  it('valorGarantia deve ser válido quando valor maior que mínimo', () => {
    const ctrl = component.form.get('valorGarantia')!;
    ctrl.setValue(15000); // Maior que 12500
    expect(ctrl.hasError('valorMinimo')).toBe(false);
  });
});
