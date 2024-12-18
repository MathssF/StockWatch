import { Request, Response } from 'express';
import { updateStock } from './update-stock';  // Importando a função processMessage do update-stock.ts
import { postPromotions } from './post-promotions';  // Importando a função processMessage do post-promotions.ts

// Controlador para atualizar o estoque
export const updateStockController = async (req: Request, res: Response): Promise<void> => {
  try {
    const messageContent = JSON.stringify(req.body); // Ou o formato de mensagem esperado
    await updateStock(messageContent);  // Chama a função para atualizar o estoque
    res.status(200).send('Estoque atualizado com sucesso.');
  } catch (error) {
    res.status(500).send('Erro ao atualizar estoque.');
  }
};

// Controlador para postar promoções
export const postPromotionsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const messageContent = JSON.stringify(req.body); // Ou o formato de mensagem esperado
    await postPromotions(messageContent);  // Chama a função para postar promoções
    res.status(200).send('Promoções postadas com sucesso.');
  } catch (error) {
    res.status(500).send('Erro ao postar promoções.');
  }
};
