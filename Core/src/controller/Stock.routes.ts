import express, { Request, Response } from 'express';
import { FindProducts, FindStocks, UpdateStock } from './Stock.controller';

const stockRouter = express.Router();

stockRouter.get('/products', async (req: Request, res: Response) => {
  try {
    const data = await FindProducts();
    res.status(200).json(data);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ message: 'Erro ao buscar produtos' });
  }
});

stockRouter.get('/stocks', async (req: Request, res: Response) => {
  try {
    const data = await FindStocks();
    res.status(200).json(data);
  } catch (error) {
    console.error('Erro ao buscar estoque:', error);
    res.status(500).json({ message: 'Erro ao buscar estoque' });
  }
});

stockRouter.put('/stocks/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { quantityNow } = req.body;
  

  if (!id || typeof quantityNow !== 'number') {
    res.status(400).json({ message: 'Dados inválidos' });
  }

  try {
    const data = await UpdateStock(Number(id), quantityNow);
    res.status(200).json(data);
  } catch (error) {
    console.error('Erro ao atualizar estoque:', error);
    res.status(500).json({ message: 'Erro ao atualizar estoque' });
  }
});

export default stockRouter;
