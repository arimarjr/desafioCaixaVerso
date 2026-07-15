import express from "express";
import { enviarEmailContato } from "../email.service.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { nome, email, telefone, patrimonio, valorInicial, respostas } = req.body;

  if (!nome || !email || !telefone || patrimonio === undefined) {
    return res.status(400).json({ error: "Dados incompletos" });
  }

  try {
    await enviarEmailContato({ nome, email, telefone, patrimonio, valorInicial, respostas });
    res.json({ success: true, message: "Email enviado com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: "Falha ao enviar email", detalhes: error.message });
  }
});

export default router;
