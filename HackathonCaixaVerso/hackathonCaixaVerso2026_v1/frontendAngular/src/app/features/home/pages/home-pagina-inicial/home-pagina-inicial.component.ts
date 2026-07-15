import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { OportunidadesDaCarteiraComponent } from '../../../oportunidades-da-carteira/pages/oportunidades-da-carteira/oportunidades-da-carteira.component';
import { InputCnpjComponent } from '../../../../shared/components/input-cnpj/input-cnpj.component';

@Component({
  selector: 'app-home-pagina-inicial',
  imports: [OportunidadesDaCarteiraComponent, InputCnpjComponent],
  templateUrl: './home-pagina-inicial.component.html',
  styleUrl: './home-pagina-inicial.component.scss'
})
export class HomePaginaInicialComponent {
  constructor(private readonly _router: Router) {}

  aoReceberCnpj(cnpj: string): void {
    this._router.navigate(['/cadastro-pj', cnpj]);
  }
}
