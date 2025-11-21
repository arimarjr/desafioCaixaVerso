import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LibrasButtonComponent } from './libras-button.component';

describe('LibrasButtonComponent', () => {
  let component: LibrasButtonComponent;
  let fixture: ComponentFixture<LibrasButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibrasButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LibrasButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
