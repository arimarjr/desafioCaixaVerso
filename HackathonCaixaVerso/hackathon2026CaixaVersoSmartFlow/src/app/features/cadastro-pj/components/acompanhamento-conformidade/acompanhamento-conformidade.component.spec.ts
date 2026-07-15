import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AcompanhamentoConformidadeComponent } from './acompanhamento-conformidade.component';

describe('AcompanhamentoConformidadeComponent', () => {
  let fixture: ComponentFixture<AcompanhamentoConformidadeComponent>;
  let component: AcompanhamentoConformidadeComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcompanhamentoConformidadeComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AcompanhamentoConformidadeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('statusAtual inicial deve ser aguardando', () => {
    expect(component.statusAtual()).toBe('aguardando');
  });

  it('corStatus deve retornar info para status aguardando', () => {
    expect(component.corStatus).toBe('info');
  });

  it('textoStatus deve retornar texto aguardando', () => {
    expect(component.textoStatus).toBe('Aguardando envio para conformidade');
  });

  it('simularEnvio deve mudar status para em-analise', () => {
    component.simularEnvio();
    expect(component.statusAtual()).toBe('em-analise');
  });

  it('simularEnvio deve adicionar evento ao histórico', () => {
    const tamanhoInicial = component.historico.length;
    component.simularEnvio();
    expect(component.historico.length).toBeGreaterThan(tamanhoInicial);
  });

  it('corStatus deve retornar warning para status em-analise', () => {
    component.simularEnvio();
    expect(component.corStatus).toBe('warning');
  });

  it('simularPendencia deve mudar status para pendencia', () => {
    component.simularPendencia();
    expect(component.statusAtual()).toBe('pendencia');
  });

  it('simularPendencia deve popular lista de pendências', () => {
    component.simularPendencia();
    expect(component.pendencias().length).toBeGreaterThan(0);
  });

  it('corStatus deve retornar danger para status pendencia', () => {
    component.simularPendencia();
    expect(component.corStatus).toBe('danger');
  });

  it('simularAprovacao deve mudar status para aprovado', () => {
    component.simularAprovacao();
    expect(component.statusAtual()).toBe('aprovado');
  });

  it('simularAprovacao deve limpar lista de pendências', () => {
    component.simularPendencia();
    component.simularAprovacao();
    expect(component.pendencias().length).toBe(0);
  });

  it('corStatus deve retornar success para status aprovado', () => {
    component.simularAprovacao();
    expect(component.corStatus).toBe('success');
  });

  it('corStatus deve retornar danger para status reprovado', () => {
    component.statusAtual.set('reprovado');
    expect(component.corStatus).toBe('danger');
  });

  it('textoStatus deve retornar texto em-analise', () => {
    component.simularEnvio();
    expect(component.textoStatus).toBe('Em análise pela conformidade');
  });

  it('textoStatus deve retornar texto aprovado', () => {
    component.simularAprovacao();
    expect(component.textoStatus).toBe('Aprovado pela conformidade');
  });

  it('historico deve ter pelo menos 2 eventos iniciais', () => {
    expect(component.historico.length).toBeGreaterThanOrEqual(2);
  });

  it('textoStatus deve retornar texto pendencia', () => {
    component.simularPendencia();
    expect(component.textoStatus).toBe('Pendências identificadas — regularização necessária');
  });

  it('textoStatus deve retornar texto reprovado', () => {
    component.statusAtual.set('reprovado');
    expect(component.textoStatus).toBe('Reprovado pela conformidade');
  });
});
