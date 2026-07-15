import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { provideRouter } from '@angular/router';
import { OportunidadesDaCarteiraComponent } from './oportunidades-da-carteira.component';

describe('OportunidadesDaCarteiraComponent', () => {
  let fixture: ComponentFixture<OportunidadesDaCarteiraComponent>;
  let component: OportunidadesDaCarteiraComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OportunidadesDaCarteiraComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(OportunidadesDaCarteiraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('aplicarFiltro deve atualizar filtroAtivo', () => {
    component.aplicarFiltro('em-andamento');
    expect(component.filtroAtivo()).toBe('em-andamento');
  });

  it('operacoesFiltradas deve retornar todas quando filtro é todos', () => {
    component.aplicarFiltro('todos');
    expect(component.operacoesFiltradas.length).toBe(6);
  });

  it('operacoesFiltradas deve filtrar por status em-andamento', () => {
    component.aplicarFiltro('em-andamento');
    const result = component.operacoesFiltradas;
    expect(result.every(o => o.status === 'em-andamento')).toBe(true);
  });

  it('operacoesFiltradas deve filtrar por status aguardando-conformidade', () => {
    component.aplicarFiltro('aguardando-conformidade');
    const result = component.operacoesFiltradas;
    expect(result.every(o => o.status === 'aguardando-conformidade')).toBe(true);
  });

  it('statusLabel deve retornar label mapeado para em-andamento', () => {
    expect(component.statusLabel('em-andamento')).toBe('Em Andamento');
  });

  it('statusLabel deve retornar label mapeado para aguardando-conformidade', () => {
    expect(component.statusLabel('aguardando-conformidade')).toBe('Aguardando Conformidade');
  });

  it('statusLabel deve retornar label mapeado para com-pendencia', () => {
    expect(component.statusLabel('com-pendencia')).toBe('Com Pendência');
  });

  it('statusLabel deve retornar label mapeado para pronto-contrato', () => {
    expect(component.statusLabel('pronto-contrato')).toBe('Pronto p/ Contrato');
  });

  it('statusLabel deve retornar o status original para valor desconhecido', () => {
    expect(component.statusLabel('status-inexistente')).toBe('status-inexistente');
  });

  it('contadores.emAndamento deve contar operações com status em-andamento', () => {
    expect(component.contadores.emAndamento()).toBe(2);
  });

  it('contadores.aguardandoConformidade deve contar operações com status aguardando-conformidade', () => {
    expect(component.contadores.aguardandoConformidade()).toBe(2);
  });

  it('contadores.comPendencia deve contar operações com status com-pendencia', () => {
    expect(component.contadores.comPendencia()).toBe(1);
  });

  it('contadores.prontoContrato deve contar operações com status pronto-contrato', () => {
    expect(component.contadores.prontoContrato()).toBe(1);
  });
});
