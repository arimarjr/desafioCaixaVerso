import { Component } from '@angular/core';
import { DscFooterComponent } from "sidsc-components/dsc-footer";

@Component({
  selector: 'app-rodape-footer',
  standalone: true,
  imports: [DscFooterComponent],
  templateUrl: './rodape-footer.component.html',
  styleUrl: './rodape-footer.component.scss'
})
export class RodapeFooterComponent {
dadosRodape = {
       copyright: "© 2025 Empresa",
       version: "1.0.0"
   };
}
