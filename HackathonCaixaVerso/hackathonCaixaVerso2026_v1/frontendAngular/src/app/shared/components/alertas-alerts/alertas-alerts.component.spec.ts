import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertasAlertsComponent } from './alertas-alerts.component';

describe('AlertasAlertsComponent', () => {
  let component: AlertasAlertsComponent;
  let fixture: ComponentFixture<AlertasAlertsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertasAlertsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlertasAlertsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
