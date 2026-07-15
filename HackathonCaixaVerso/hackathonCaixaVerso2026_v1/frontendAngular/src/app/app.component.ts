import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CabecalhoHeaderComponent } from './core/layout/cabecalho-header/cabecalho-header.component';
import { RodapeFooterComponent } from './core/layout/rodape-footer/rodape-footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CabecalhoHeaderComponent, RodapeFooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'frontendAngular';
}
