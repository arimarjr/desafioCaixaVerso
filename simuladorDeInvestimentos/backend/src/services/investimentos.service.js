// src/services/investimentos.service.js
import * as dataService from './data.service.js';

export async function getHistorico(clienteId) {
  const db = await dataService.readDB();
  return db.investimentos.filter(i => i.clienteId === Number(clienteId));
}
