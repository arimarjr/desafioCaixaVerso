import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EtapasStepperComponent } from './etapas-stepper.component';

describe('EtapasStepperComponent', () => {
  let component: EtapasStepperComponent;
  let fixture: ComponentFixture<EtapasStepperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EtapasStepperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EtapasStepperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
