import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { UploadPesquisaResponse } from '../models/upload-pesquisa-response.model';

@Injectable({ providedIn: 'root' })
export class PesquisasService {
  private readonly _http = inject(HttpClient);
  private readonly _base = `${environment.apiUrl}/api/pesquisas-documentos`;

  uploadDocumento(params: {
    identificadorEmpresa: string;
    pesquisaId: string;
    nomePesquisa: string;
    arquivo: File;
  }): Observable<UploadPesquisaResponse> {
    const form = new FormData();
    form.append('arquivo', params.arquivo);
    form.append('identificadorEmpresa', params.identificadorEmpresa);
    form.append('pesquisaId', params.pesquisaId);
    form.append('nomePesquisa', params.nomePesquisa);

    return this._http.post<UploadPesquisaResponse>(`${this._base}/upload`, form);
  }
}
