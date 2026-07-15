import express from 'express';
import * as controller from '../controllers/simulacao.controller.js';

const router = express.Router();

router.post('/', controller.simular);

export default router;
