import { Routes } from '@angular/router';

export const cadastroPjRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/cadastro-pj-page/cadastro-pj-page.component').then(
        m => m.CadastroPjPageComponent
      ),
  },
  {
    path: ':cnpj',
    loadComponent: () =>
      import('./pages/cadastro-pj-page/cadastro-pj-page.component').then(
        m => m.CadastroPjPageComponent
      ),
  },
];
