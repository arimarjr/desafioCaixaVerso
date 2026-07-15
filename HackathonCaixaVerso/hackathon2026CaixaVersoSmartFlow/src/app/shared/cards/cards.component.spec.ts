import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CardsComponent } from './cards.component';

describe('CardsComponent', () => {
  let fixture: ComponentFixture<CardsComponent>;
  let component: CardsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('titulo deve iniciar vazio', () => {
    expect(component.titulo).toBe('');
  });

  it('icone deve iniciar vazio', () => {
    expect(component.icone).toBe('');
  });

  it('deve aceitar @Input titulo', () => {
    component.titulo = 'Meu Card';
    fixture.detectChanges();
    expect(component.titulo).toBe('Meu Card');
  });

  it('deve aceitar @Input icone', () => {
    component.icone = 'info';
    fixture.detectChanges();
    expect(component.icone).toBe('info');
  });
});
