import express, { Request, Response } from 'express';

const app = express();

// Middleware para parsing de JSON
app.use(express.json());

// Rotas principais
app.get('/', (req: Request, res: Response) => {
  res.send('Servidor Principal - Producer e Consumer Integrados');
});

export default app;
