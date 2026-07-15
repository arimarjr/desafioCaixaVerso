import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { UploadPesquisaResponse } from '../models/upload-pesquisa-response.model';

export interface UploadDocumentoPayload {
  identificadorEmpresa: string;
  pesquisaId: string;
  nomePesquisa: string;
  arquivo: File;
}

@Injectable({ providedIn: 'root' })
export class PesquisasService {
  private readonly http = inject(HttpClient);

  uploadDocumento(payload: UploadDocumentoPayload): Observable<UploadPesquisaResponse> {
    const formData = new FormData();
    formData.append('arquivo', payload.arquivo);
    formData.append('identificadorEmpresa', payload.identificadorEmpresa);
    formData.append('pesquisaId', payload.pesquisaId);
    formData.append('nomePesquisa', payload.nomePesquisa);

    return this.http.post<UploadPesquisaResponse>(
      '/api/pesquisas-documentos/upload',
      formData
    );
  }
}
