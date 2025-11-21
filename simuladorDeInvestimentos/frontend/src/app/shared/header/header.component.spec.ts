import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HeaderComponent,
        RouterTestingModule,
        MatToolbarModule,
        MatIconModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the logo title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.logo')?.textContent)
      .toContain('Simulador de Investimentos Caixa');
  });

  it('should have a link to access account that points to login', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const link = compiled.querySelector('.botao-acesse-sua-conta') as HTMLAnchorElement;
    expect(link).toBeTruthy();
    // Mantendo o link atual: href="login"
    // usamos getAttribute para checar exatamente o que está no template
    expect(link.getAttribute('href')).toBe('login');
  });
});
