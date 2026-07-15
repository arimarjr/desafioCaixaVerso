// src/services/produtos.service.js
import * as dataService from './data.service.js';

export async function getProdutosPorPerfil(perfil) {
  const db = await dataService.readDB();
  return db.produtos.filter(p => p.perfil === (perfil || 'conservador'));
}
