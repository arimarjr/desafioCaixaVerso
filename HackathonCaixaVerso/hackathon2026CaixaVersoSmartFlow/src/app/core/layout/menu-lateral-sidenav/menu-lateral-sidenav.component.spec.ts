import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MenuLateralSidenavComponent } from './menu-lateral-sidenav.component';

describe('MenuLateralSidenavComponent', () => {
  let fixture: ComponentFixture<MenuLateralSidenavComponent>;
  let component: MenuLateralSidenavComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuLateralSidenavComponent],
      providers: [provideRouter([])],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuLateralSidenavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('menuAberto deve iniciar como false', () => {
    expect(component.menuAberto).toBe(false);
  });

  it('menuItens deve ter pelo menos 1 item', () => {
    expect(component.menuItens.length).toBeGreaterThan(0);
  });

  it('onOpenedChange deve atualizar menuAberto e emitir evento', () => {
    let emitido: boolean | undefined;
    component.menuAbertoChange.subscribe((v) => (emitido = v));

    component.onOpenedChange(true);

    expect(component.menuAberto).toBe(true);
    expect(emitido).toBe(true);
  });

  it('onOpenedChange com false deve fechar menu e emitir false', () => {
    component.menuAberto = true;
    let emitido: boolean | undefined;
    component.menuAbertoChange.subscribe((v) => (emitido = v));

    component.onOpenedChange(false);

    expect(component.menuAberto).toBe(false);
    expect(emitido).toBe(false);
  });

  it('onSidenavClick deve chamar event.stopPropagation()', () => {
    const mockEvent = { stopPropagation: vi.fn() } as unknown as MouseEvent;
    component.onSidenavClick(mockEvent);
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
  });
});

