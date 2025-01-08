import { Request, Response } from 'express';
import { updateStock } from './update-stock';
import { postPromotions } from './post-promotions';
import { validateMessage } from '../utils/validations';

export const updateStockController = async (req: Request, res: Response): Promise<void> => {
  try {
    const messageContent = JSON.stringify(req.body);
    console.log('stock  controler do Consumer, msg: ', messageContent);
    if (messageContent) {
      const validatedMessage = validateMessage(messageContent);
      if (validatedMessage) {
        await updateStock(messageContent);
        res.status(200).send('Estoque atualizado com sucesso.');
      } else {
        console.error('Formato de mensagem inválido');
        res.status(400).send('Formato de mensagem inválido.');
      }
    } else {
      await updateStock();
      res.status(200).send('Estoque atualizado com sucesso.');
    }
  } catch (error) {
    res.status(500).send('Erro ao atualizar estoque.');
  }
};

export const postPromotionsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const messageContent = JSON.stringify(req.body);
    if (messageContent) {
    await postPromotions(messageContent);
  } else {
    await postPromotions();
  }
    res.status(200).send('Promoções postadas com sucesso.');
  } catch (error) {
    res.status(500).send('Erro ao postar promoções.');
  }
};
