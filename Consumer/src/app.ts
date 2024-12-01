import express, { Request, Response } from 'express';

const app = express();

const PORT = process.env.CONSUMER_PORT || 3001;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Servidor Express rodando!');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

export default app;