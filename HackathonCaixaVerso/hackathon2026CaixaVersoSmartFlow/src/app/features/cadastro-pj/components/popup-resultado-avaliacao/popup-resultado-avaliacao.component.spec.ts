import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PopupResultadoAvaliacaoComponent } from './popup-resultado-avaliacao.component';

describe('PopupResultadoAvaliacaoComponent', () => {
  let component: PopupResultadoAvaliacaoComponent;
  let dialogRefSpy: { close: ReturnType<typeof vi.fn> };

  function setup(data: { erro?: string | null } = {}) {
    dialogRefSpy = { close: vi.fn() };

    TestBed.configureTestingModule({
      imports: [PopupResultadoAvaliacaoComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: dialogRefSpy },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    const fixture: ComponentFixture<PopupResultadoAvaliacaoComponent> =
      TestBed.createComponent(PopupResultadoAvaliacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  afterEach(() => TestBed.resetTestingModule());

  it('deve criar o componente', () => {
    setup({ erro: null });
    expect(component).toBeTruthy();
  });

  it('possuiErro deve ser false quando não há erro', () => {
    setup({ erro: null });
    expect(component.possuiErro).toBe(false);
  });

  it('podeContinuar deve ser true quando não há erro', () => {
    setup({ erro: null });
    expect(component.podeContinuar).toBe(true);
  });

  it('possuiErro deve ser true quando há erro', () => {
    setup({ erro: 'Erro encontrado.' });
    expect(component.possuiErro).toBe(true);
  });

  it('podeContinuar deve ser false quando há erro', () => {
    setup({ erro: 'Erro encontrado.' });
    expect(component.podeContinuar).toBe(false);
  });

  it('continuar deve fechar com continuarSimulacao: true', () => {
    setup({ erro: null });
    component.continuar();
    expect(dialogRefSpy.close).toHaveBeenCalledWith({ continuarSimulacao: true });
  });

  it('continuar não deve fechar quando há erro', () => {
    setup({ erro: 'Erro.' });
    component.continuar();
    expect(dialogRefSpy.close).not.toHaveBeenCalled();
  });

  it('fechar deve chamar dialogRef.close com continuarSimulacao: false', () => {
    setup({ erro: null });
    component.fechar();
    expect(dialogRefSpy.close).toHaveBeenCalledWith({ continuarSimulacao: false });
  });
});
