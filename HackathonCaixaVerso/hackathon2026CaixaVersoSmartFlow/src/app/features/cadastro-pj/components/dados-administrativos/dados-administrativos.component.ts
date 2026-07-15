import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DadosAdministrativosVm, SocioVm } from '../../models/operacao-credito.vm';
import { EmpresaReceitaDto } from '../../../../shared/models/empresa.model';

@Component({
  selector: 'app-dados-administrativos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dados-administrativos.component.html',
})
export class DadosAdministrativosComponent {
  @Input() empresa!: EmpresaReceitaDto;
  @Input() socios: SocioVm[] = [];
  @Output() avaliacaoSolicitada = new EventEmitter<DadosAdministrativosVm>();

  solicitarAvaliacao(): void {
    const vm: DadosAdministrativosVm = {
      dataReferencia: new Date().toISOString().slice(0, 10),
      documentoFaturamento: '1',
      dataUltimaAtualizacaoContratual: new Date().toISOString().slice(0, 10),
      alterouSociosMaior50: false,
      excluiuAdministradoresAnteriores: false,
      alterouObjetoSocial: false,
      alterouCnaePrincipal: false,
      alterouMunicipio: false,
      deixouSerSociedadeSimples: false,
      pvResponsavel: '',
    };
    this.avaliacaoSolicitada.emit(vm);
  }
}
