import express, { Request, Response } from 'express';
import { sendToQueue } from './rabbitmq.producer';
import stockRoutes from './routes/stock.routes';

const app = express();
const PORT = process.env.PRODUCER_PORT || 3000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Servidor Express rodando!');
});

// Usando as rotas de estoque
app.use('/check-stock', stockRoutes);


// Legado: Primeiro uso do RabbitMQ
app.post('/send-message', async (req: Request, res: Response): Promise<any> => {
  const { queueName, message, id } = req.body;

  if (!queueName || !message) {
    return res.status(400).send('Nome da fila e mensagem, não podem ser nulos')
  }

  try {
    await sendToQueue(queueName, message, id);
    return res.status(200).send(`Mensagem enviada, para fila ${queueName}${id ? ` com o id ${id}` : ''}`);
  }catch (error) {
    return res.status(500).send('Erro ao enviar mensagem.');
  }
})

export default app;