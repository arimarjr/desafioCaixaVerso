import { DadosAdministrativosVm } from './operacao-credito.vm';
import { ResultadoAvaliacaoVm } from './operacao-credito.vm';

export interface PopupResultadoData {
  cnpj: string;
  dadosAdministrativos: DadosAdministrativosVm;
  resultadoAvaliacao?: ResultadoAvaliacaoVm;
  erro?: string;
}
