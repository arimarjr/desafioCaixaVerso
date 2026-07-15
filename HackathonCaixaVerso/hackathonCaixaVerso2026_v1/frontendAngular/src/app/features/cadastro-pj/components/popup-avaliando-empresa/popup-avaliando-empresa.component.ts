import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-popup-avaliando-empresa',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatDialogModule, MatProgressSpinnerModule],
  templateUrl: './popup-avaliando-empresa.component.html',
  styleUrl: './popup-avaliando-empresa.component.scss',
})
export class PopupAvaliandoEmpresaComponent implements OnInit {
  constructor(private readonly _ref: MatDialogRef<PopupAvaliandoEmpresaComponent>) {}

  ngOnInit(): void {
    setTimeout(() => this._ref.close(), 2500);
  }
}
