import { Router } from 'express';
import { checkStockController, sendPromotionsController } from '../controller/stock.controller';

const router = Router();

// Rota para verificar o estoque
router.get('/check-stock', checkStockController);

// Rota para enviar promoções
router.get('/send-promotions', sendPromotionsController);

export default router;
