import express from 'express';
import * as controller from '../controllers/produtos.controller.js';

const router = express.Router();

router.get('/:perfil', controller.getProdutos);

export default router;
