import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { PopupPesquisaExternaComponent } from './popup-pesquisa-externa.component';

describe('PopupPesquisaExternaComponent', () => {
  let fixture: ComponentFixture<PopupPesquisaExternaComponent>;
  let component: PopupPesquisaExternaComponent;
  let dialogRefSpy: { close: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    dialogRefSpy = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [PopupPesquisaExternaComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PopupPesquisaExternaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('fechar deve chamar dialogRef.close', () => {
    component.fechar();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });
});
