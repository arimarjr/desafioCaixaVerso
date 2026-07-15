import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-popup-pesquisa-externa',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatDialogModule, MatIconModule],
  templateUrl: './popup-pesquisa-externa.component.html',
  styleUrl: './popup-pesquisa-externa.component.scss',
})
export class PopupPesquisaExternaComponent implements OnInit {
  readonly mensagemPrincipal = signal('Efetuando pesquisas externa dos sócios...');
  readonly mensagemSecundaria = signal<string | null>(null);
  readonly fase = signal<1 | 2 | 3 | 4>(1);

  constructor(private readonly _ref: MatDialogRef<PopupPesquisaExternaComponent>) {}

  ngOnInit(): void {
    this._executarSequencia();
  }

  private _executarSequencia(): void {
    // Fase 1: "Efetuando pesquisas externa dos sócios..." — 3 s
    setTimeout(() => {
      // Fase 2: exibe confirmação dos sócios
      this.mensagemSecundaria.set('Pesquisa dos Sócios efetuada com sucesso.');
      this.fase.set(2);

      setTimeout(() => {
        // Fase 3: pesquisa empresa
        this.mensagemPrincipal.set('Efetuando pesquisas externas da empresa.');
        this.mensagemSecundaria.set(null);
        this.fase.set(3);

        setTimeout(() => {
          // Fase 4: confirmação empresa
          this.mensagemSecundaria.set('Pesquisas efetuadas com sucesso.');
          this.fase.set(4);

          setTimeout(() => this._ref.close(), 2000);
        }, 2000);
      }, 2000);
    }, 3000);
  }
}

