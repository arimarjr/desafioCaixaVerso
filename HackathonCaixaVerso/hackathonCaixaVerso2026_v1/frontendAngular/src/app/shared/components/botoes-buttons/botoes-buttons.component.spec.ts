import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BotoesButtonsComponent } from './botoes-buttons.component';

describe('BotoesButtonsComponent', () => {
  let component: BotoesButtonsComponent;
  let fixture: ComponentFixture<BotoesButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BotoesButtonsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BotoesButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
