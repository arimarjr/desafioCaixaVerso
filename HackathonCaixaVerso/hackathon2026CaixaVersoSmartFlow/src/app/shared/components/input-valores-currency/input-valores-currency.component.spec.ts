import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { InputValoresCurrencyComponent } from './input-valores-currency.component';

describe('InputValoresCurrencyComponent', () => {
  let fixture: ComponentFixture<InputValoresCurrencyComponent>;
  let component: InputValoresCurrencyComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputValoresCurrencyComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(InputValoresCurrencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });
});
