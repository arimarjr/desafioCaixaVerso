import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { PopupResultadoData } from '../../models/popup-resultado.model';

export type { PopupResultadoData };

@Component({
  selector: 'app-popup-resultado-avaliacao',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popup-resultado-avaliacao.component.html',
})
export class PopupResultadoAvaliacaoComponent {
  readonly data = inject<PopupResultadoData>(MAT_DIALOG_DATA);
  private readonly _dialogRef = inject(MatDialogRef<PopupResultadoAvaliacaoComponent>);

  get possuiErro(): boolean {
    return !!this.data.erro;
  }

  get podeContinuar(): boolean {
    return !this.possuiErro;
  }

  continuar(): void {
    if (!this.podeContinuar)
      return;

    this._dialogRef.close({ continuarSimulacao: true });
  }

  fechar(): void {
    this._dialogRef.close({ continuarSimulacao: false });
  }
}
