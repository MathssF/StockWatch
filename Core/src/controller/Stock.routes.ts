import express, { Request, Response } from 'express';
import { FindProducts, FindStocks, UpdateStock } from './Stock.controller';

const router = express.Router();

router.get('/products', async (req: Request, res: Response) => {
  try {
    const data = await FindProducts();
    res.status(200).json(data);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ message: 'Erro ao buscar produtos' });
  }
});

router.get('/stocks', async (req: Request, res: Response) => {
  try {
    // const a = req.body;
    const data = await FindStocks();
    res.status(200).json(data);
  } catch (error) {
    console.error('Erro ao buscar estoque:', error);
    res.status(500).json({ message: 'Erro ao buscar estoque' });
  }
});

router.put('/stocks/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { quantityNow } = req.body;

  if (!id || typeof quantityNow !== 'number') {
    return res.status(400).json({ message: 'Dados inválidos' });
  }

  try {
    const data = await UpdateStock(Number(id), quantityNow);
    res.status(200).json(data);
  } catch (error) {
    console.error('Erro ao atualizar estoque:', error);
    res.status(500).json({ message: 'Erro ao atualizar estoque' });
  }
});

export default router;
