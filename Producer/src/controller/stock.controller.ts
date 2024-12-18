import { Request, Response } from 'express';
import { CheckStock } from './check-stock';
import { SendPromotions } from './send-promotions';

export const checkStockController = async (req: Request, res: Response): Promise<void> => {
  try {
    await CheckStock();
    res.status(200).send('Estoque verificado com sucesso.');
  } catch (error) {
    res.status(500).send('Erro ao verificar estoque.');
  }
};

export const sendPromotionsController = async (req: Request, res: Response): Promise<void> => {
  try {
    await SendPromotions();
    res.status(200).send('Promoções enviadas com sucesso.');
  } catch (error) {
    res.status(500).send('Erro ao enviar promoções.');
  }
};
