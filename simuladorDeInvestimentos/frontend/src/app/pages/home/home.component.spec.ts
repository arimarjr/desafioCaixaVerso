import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { provideRouter } from '@angular/router';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let navigateSpy: jasmine.Spy;
  let alertSpy: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    navigateSpy = spyOn((component as any).router, 'navigate');
    alertSpy = spyOn(window, 'alert');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should format numeric input correctly', () => {
    const event = { target: { value: '123456' } };
    component.onValorChange(event as any);
    expect(component.valorFormatado).toBe('1.234,56');
    expect(component.valorInicial).toBe(1234.56);
    expect(component.perguntas[component.currentStep].resposta).toBe(1234.56);
  });

  it('should return false for invalid numeric value', () => {
    component.valorInicial = 0;
    component.currentStep = 2; // passo numérico
    expect(component.validarValorAtual()).toBeFalse();

    component.valorInicial = -10;
    expect(component.validarValorAtual()).toBeFalse();
  });

  it('should return true for valid numeric value', () => {
    component.valorInicial = 100;
    component.currentStep = 2; // passo numérico
    expect(component.validarValorAtual()).toBeTrue();
  });

  it('should alert when numeric step is invalid', () => {
    component.currentStep = 2; // passo numérico
    component.valorInicial = 0;
    component.proximaPergunta();
    expect(alertSpy).toHaveBeenCalledWith('Informe um valor inicial válido (maior que zero).');
  });

  it('should increment currentStep with proximaPergunta', () => {
    component.currentStep = 0;
    component.valorInicial = 100; // evita falha de validação
    component.proximaPergunta();
    expect(component.currentStep).toBe(1);
  });

  it('should navigate to dashboard when finishing', () => {
    component.currentStep = component.perguntas.length - 1;
    component.valorInicial = 1000;
    component.perguntas.forEach(p => {
      if (!p.tipo) p.resposta = 2;
    });

    component.proximaPergunta();
    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard'], jasmine.any(Object));
  });

  it('should go back a step with voltarPergunta', () => {
    component.currentStep = 3;
    component.voltarPergunta();
    expect(component.currentStep).toBe(2);
  });

  it('should not decrement below 0', () => {
    component.currentStep = 0;
    component.voltarPergunta();
    expect(component.currentStep).toBe(0);
  });

  it('should select an option and advance', () => {
    component.currentStep = 0;
    component.selecionarOpcao({ label: 'Teste', value: 5 });
    expect(component.perguntas[0].resposta).toBe(5);
    expect(component.currentStep).toBe(1);
  });

  it('should preserve numeric step resposta when selecting option afterwards', () => {
    // simula passo numérico
    component.currentStep = 2;
    component.valorInicial = 1234.56;
    component.perguntas[2].resposta = 1234.56;

    // seleciona opção em passo não-numérico
    component.currentStep = 0;
    component.selecionarOpcao({ label: 'Teste', value: 1 });

    // passo numérico continua correto
    expect(component.perguntas[2].resposta).toBe(1234.56);
  });
});
