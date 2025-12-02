import { Router } from "express";
import { getHistorico } from "../controllers/investimentos.controller.js"; // lembre-se da extensão .js

const router = Router();

router.get("/:clienteId", getHistorico);

export default router; // <-- ESSENCIAL para funcionar com import default no server.js
