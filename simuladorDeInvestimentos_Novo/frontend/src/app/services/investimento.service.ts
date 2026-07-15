import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PerfilRisco } from '../models/perfil-risco.model';
import { Investimento } from '../models/investimento.model';
import { Produto } from '../models/produto.model';
import { SimulacaoPayload, SimulacaoResult } from '../models/simulacao.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InvestimentoService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getPerfilRisco(clienteId: number): Observable<PerfilRisco> {
    return this.http.get<PerfilRisco>(`${this.baseUrl}/perfil-risco/${clienteId}`);
  }

  getHistoricoInvestimentos(clienteId: number) {
    return this.http.get<Investimento[]>(`${this.baseUrl}/investimentos/${clienteId}`);
  }

  getProdutosRecomendados(perfil: string) {
    return this.http.get<Produto[]>(`${this.baseUrl}/produtos-recomendados/${perfil}`);
  }

  simularInvestimento(payload: SimulacaoPayload) {
    return this.http.post<SimulacaoResult>(`${this.baseUrl}/simular-investimento`, payload);
  }

  login(email: string, senha: string) {
    return this.http.post<{ token: string, clienteId: number }>(`${this.baseUrl}/autenticacao/login`, { email, senha });
  }
}
