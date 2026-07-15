import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

export interface SalvarAvaliacaoPayload {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  segmento: string;
  porteCaixa: string;
  porteEmpresa: string;
  ratingBadge: string;
  ratingAprovado: boolean;
  limiteGlobal: string;
  faturamentoAnual: string;
  nepj: string;
  nepjClassificacao: string;
  tempoRelacionamento: string;
  possuiRestricao: boolean;
}

export interface ResultadoAvaliacao extends SalvarAvaliacaoPayload {
  id: string;
  dataHoraAvaliacao: string;
}

@Injectable({ providedIn: 'root' })
export class AvaliacaoPersistenciaService {
  private readonly _http = inject(HttpClient);

  salvar(payload: SalvarAvaliacaoPayload): void {
    this._http
      .post<ResultadoAvaliacao>('/api/avaliacoes', payload)
      .pipe(catchError(() => EMPTY))
      .subscribe();
  }

  listar() {
    return this._http
      .get<ResultadoAvaliacao[]>('/api/avaliacoes')
      .pipe(catchError(() => EMPTY));
  }
}
