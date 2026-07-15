import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OportunidadesDaCarteiraComponent } from './oportunidades-da-carteira.component';

describe('OportunidadesDaCarteiraComponent', () => {
  let component: OportunidadesDaCarteiraComponent;
  let fixture: ComponentFixture<OportunidadesDaCarteiraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OportunidadesDaCarteiraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OportunidadesDaCarteiraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
