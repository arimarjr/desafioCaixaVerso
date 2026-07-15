import { TestBed } from '@angular/core/testing';
import { CapitalGiroSimulacaoFacade } from './capital-giro-simulacao.facade';

const inputMock = {
  valorSolicitado: 50000,
  prazoMeses: 12,
  taxaMensal: 1.5,
  carenciaMeses: 0,
  linhaCredito: 'Capital de Giro',
};

describe('CapitalGiroSimulacaoFacade', () => {
  let facade: CapitalGiroSimulacaoFacade;

  beforeEach(() => {
    facade = new CapitalGiroSimulacaoFacade();
  });

  it('deve criar a facade', () => {
    expect(facade).toBeTruthy();
  });

  it('capitalGiroSelecionado deve iniciar como false', () => {
    expect(facade.capitalGiroSelecionado()).toBe(false);
  });

  it('simulacaoCalculada deve iniciar como false', () => {
    expect(facade.simulacaoCalculada()).toBe(false);
  });

  it('resultado deve iniciar como null', () => {
    expect(facade.resultado()).toBeNull();
  });

  // ── selecionarCapitalGiro ─────────────────────────────────────────────────

  it('selecionarCapitalGiro(true) deve ativar flag', () => {
    facade.selecionarCapitalGiro(true);
    expect(facade.capitalGiroSelecionado()).toBe(true);
  });

  it('selecionarCapitalGiro(false) deve desativar flag e limpar resultado', () => {
    facade.selecionarCapitalGiro(true);
    facade.calcular(inputMock);
    facade.selecionarCapitalGiro(false);

    expect(facade.capitalGiroSelecionado()).toBe(false);
    expect(facade.simulacaoCalculada()).toBe(false);
    expect(facade.resultado()).toBeNull();
  });

  // ── calcular ──────────────────────────────────────────────────────────────

  it('calcular deve marcar simulacaoCalculada como true', () => {
    facade.calcular(inputMock);
    expect(facade.simulacaoCalculada()).toBe(true);
  });

  it('calcular deve popular resultado', () => {
    facade.calcular(inputMock);
    expect(facade.resultado()).not.toBeNull();
  });

  it('calcular deve retornar resultado com valorParcela maior que zero', () => {
    facade.calcular(inputMock);
    expect(facade.resultado()!.valorParcela).toBeGreaterThan(0);
  });

  // ── limparResultado ───────────────────────────────────────────────────────

  it('limparResultado deve zerar resultado e simulacaoCalculada', () => {
    facade.calcular(inputMock);
    facade.limparResultado();

    expect(facade.resultado()).toBeNull();
    expect(facade.simulacaoCalculada()).toBe(false);
  });

  // ── resetarFluxo ──────────────────────────────────────────────────────────

  it('resetarFluxo deve reiniciar todos os sinais', () => {
    facade.selecionarCapitalGiro(true);
    facade.calcular(inputMock);
    facade.resetarFluxo();

    expect(facade.capitalGiroSelecionado()).toBe(false);
    expect(facade.simulacaoCalculada()).toBe(false);
    expect(facade.resultado()).toBeNull();
  });
});
