import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomePaginaInicialComponent } from './home-pagina-inicial.component';

describe('HomePaginaInicialComponent', () => {
  let component: HomePaginaInicialComponent;
  let fixture: ComponentFixture<HomePaginaInicialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePaginaInicialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomePaginaInicialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
