import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePtBr from '@angular/common/locales/pt';
import { CapitalGiroSimulacaoComponent } from './capital-giro-simulacao.component';

registerLocaleData(localePtBr, 'pt-BR');

describe('CapitalGiroSimulacaoComponent', () => {
  let fixture: ComponentFixture<CapitalGiroSimulacaoComponent>;
  let component: CapitalGiroSimulacaoComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CapitalGiroSimulacaoComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [{ provide: LOCALE_ID, useValue: 'pt-BR' }],
    }).compileComponents();

    fixture = TestBed.createComponent(CapitalGiroSimulacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve inicializar formulário com valores padrão', () => {
    expect(component.form.get('valorSolicitado')?.value).toBe(100000);
    expect(component.form.get('prazoMeses')?.value).toBe(12);
    expect(component.form.get('taxaMensal')?.value).toBe(1);
  });

  it('capitalGiroSelecionado deve iniciar como false', () => {
    expect(component.capitalGiroSelecionado()).toBe(false);
  });

  it('simulacaoCalculada deve iniciar como false', () => {
    expect(component.simulacaoCalculada()).toBe(false);
  });

  it('resultado deve iniciar como null', () => {
    expect(component.resultado()).toBeNull();
  });

  it('getters de form devem retornar os controles', () => {
    expect(component.valorSolicitado).toBeTruthy();
    expect(component.prazoMeses).toBeTruthy();
    expect(component.taxaMensal).toBeTruthy();
  });

  // ── onSelecionarCapitalGiro ─────────────────────────────────────────────

  it('onSelecionarCapitalGiro(true) deve selecionar capital de giro', () => {
    const input = document.createElement('input');
    input.checked = true;
    component.onSelecionarCapitalGiro({ target: input } as unknown as Event);
    expect(component.capitalGiroSelecionado()).toBe(true);
  });

  it('onSelecionarCapitalGiro(false) deve desselecionar e resetar form', () => {
    const input = document.createElement('input');
    input.checked = true;
    component.onSelecionarCapitalGiro({ target: input } as unknown as Event);
    input.checked = false;
    component.onSelecionarCapitalGiro({ target: input } as unknown as Event);
    expect(component.capitalGiroSelecionado()).toBe(false);
  });

  // ── onCalcular ──────────────────────────────────────────────────────────

  it('onCalcular deve marcar formulário como touched quando inválido', () => {
    component.form.get('valorSolicitado')!.setValue(0); // Abaixo do mínimo de 50000
    component.onCalcular();
    expect(component.form.get('valorSolicitado')!.touched).toBe(true);
  });

  it('onCalcular deve executar quando formulário válido', () => {
    component.form.patchValue({ valorSolicitado: 100000, prazoMeses: 12, taxaMensal: 1.5 });
    component.onCalcular();
    expect(component.simulacaoCalculada()).toBe(true);
  });

  it('onCalcular deve popular resultado', () => {
    component.form.patchValue({ valorSolicitado: 100000, prazoMeses: 12, taxaMensal: 1.5 });
    component.onCalcular();
    expect(component.resultado()).not.toBeNull();
  });

  // ── aoDigitarValor ──────────────────────────────────────────────────────

  it('aoDigitarValor deve converter centavos para reais no form', () => {
    const input = document.createElement('input');
    input.value = '10000000'; // R$ 100.000,00
    component.aoDigitarValor({ target: input } as unknown as Event);
    expect(component.form.get('valorSolicitado')!.value).toBe(100000);
  });

  it('aoDigitarValor com vazio deve setar 0', () => {
    const input = document.createElement('input');
    input.value = '';
    component.aoDigitarValor({ target: input } as unknown as Event);
    expect(component.form.get('valorSolicitado')!.value).toBe(0);
  });

  it('aoSairValor deve marcar campo como touched', () => {
    component.aoSairValor();
    expect(component.form.get('valorSolicitado')!.touched).toBe(true);
  });

  // ── onImprimir / onVoltar / onSalvar / onAvancar ──────────────────────

  it('onImprimir deve chamar window.print', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    component.onImprimir();
    expect(printSpy).toHaveBeenCalled();
  });

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
});
