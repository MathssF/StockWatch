import { Request, Response } from 'express';
import { CheckStock } from './check-stock';
import { SendPromotions } from './send-promotions';

export const checkStockController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lowStocks, randomId, message } = await CheckStock();
    res.status(200).json({
      response: 'Estoque verificado com sucesso.',
      lowStocks,
      messageID: randomId,
      notification: message
    });
  } catch (error) {
    console.error('Erro no checkStockController:', error);
    res.status(500).json({
      response: 'Erro ao verificar estoque.',
      error: error || 'Erro desconhecido',
    });
  }
};

export const sendPromotionsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { promotions, randomId, message } = await SendPromotions();
    res.status(200).json({
      response: 'Promoções enviadas com sucesso.',
      promotions,
      messageID: randomId,
      notification: message,
    });
  } catch (error) {
    console.error('Erro no sendPromotionsController:', error);
    res.status(500).json({
      response: 'Erro ao enviar promoções.',
      error: error || 'Erro desconhecido',
    });
  }
};
