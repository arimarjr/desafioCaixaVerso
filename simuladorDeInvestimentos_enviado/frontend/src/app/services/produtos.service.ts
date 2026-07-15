import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Produto } from '../models/produto.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProdutosService {
  private baseUrl = 'http://localhost:3000/produtos-recomendados';

  constructor(private http: HttpClient) {}

  /**
   * Busca produtos recomendados por perfil (ex: 'conservador','moderado','agressivo')
   */
  getByPerfil(perfil: string): Observable<Produto[]> {
    const perfilNormalized = (perfil || 'conservador').toString().toLowerCase();
    return this.http.get<Produto[]>(`${this.baseUrl}/${perfilNormalized}`);
  }
}
