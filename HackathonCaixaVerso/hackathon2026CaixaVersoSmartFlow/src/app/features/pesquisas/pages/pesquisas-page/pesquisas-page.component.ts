import { Component } from '@angular/core';
import { PesquisasListaComponent } from '../../components/pesquisas-lista/pesquisas-lista.component';

@Component({
  selector: 'app-pesquisas-page',
  standalone: true,
  imports: [PesquisasListaComponent],
  templateUrl: './pesquisas-page.component.html',
  styleUrl: './pesquisas-page.component.scss',
})
export class PesquisasPageComponent {}
