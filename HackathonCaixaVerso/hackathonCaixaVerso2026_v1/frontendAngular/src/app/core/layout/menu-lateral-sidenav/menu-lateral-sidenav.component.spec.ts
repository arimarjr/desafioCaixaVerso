import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuLateralSidenavComponent } from './menu-lateral-sidenav.component';

describe('MenuLateralSidenavComponent', () => {
  let component: MenuLateralSidenavComponent;
  let fixture: ComponentFixture<MenuLateralSidenavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuLateralSidenavComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuLateralSidenavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
