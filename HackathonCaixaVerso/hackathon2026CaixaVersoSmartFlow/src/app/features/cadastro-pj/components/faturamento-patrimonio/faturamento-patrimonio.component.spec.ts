import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { provideRouter } from '@angular/router';
import { CadastroPjFacade } from '../../facades/cadastro-pj.facade';
import { FaturamentoPatrimonioComponent } from './faturamento-patrimonio.component';

const mockFacade = {
  faturamentos: vi.fn().mockReturnValue([]),
  removerFaturamento: vi.fn(),
  adicionarFaturamento: vi.fn(),
  atualizarFaturamento: vi.fn(),
};

describe('FaturamentoPatrimonioComponent', () => {
  let fixture: ComponentFixture<FaturamentoPatrimonioComponent>;
  let component: FaturamentoPatrimonioComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaturamentoPatrimonioComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        provideRouter([]),
        { provide: CadastroPjFacade, useValue: mockFacade },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FaturamentoPatrimonioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve ter formulário com faturamentosArray e patrimoniosArray', () => {
    expect(component.faturamentosArray).toBeTruthy();
    expect(component.patrimoniosArray).toBeTruthy();
  });

  it('adicionarFaturamento deve adicionar item ao faturamentosArray', () => {
    const antes = component.faturamentosArray.length;
    component.adicionarFaturamento();
    expect(component.faturamentosArray.length).toBe(antes + 1);
  });

  it('removerFaturamento deve remover item do faturamentosArray', () => {
    component.adicionarFaturamento();
    const antes = component.faturamentosArray.length;
    component.removerFaturamento(0);
    expect(component.faturamentosArray.length).toBe(antes - 1);
  });

  it('adicionarPatrimonio deve adicionar item ao patrimoniosArray', () => {
    const antes = component.patrimoniosArray.length;
    component.adicionarPatrimonio();
    expect(component.patrimoniosArray.length).toBe(antes + 1);
  });

  it('removerPatrimonio deve remover item do patrimoniosArray', () => {
    component.adicionarPatrimonio();
    const antes = component.patrimoniosArray.length;
    component.removerPatrimonio(0);
    expect(component.patrimoniosArray.length).toBe(antes - 1);
  });

  it('salvar deve chamar facade.adicionarFaturamento para novos itens', () => {
    mockFacade.adicionarFaturamento.mockClear();
    component.adicionarFaturamento();
    component.salvar();
    expect(mockFacade.adicionarFaturamento).toHaveBeenCalled();
  });

  it('salvar deve chamar facade.atualizarFaturamento para itens existentes', () => {
    mockFacade.atualizarFaturamento.mockClear();
    // Adiciona um faturamento ao form
    component.adicionarFaturamento();
    const id = component.faturamentosArray.at(0).get('id')?.value;
    // Faz o facade retornar um faturamento com o mesmo id (simula item existente)
    mockFacade.faturamentos.mockReturnValue([{ id, anoReferencia: 2024, valor: 0 }]);
    component.salvar();
    expect(mockFacade.atualizarFaturamento).toHaveBeenCalled();
  });

  it('removerFaturamento deve chamar facade.removerFaturamento com o id', () => {
    mockFacade.removerFaturamento.mockClear();
    component.adicionarFaturamento();
    const id = component.faturamentosArray.at(0).get('id')?.value;
    component.removerFaturamento(0);
    expect(mockFacade.removerFaturamento).toHaveBeenCalledWith(id);
  });
});
