import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RodapeFooterComponent } from './rodape-footer.component';

describe('RodapeFooterComponent', () => {
  let fixture: ComponentFixture<RodapeFooterComponent>;
  let component: RodapeFooterComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RodapeFooterComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(RodapeFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('dadosRodape deve ter propriedade copyright', () => {
    expect(component.dadosRodape.copyright).toBeTruthy();
  });

  it('dadosRodape deve ter propriedade version', () => {
    expect(component.dadosRodape.version).toBeTruthy();
  });
});
