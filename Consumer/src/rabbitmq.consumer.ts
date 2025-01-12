import amqp from 'amqplib';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const RABBITMQ_URL = process.env.RABBITMQ_LOCAL || 'amqp://user:password@localhost:5672';

interface MessageData {
  id: string;
  msgid: string;
  message: string;
}

export async function consumeQueue(
  queueName: string,
  durableValue?: boolean
): Promise<MessageData[]> {
  try {
    console.log('Conectando ao RabbitMQ...');
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(queueName, { durable: durableValue ?? false });
    
    console.log(`Aguardando mensagens na fila: ${queueName}`);

    const messages: MessageData[] = [];

    await new Promise<void>((resolve) => {
      channel.consume(queueName, (msg) => {
        if (msg) {
          const messageData: MessageData = {
            id: msg.properties.correlationId || '',
            msgid: msg.properties.messageId || '',
            message: msg.content.toString(),
          };

          messages.push(messageData);
          channel.ack(msg); // Confirma que a mensagem foi processada.
        }

        // Finaliza o consumo após processar uma mensagem
        resolve();
      });
    });

    console.log('Mensagens consumidas:', messages);
    return messages; // Retorna todas as mensagens consumidas.
  } catch (error) {
    console.error('Erro ao consumir fila:', error);
    return []; // Retorna um array vazio em caso de erro.
  } finally {
    await prisma.$disconnect();
  }
}
