import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { EtapasStepperComponent } from './etapas-stepper.component';

describe('EtapasStepperComponent', () => {
  let fixture: ComponentFixture<EtapasStepperComponent>;
  let component: EtapasStepperComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EtapasStepperComponent, ReactiveFormsModule],
      providers: [provideRouter([])],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(EtapasStepperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('stepperHorizontal deve ser definido após ngOnInit', () => {
    expect(component.stepperHorizontal).toBeDefined();
  });

  it('stepperVertical deve ser definido após ngOnInit', () => {
    expect(component.stepperVertical).toBeDefined();
  });

  it('stepperHorizontal deve ter 3 steps', () => {
    expect(component.stepperHorizontal.steps.length).toBe(3);
  });

  it('stepperVertical deve ter orientação vertical', () => {
    expect(component.stepperVertical.orientation).toBe('vertical');
  });

  it('firstFormGroup deve existir', () => {
    expect(component.firstFormGroup).toBeDefined();
  });

  it('secondFormGroup deve existir', () => {
    expect(component.secondFormGroup).toBeDefined();
  });

  it('thirdFormGroup deve existir', () => {
    expect(component.thirdFormGroup).toBeDefined();
  });
});
