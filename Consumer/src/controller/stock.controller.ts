import { Request, Response } from 'express';
import { updateStock } from './update-stock';
// import { postPromotions } from './post-promotions';
import { validateMessage } from '../utils/validations';

export const updateStockController = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log(req.body);
    const messageContent = Object.keys(req.body).length !== 0 ? JSON.stringify(req.body) : null;

    console.log('Stock Controller do Consumer, msg:', messageContent);

    if (messageContent !== null) {

      const validatedMessage = validateMessage(messageContent);
      if (validatedMessage) {
        const { updatedStocks, createdOrder, mode } = await updateStock(messageContent);
        res.status(200).send({
          message: 'Estoque atualizado com sucesso.',
          updatedStocks,
          createdOrder,
          mode,
        });
      } else {
        console.error('Formato de mensagem inválido');
        res.status(400).send('Formato de Mensagem inválido');
      }
    } else {

      const { updatedStocks, createdOrder, mode } = await updateStock();
      res.status(200).send({
        message: 'Estoque atualizado com sucesso.',
        updatedStocks,
        createdOrder,
        mode,
      });
    }
  } catch (error) {
    console.error('Erro ao atualizar estoque:', error);
    res.status(500).send('Erro ao atualizar estoque.');
  }
};

// export const postPromotionsController = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const messageContent = JSON.stringify(req.body);
//     if (messageContent) {
//     await postPromotions(messageContent);
//   } else {
//     await postPromotions();
//   }
//     res.status(200).send('Promoções postadas com sucesso.');
//   } catch (error) {
//     res.status(500).send('Erro ao postar promoções.');
//   }
// };
