import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AlertasAlertsComponent } from './alertas-alerts.component';

describe('AlertasAlertsComponent', () => {
  let fixture: ComponentFixture<AlertasAlertsComponent>;
  let component: AlertasAlertsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertasAlertsComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AlertasAlertsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });
});
