// src/routes/perfil-risco.routes.js
import express from 'express';
import * as controller from '../controllers/perfil-risco.controller.js'; // usar import

const router = express.Router();

router.get('/:clienteId', controller.getPerfil);

export default router; // export default
