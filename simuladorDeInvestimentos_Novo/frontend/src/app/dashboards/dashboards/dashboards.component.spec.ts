import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardsComponent, DialogInvestimentoComponent } from './dashboards.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Chart, LineController, BarController, LineElement, BarElement, PointElement, LinearScale, Title, CategoryScale } from 'chart.js';
import { MatDialogModule } from '@angular/material/dialog';

describe('DashboardsComponent', () => {
  let component: DashboardsComponent;
  let fixture: ComponentFixture<DashboardsComponent>;

  beforeAll(() => {
    Chart.register(
      LineController,
      BarController,
      LineElement,
      BarElement,
      PointElement,
      LinearScale,
      CategoryScale,
      Title
    );
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardsComponent, MatDialogModule],
      providers: [provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardsComponent);
    component = fixture.componentInstance;
    component.perfil = 'Moderado';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have perfil defined', () => {
    expect(component.perfil).toBeDefined();
    expect(component.perfil).toBe('Moderado');
  });

  it('should set perfilDescricao correctly', () => {
    component.perfil = 'Conservador';
    component.definirPerfilDescricao();
    expect(component.perfilDescricao).toContain('conservador');

    component.perfil = 'Moderado';
    component.definirPerfilDescricao();
    expect(component.perfilDescricao).toContain('equilíbrio');

    component.perfil = 'Agressivo';
    component.definirPerfilDescricao();
    expect(component.perfilDescricao).toContain('volatilidade');

    component.perfil = 'Outro';
    component.definirPerfilDescricao();
    expect(component.perfilDescricao).toContain('não identificado');
  });

  it('should simulate products and populate chart data', () => {
    component.simularTodosProdutos();
    expect(component.chartDataLinha.datasets.length).toBe(component.produtos.length);
    expect(component.chartDataBarra.datasets.length).toBe(component.produtos.length);
  });

  it('should open popup with DialogInvestimentoComponent', () => {
    const produto = component.produtos[0];
    const spy = spyOn(component['dialog'], 'open');
    component.abrirPopup(produto);
    expect(spy).toHaveBeenCalled();
  });

  it('should navigate when solicitarContato is called', () => {
    const routerSpy = spyOn(component['router'], 'navigate');
    component.solicitarContato();
    expect(routerSpy).toHaveBeenCalledWith(['/formContatoGerente']);
  });
});
