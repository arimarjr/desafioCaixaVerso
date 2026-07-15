import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { DscSidenavComponent } from "sidsc-components/dsc-sidenav";

@Component({
  selector: 'app-menu-lateral-sidenav',
  standalone: true,
  imports: [DscSidenavComponent],
  templateUrl: './menu-lateral-sidenav.component.html',
  styleUrl: './menu-lateral-sidenav.component.scss'
})
export class MenuLateralSidenavComponent {
  @Input()
  menuAberto = false;

  @Output()
  menuAbertoChange = new EventEmitter<boolean>();

  @Input()
  menuItens = [
    { title: 'Cadastro de Operação PJ', icon: 'description', url: '/cadastro-pj' },
    { title: 'Avaliação de Crédito', icon: 'people', url: '/avaliacao' },
    { title: 'Azulzinha', icon: 'credit_card', url: '/azulzinha' },
  ];

  // impede que cliques dentro do menu lateral fechem o menu
  @HostListener('click', ['$event'])
  onSidenavClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  onOpenedChange(opened: boolean): void {
    this.menuAberto = opened;
    this.menuAbertoChange.emit(opened);
  }
}
