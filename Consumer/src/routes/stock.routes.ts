import { Router } from 'express';
import {
  updateStockController,
  postPromotionsController
} from '../controller/stock.controller';  // Atualize o caminho conforme necessário

const router = Router();

// Rota para atualizar o estoque
router.post('/update-stock', updateStockController);

// Rota para postar promoções
router.post('/post-promotions', postPromotionsController);

export default router;
