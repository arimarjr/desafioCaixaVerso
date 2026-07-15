import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DscInputComponent } from 'sidsc-components/dsc-input';
import { DscButtonComponent } from 'sidsc-components/dsc-button';
import { DscAlertComponent } from 'sidsc-components/dsc-alert';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { NgxMaskDirective } from 'ngx-mask';
import { CadastroPjFacade } from '../../facades/cadastro-pj.facade';
import { SocioVm } from '../../models/operacao-credito.vm';
import { FormSocioPfComponent } from '../form-socio-pf/form-socio-pf.component';

@Component({
  selector: 'app-lista-socios',
  standalone: true,
  imports: [
    CommonModule,
    DscButtonComponent,
    DscAlertComponent,
    MatDialogModule,
    MatIconModule,
  ],
  templateUrl: './lista-socios.component.html',
  styleUrl: './lista-socios.component.scss',
})
export class ListaSociosComponent {
  readonly facade = inject(CadastroPjFacade);
  private readonly _dialog = inject(MatDialog);

  readonly socios = this.facade.socios;
  readonly totalParticipacao = this.facade.totalParticipacao;

  readonly participacaoValida = computed(() =>
    Math.abs(this.totalParticipacao() - 100) < 0.01 || this.socios().length === 0
  );

  incluirSocio(): void {
    const ref = this._dialog.open(FormSocioPfComponent, {
      width: '900px',
      maxWidth: '98vw',
      maxHeight: '92vh',
      data: null,
      panelClass: 'dialog-pj',
    });
    ref.afterClosed().subscribe((socio: SocioVm | undefined) => {
      if (socio) this.facade.adicionarSocio(socio);
    });
  }

  editarSocio(socio: SocioVm): void {
    const ref = this._dialog.open(FormSocioPfComponent, {
      width: '900px',
      maxWidth: '98vw',
      maxHeight: '92vh',
      data: socio,
      panelClass: 'dialog-pj',
    });
    ref.afterClosed().subscribe((resultado: SocioVm | undefined) => {
      if (resultado) this.facade.atualizarSocio(resultado);
    });
  }

  removerSocio(id: string): void {
    if (confirm('Confirma a exclusão deste sócio/representante?')) {
      this.facade.removerSocio(id);
    }
  }
}
