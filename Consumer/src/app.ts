import express, { Request, Response } from 'express';
import { consumeQueue } from './rabbitmq.consumer';

const app = express();
const PORT = process.env.CONSUMER_PORT || 3001;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Servidor Express rodando!');
});

app.post('/start-consumer', async (req: Request, res: Response): Promise<any> => {
  const { queueName } = req.body;

  if (!queueName) {
    return res.status(400).send('A fila precisa ter um nome');
  }

  try {
    await consumeQueue(queueName, async (message) => {
      console.log('Processando a Mengagem da fila ', queueName);
      console.log('Mensagem: ', message)
      // return res(200).send(message);
    })
  } catch(error) {
    console.error('Erro ao iniciar o consumer: ', error);
    res.status(500).send('Erro ao iniciar o consumer.');
  }
})

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

export default app;