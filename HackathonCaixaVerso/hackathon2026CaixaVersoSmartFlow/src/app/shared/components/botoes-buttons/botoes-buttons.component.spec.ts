import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BotoesButtonsComponent } from './botoes-buttons.component';

describe('BotoesButtonsComponent', () => {
  let fixture: ComponentFixture<BotoesButtonsComponent>;
  let component: BotoesButtonsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BotoesButtonsComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(BotoesButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });
});
