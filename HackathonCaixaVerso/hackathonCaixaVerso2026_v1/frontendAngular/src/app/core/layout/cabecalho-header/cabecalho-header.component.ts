import { Component, HostListener, inject } from '@angular/core';
import { DscHeaderComponent } from 'sidsc-components/dsc-header';
import { MenuLateralSidenavComponent } from '../menu-lateral-sidenav/menu-lateral-sidenav.component';
import { AutenticacaoStore } from '../../store/autenticacao.store';
import { AutenticacaoService } from '../../services/autenticacao.service';

@Component({
  selector: 'app-cabecalho-header',
  standalone: true,
  imports: [DscHeaderComponent, MenuLateralSidenavComponent],
  templateUrl: './cabecalho-header.component.html',
  styleUrl: './cabecalho-header.component.scss',
})
export class CabecalhoHeaderComponent {
  private readonly _autenticacaoStore  = inject(AutenticacaoStore);
  private readonly _autenticacaoService = inject(AutenticacaoService);
  menuAberto = false;
  private _skipNextDocumentClick = false;

  toggle($event: void) {
    this.menuAberto = !this.menuAberto;
    if (this.menuAberto) {
      // ignora o clique do hambúrguer que acabou de abrir o menu
      this._skipNextDocumentClick = true;
    }
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    if (this._skipNextDocumentClick) {
      this._skipNextDocumentClick = false;
      return;
    }
    if (this.menuAberto) {
      this.menuAberto = false;
    }
  }

  fecharMenu() {
    this.menuAberto = false;
  }

  get dadosCabecalho() {
    return {
      user: { name: this._autenticacaoStore.usuario()?.nome ?? '' },
    };
  }

  readonly botoesCabecalho = [
    { icon: 'notifications', label: 'Notificações', dscBadge: '5', dscBadgeDescription: 'Você tem 5 notificações não lidas', dscBadgeOverlap: true },
    { icon: 'account_circle', label: 'Perfil' },
    { icon: 'logout', label: 'Sair' },
  ];

  readonly handlersBotoes: { [label: string]: () => void } = {
    'Sair': () => this._autenticacaoService.logout().subscribe(),
  };
}
