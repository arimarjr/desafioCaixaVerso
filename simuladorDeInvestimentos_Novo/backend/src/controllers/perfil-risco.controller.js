// src/controllers/perfil-risco.controller.js
import * as perfilService from '../services/perfil-risco.service.js'; // use import

export async function getPerfil(req, res) {
  const clienteId = req.params.clienteId;
  const perfil = await perfilService.getPerfilRisco(clienteId);
  if (!perfil) return res.status(404).json({ message: 'Perfil não encontrado' });
  res.json(perfil);
}
