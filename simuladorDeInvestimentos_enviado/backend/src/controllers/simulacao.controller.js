import * as simulacaoService from '../services/simulacao.service.js';

export async function simular(req, res) {
  const payload = req.body;
  const result = await simulacaoService.simularInvestimento(payload);
  res.json(result);
}
