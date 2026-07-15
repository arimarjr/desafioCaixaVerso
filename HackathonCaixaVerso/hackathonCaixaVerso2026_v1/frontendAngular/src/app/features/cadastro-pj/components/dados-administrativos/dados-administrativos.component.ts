import {
  ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DscButtonComponent } from 'sidsc-components/dsc-button';
import { DadosAdministrativosVm, EmpresaVm, SocioVm } from '../../models/operacao-credito.vm';

@Component({
  selector: 'app-dados-administrativos',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatIconModule, DscButtonComponent],
  templateUrl: './dados-administrativos.component.html',
  styleUrl: './dados-administrativos.component.scss',
})
export class DadosAdministrativosComponent implements OnChanges {
  @Input() empresa?: EmpresaVm;
  @Input() socios: SocioVm[] = [];
  @Output() avaliacaoSolicitada = new EventEmitter<DadosAdministrativosVm>();

  private readonly _fb = new FormBuilder();

  readonly form = this._fb.group({
    dataReferencia:                   [new Date().toISOString().substring(0, 10), Validators.required],
    documentoFaturamento:             ['1' as '1' | '2' | '3', Validators.required],
    dataUltimaAtualizacaoContratual:  ['', Validators.required],
    alterouSociosMaior50:             [false],
    excluiuAdministradoresAnteriores: [false],
    alterouObjetoSocial:              [false],
    alterouCnaePrincipal:             [false],
    alterouMunicipio:                 [false],
    deixouSerSociedadeSimples:        [false],
    pvResponsavel:                    ['', Validators.required],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['empresa'] && this.empresa) {
      // Auto-preenche dataUltimaAtualizacaoContratual com a data da última alteração contratual
      const dataAlteracao = this.empresa.ultimaAlteracao ?? this.empresa.dataConstituicao ?? '';
      if (dataAlteracao) {
        // Normaliza para YYYY-MM-DD
        const normalizada = dataAlteracao.includes('T')
          ? dataAlteracao.substring(0, 10)
          : dataAlteracao;
        this.form.patchValue({ dataUltimaAtualizacaoContratual: normalizada });
      }
    }
  }

  submeter(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    this.avaliacaoSolicitada.emit({
      dataReferencia:                   raw.dataReferencia ?? '',
      documentoFaturamento:             (raw.documentoFaturamento ?? '1') as '1' | '2' | '3',
      dataUltimaAtualizacaoContratual:  raw.dataUltimaAtualizacaoContratual ?? '',
      alterouSociosMaior50:             !!raw.alterouSociosMaior50,
      excluiuAdministradoresAnteriores: !!raw.excluiuAdministradoresAnteriores,
      alterouObjetoSocial:              !!raw.alterouObjetoSocial,
      alterouCnaePrincipal:             !!raw.alterouCnaePrincipal,
      alterouMunicipio:                 !!raw.alterouMunicipio,
      deixouSerSociedadeSimples:        !!raw.deixouSerSociedadeSimples,
      pvResponsavel:                    raw.pvResponsavel ?? '',
    });
  }
}
