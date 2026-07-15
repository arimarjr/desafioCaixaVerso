import { Router } from "express";
import { login } from "../controllers/auth.controller.js";

const router = Router();

// Rota correta exigida:
// POST /autenticacao/login
router.post("/autenticacao/login", login);

export default router;
