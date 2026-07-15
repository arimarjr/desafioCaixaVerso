import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RodapeFooterComponent } from './rodape-footer.component';

describe('RodapeFooterComponent', () => {
  let component: RodapeFooterComponent;
  let fixture: ComponentFixture<RodapeFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RodapeFooterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RodapeFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
