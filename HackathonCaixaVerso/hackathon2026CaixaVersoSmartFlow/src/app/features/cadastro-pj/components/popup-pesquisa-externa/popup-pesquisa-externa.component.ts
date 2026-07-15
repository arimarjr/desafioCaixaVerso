import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-popup-pesquisa-externa',
  standalone: true,
  imports: [],
  templateUrl: './popup-pesquisa-externa.component.html',
})
export class PopupPesquisaExternaComponent {
  private readonly _dialogRef = inject(MatDialogRef<PopupPesquisaExternaComponent>);

  fechar(): void {
    this._dialogRef.close();
  }
}
