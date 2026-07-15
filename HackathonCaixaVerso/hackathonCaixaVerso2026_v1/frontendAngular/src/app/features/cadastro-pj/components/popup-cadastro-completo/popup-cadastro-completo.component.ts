import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-popup-cadastro-completo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatDialogModule, MatIconModule],
  templateUrl: './popup-cadastro-completo.component.html',
  styleUrl: './popup-cadastro-completo.component.scss',
})
export class PopupCadastroCompletoComponent implements OnInit {
  constructor(private readonly _ref: MatDialogRef<PopupCadastroCompletoComponent>) {}

  ngOnInit(): void {
    setTimeout(() => this._ref.close(), 2000);
  }
}
