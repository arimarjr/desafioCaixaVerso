import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CentralPesquisasComponent } from './central-pesquisas.component';

describe('CentralPesquisasComponent', () => {
  let fixture: ComponentFixture<CentralPesquisasComponent>;
  let component: CentralPesquisasComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CentralPesquisasComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(CentralPesquisasComponent);
    component = fixture.componentInstance;
    component.cnpj = '11222333000181';
    component.cpfsSocios = [{ nome: 'João', cpf: '11144477735' }];
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve aceitar @Input cnpj', () => {
    expect(component.cnpj).toBe('11222333000181');
  });

  it('deve aceitar @Input cpfsSocios', () => {
    expect(component.cpfsSocios.length).toBe(1);
  });

  it('deve ter cnpj com valor padrão vazio', () => {
    const f2 = TestBed.createComponent(CentralPesquisasComponent);
    expect(f2.componentInstance.cnpj).toBe('');
  });
});
