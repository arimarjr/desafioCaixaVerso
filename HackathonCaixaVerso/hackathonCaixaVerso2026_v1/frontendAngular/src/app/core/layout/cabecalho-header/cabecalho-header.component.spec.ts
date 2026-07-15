import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CabecalhoHeaderComponent } from './cabecalho-header.component';

describe('CabecalhoHeaderComponent', () => {
  let component: CabecalhoHeaderComponent;
  let fixture: ComponentFixture<CabecalhoHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CabecalhoHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CabecalhoHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
