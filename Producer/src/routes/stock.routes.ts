import { Router } from 'express';
import { checkStockController, sendPromotionsController } from '../controller/stock.controller';

const router = Router();

// Rota para verificar o estoque
router.get('/informe', checkStockController);

// Rota para enviar promoções
router.get('/send-promotions', sendPromotionsController);

export default router;
