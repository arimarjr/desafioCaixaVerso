// src/services/perfil-risco.service.js
import * as dataService from './data.service.js';

export async function getPerfilRisco(clienteId) {
  const db = await dataService.readDB();
  return db.perfilRisco.find(p => p.clienteId === Number(clienteId)) || null;
}
