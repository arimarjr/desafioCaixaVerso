import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputValoresCurrencyComponent } from './input-valores-currency.component';

describe('InputValoresCurrencyComponent', () => {
  let component: InputValoresCurrencyComponent;
  let fixture: ComponentFixture<InputValoresCurrencyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputValoresCurrencyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputValoresCurrencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
