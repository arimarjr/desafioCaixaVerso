import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GerarContratoRequest, GerarContratoResponse } from '../models/contrato.model';

@Injectable({ providedIn: 'root' })
export class ContratoApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/contratos';

  gerarContrato(request: GerarContratoRequest): Observable<GerarContratoResponse> {
    return this.http.post<GerarContratoResponse>(`${this.baseUrl}/gerar`, request);
  }

  baixarContratoPdf(simulacaoId: string): Observable<Blob> {
    return this.http.get(
      `${this.baseUrl}/simulacoes/${encodeURIComponent(simulacaoId)}/pdf`,
      { responseType: 'blob' },
    );
  }
}
