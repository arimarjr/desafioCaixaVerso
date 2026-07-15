import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormContatoGerenteComponent } from './form-contato-gerente.component';

describe('FormContatoGerenteComponent', () => {
  let component: FormContatoGerenteComponent;
  let fixture: ComponentFixture<FormContatoGerenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormContatoGerenteComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FormContatoGerenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
