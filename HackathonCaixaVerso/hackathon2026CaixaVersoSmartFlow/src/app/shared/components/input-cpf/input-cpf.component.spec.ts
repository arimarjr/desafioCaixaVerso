import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { InputCpfComponent } from './input-cpf.component';

describe('InputCpfComponent', () => {
  let fixture: ComponentFixture<InputCpfComponent>;
  let component: InputCpfComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputCpfComponent, ReactiveFormsModule],
      providers: [provideRouter([])],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(InputCpfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve ter formulário com campo cpf', () => {
    expect(component.formGroup.contains('cpf')).toBe(true);
  });

  it('campo cpf deve ser obrigatório', () => {
    component.formGroup.get('cpf')!.setValue('');
    expect(component.formGroup.get('cpf')!.hasError('required')).toBe(true);
  });

  it('deve ter erro cpfInvalid com CPF inválido', () => {
    component.formGroup.get('cpf')!.setValue('12345678901');
    expect(component.formGroup.get('cpf')!.hasError('cpfInvalid')).toBe(true);
  });

  it('deve ser válido com CPF válido', () => {
    component.formGroup.get('cpf')!.setValue('11144477735');
    expect(component.formGroup.get('cpf')!.valid).toBe(true);
  });

  it('getErrorMessage deve retornar undefined quando campo não tocado', () => {
    expect(component.getErrorMessage()).toBeUndefined();
  });

  it('getErrorMessage deve retornar mensagem de obrigatório quando vazio e tocado', () => {
    const ctrl = component.formGroup.get('cpf')!;
    ctrl.setValue('');
    ctrl.markAsTouched();
    expect(component.getErrorMessage()).toBe('Informe o CPF.');
  });

  it('getErrorMessage deve retornar mensagem de CPF inválido quando incorreto e tocado', () => {
    const ctrl = component.formGroup.get('cpf')!;
    ctrl.setValue('12345678901');
    ctrl.markAsTouched();
    expect(component.getErrorMessage()).toBe('CPF inválido.');
  });

  it('getErrorMessage deve retornar undefined quando campo tocado e CPF válido', () => {
    const ctrl = component.formGroup.get('cpf')!;
    ctrl.setValue('11144477735');
    ctrl.markAsTouched();
    expect(component.getErrorMessage()).toBeUndefined();
  });
});
