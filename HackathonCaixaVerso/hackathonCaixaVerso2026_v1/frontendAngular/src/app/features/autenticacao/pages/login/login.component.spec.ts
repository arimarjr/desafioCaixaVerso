import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve ter o formulário com campos matricula e senha', () => {
    expect(component.form.contains('matricula')).toBeTrue();
    expect(component.form.contains('senha')).toBeTrue();
  });

  it('deve ser inválido com matrícula em formato errado', () => {
    component.form.get('matricula')?.setValue('invalido');
    expect(component.form.get('matricula')?.invalid).toBeTrue();
  });

  it('deve ser válido com matrícula no formato correto', () => {
    component.form.get('matricula')?.setValue('c128661');
    component.form.get('senha')?.setValue('c128661');
    expect(component.form.valid).toBeTrue();
  });
});
