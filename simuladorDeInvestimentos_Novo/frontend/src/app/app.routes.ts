import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { DashboardsComponent } from './dashboards/dashboards/dashboards.component';
import { FormContatoGerenteComponent } from './shared/form-contato-gerente/form-contato-gerente.component';
import { LoginComponent } from './pages/login/login.component';
import {PaginaInicialComponent} from './pages/pagina-inicial/pagina-inicial.component';

export const routes: Routes = [
  { path: '', redirectTo: 'pagina-inicial', pathMatch: 'full' },   
  { path: 'pagina-inicial', component: PaginaInicialComponent },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },    
  { path: 'dashboard', component: DashboardsComponent },  
  { path: 'formContatoGerente', component: FormContatoGerenteComponent },  
  { path: '**', redirectTo: 'login' } 
];
