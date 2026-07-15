import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { FormSocioPfComponent } from './form-socio-pf.component';
import { CadastroPjFacade } from '../../facades/cadastro-pj.facade';

const mockDialogRef = {
  close: vi.fn(),
};

const mockFacade = {
  buscarCep: vi.fn(),
  empresa: vi.fn().mockReturnValue(null),
  carregandoCep: vi.fn().mockReturnValue(false),
};

describe('FormSocioPfComponent', () => {
  let fixture: ComponentFixture<FormSocioPfComponent>;
  let component: FormSocioPfComponent;

  describe('modo criação (data = null)', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [FormSocioPfComponent, NoopAnimationsModule],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [
          provideRouter([]),
          { provide: MatDialogRef, useValue: mockDialogRef },
          { provide: MAT_DIALOG_DATA, useValue: null },
          { provide: CadastroPjFacade, useValue: mockFacade },
        ],
      })
        .overrideProvider(CadastroPjFacade, { useValue: mockFacade })
        .compileComponents();

      fixture = TestBed.createComponent(FormSocioPfComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      fixture.detectChanges(); // stabilize DscInputCurrencyComponent (NG0100)
    });

    it('deve criar o componente', () => {
      expect(component).toBeTruthy();
    });

    it('modoEdicao deve ser false quando data é null', () => {
      expect(component.modoEdicao()).toBe(false);
    });

    it('deve ter formulário criado no ngOnInit', () => {
      expect(component.form).toBeTruthy();
    });

    it('rendasArray deve estar acessível', () => {
      expect(component.rendasArray).toBeTruthy();
    });

    it('patrimoniosArray deve estar acessível', () => {
      expect(component.patrimoniosArray).toBeTruthy();
    });

    it('funcoes deve ter pelo menos 1 item', () => {
      expect(component.funcoes.length).toBeGreaterThan(0);
    });

    it('data deve ser null no modo criação', () => {
      expect(component.data).toBeNull();
    });
  });

  describe('modo edição (data = sócio existente)', () => {
    const socioMock = {
      id: 'socio-1',
      nome: 'João Silva',
      cpf: '11144477735',
      participacao: 50,
      funcao: 'Sócio',
    };

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [FormSocioPfComponent, NoopAnimationsModule],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [
          provideRouter([]),
          { provide: MatDialogRef, useValue: mockDialogRef },
          { provide: MAT_DIALOG_DATA, useValue: socioMock },
          { provide: CadastroPjFacade, useValue: mockFacade },
        ],
      })
        .overrideProvider(CadastroPjFacade, { useValue: mockFacade })
        .compileComponents();

      fixture = TestBed.createComponent(FormSocioPfComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      fixture.detectChanges(); // stabilize DscInputCurrencyComponent (NG0100)
    });

    it('deve criar o componente em modo edição', () => {
      expect(component).toBeTruthy();
    });

    it('modoEdicao deve ser true quando data não é null', () => {
      expect(component.modoEdicao()).toBe(true);
    });

    it('data deve ter os dados do sócio', () => {
      expect(component.data?.nome).toBe('João Silva');
    });
  });
});
