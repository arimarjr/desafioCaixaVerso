import * as dataService from "../services/data.service.js"; // lembre-se da extensão .js

export async function getHistorico(clienteId) {
  const db = await dataService.readDB();
  return db.investimentos.filter(i => i.clienteId === Number(clienteId));
}
