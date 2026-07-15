import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { InputCnpjComponent } from './input-cnpj.component';

describe('InputCnpjComponent', () => {
  let fixture: ComponentFixture<InputCnpjComponent>;
  let component: InputCnpjComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputCnpjComponent, ReactiveFormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(InputCnpjComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve ter formulário com campo cnpj', () => {
    expect(component.formGroup.contains('cnpj')).toBe(true);
  });

  it('campo cnpj deve ser obrigatório', () => {
    component.formGroup.get('cnpj')!.setValue('');
    expect(component.formGroup.get('cnpj')!.hasError('required')).toBe(true);
  });

  it('deve ter erro cnpjInvalid com menos de 14 dígitos', () => {
    component.formGroup.get('cnpj')!.setValue('123456789012');
    expect(component.formGroup.get('cnpj')!.hasError('cnpjInvalid')).toBe(true);
  });

  it('deve ser válido com 14 dígitos', () => {
    component.formGroup.get('cnpj')!.setValue('11222333000181');
    expect(component.formGroup.get('cnpj')!.valid).toBe(true);
  });

  it('getErrorMessage deve retornar undefined quando campo não tocado', () => {
    expect(component.getErrorMessage()).toBeUndefined();
  });

  it('getErrorMessage deve retornar mensagem de obrigatório quando vazio e tocado', () => {
    const ctrl = component.formGroup.get('cnpj')!;
    ctrl.setValue('');
    ctrl.markAsTouched();
    expect(component.getErrorMessage()).toBe('Informe o CNPJ.');
  });

  it('getErrorMessage deve retornar mensagem de inválido quando CNPJ inválido e tocado', () => {
    const ctrl = component.formGroup.get('cnpj')!;
    ctrl.setValue('12345');
    ctrl.markAsTouched();
    expect(component.getErrorMessage()).toBe('CNPJ inválido.');
  });

  it('buscar deve marcar como touched quando formulário inválido', () => {
    component.formGroup.get('cnpj')!.setValue('');
    component.buscar();
    expect(component.formGroup.get('cnpj')!.touched).toBe(true);
  });

  it('buscar deve emitir evento pesquisar com CNPJ limpo (somente dígitos)', () => {
    let cnpjEmitido = '';
    component.pesquisar.subscribe((cnpj) => (cnpjEmitido = cnpj));

    component.formGroup.get('cnpj')!.setValue('11.222.333/0001-81');
    component.buscar();

    expect(cnpjEmitido).toBe('11222333000181');
  });

  it('buscar não deve emitir quando formulário inválido', () => {
    let emitiu = false;
    component.pesquisar.subscribe(() => (emitiu = true));

    component.formGroup.get('cnpj')!.setValue('123');
    component.buscar();

    expect(emitiu).toBe(false);
  });

  it('buscar não deve emitir duas vezes em cliques rápidos', () => {
    let contagem = 0;
    component.pesquisar.subscribe(() => contagem++);
    component.formGroup.get('cnpj')!.setValue('11222333000181');

    component.buscar();
    component.buscar();

    expect(contagem).toBe(1);
  });

  it('getErrorMessage deve retornar undefined quando campo tocado e CNPJ válido', () => {
    const ctrl = component.formGroup.get('cnpj')!;
    ctrl.setValue('11222333000181');
    ctrl.markAsTouched();
    expect(component.getErrorMessage()).toBeUndefined();
  });
});
