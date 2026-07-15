import { Routes } from '@angular/router';
import { LoginComponent } from './features/autenticacao/pages/login/login.component';
import { autenticacaoGuard } from './core/guards/autenticacao.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'pagina-inicial',
    canActivate: [autenticacaoGuard],
    loadComponent: () =>
      import('./features/home/pages/home-pagina-inicial/home-pagina-inicial.component').then(
        m => m.HomePaginaInicialComponent
      ),
  },
  {
    path: 'cadastro-pj',
    canActivate: [autenticacaoGuard],
    loadChildren: () =>
      import('./features/cadastro-pj/cadastro-pj.routes').then(
        m => m.cadastroPjRoutes
      ),
  },
  { path: '**', redirectTo: 'login' },
];

