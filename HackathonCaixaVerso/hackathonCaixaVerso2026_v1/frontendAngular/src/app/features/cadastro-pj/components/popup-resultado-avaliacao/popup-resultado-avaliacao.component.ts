import {
  ChangeDetectionStrategy, Component, inject, NgZone, OnInit, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA, MatDialogModule, MatDialogRef,
} from '@angular/material/dialog';
import { DscButtonComponent } from 'sidsc-components/dsc-button';
import { DscAlertComponent } from 'sidsc-components/dsc-alert';
import { CadastroPjDataAccess } from '../../data-access/cadastro-pj.data-access';
import { ResultadoAvaliacaoVm } from '../../models/operacao-credito.vm';
import { PopupResultadoData } from '../../models/popup-resultado.model';

@Component({
  selector: 'app-popup-resultado-avaliacao',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatDialogModule, DscButtonComponent, DscAlertComponent],
  templateUrl: './popup-resultado-avaliacao.component.html',
  styleUrl: './popup-resultado-avaliacao.component.scss',
})
export class PopupResultadoAvaliacaoComponent implements OnInit {
  private readonly _dialogRef = inject(MatDialogRef<PopupResultadoAvaliacaoComponent>);
  private readonly _data: PopupResultadoData = inject(MAT_DIALOG_DATA);
  private readonly _dataAccess = inject(CadastroPjDataAccess);
  private readonly _zone = inject(NgZone);

  readonly carregando = signal(true);
  readonly resultado = signal<ResultadoAvaliacaoVm | null>(null);
  readonly erro = signal<string | null>(null);

  ngOnInit(): void {
    this._dataAccess
      .avaliarEmpresa(this._data.cnpj, this._data.dadosAdministrativos)
      .subscribe({
        next: res => {
          this._zone.run(() => {
            this.resultado.set(res);
            this.carregando.set(false);
          });
        },
        error: () => {
          this._zone.run(() => {
            this.erro.set('Erro ao processar a avaliação. Tente novamente.');
            this.carregando.set(false);
          });
        },
      });
  }

  continuar(): void {
    this._zone.run(() => this._dialogRef.close({ continuarSimulacao: true, resultado: this.resultado() }));
  }

  fechar(): void {
    this._zone.run(() => this._dialogRef.close({ continuarSimulacao: false }));
  }
}
