import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PesquisasListaComponent } from '../../../pesquisas/components/pesquisas-lista/pesquisas-lista.component';

@Component({
  selector: 'app-central-pesquisas',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PesquisasListaComponent],
  templateUrl: './central-pesquisas.component.html',
  styleUrl: './central-pesquisas.component.scss',
})
export class CentralPesquisasComponent {
  @Input() cnpj = '';
  @Input() cpfsSocios: { nome: string; cpf: string }[] = [];
}
