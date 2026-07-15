import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputCpfComponent } from './input-cpf.component';

describe('InputCpfComponent', () => {
  let component: InputCpfComponent;
  let fixture: ComponentFixture<InputCpfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputCpfComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputCpfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
