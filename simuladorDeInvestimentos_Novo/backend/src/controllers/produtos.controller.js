import * as produtosService from '../services/produtos.service.js';

export async function getProdutos(req, res) {
  const perfil = req.params.perfil;
  const produtos = await produtosService.getProdutosPorPerfil(perfil);
  res.json(produtos);
}
