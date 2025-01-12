import amqp from 'amqplib';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const RABBITMQ_URL = process.env.RABBITMQ_LOCAL || 'amqp://user:password@localhost:5672';

interface QueueMessage {
  id: string;
  msgid: string;
  message: string;
}

export async function consumeQueue(
  queueName: string,
  durableValue?: boolean
): Promise<QueueMessage[]> {
  try {
    console.log('Conectando ao RabbitMQ...');
    const connection = await amqp.connect(RABBITMQ_URL);

    const channel = await connection.createChannel();
    await channel.assertQueue(queueName, { durable: durableValue ?? false });

    console.log(`Aguardando mensagens na fila: ${queueName}`);

    const messages: QueueMessage[] = [];

    await new Promise<void>((resolve) => {
      channel.consume(queueName, (msg) => {
        if (msg) {
          channel.ack(msg);

          messages.push({
            id: msg.properties.correlationId || '',
            msgid: msg.properties.messageId || '',
            message: msg.content.toString(),
          });

          // Resolve imediatamente após consumir a mensagem
          resolve();
        }
      });
    });

    return messages;
  } catch (error) {
    console.error('Erro ao consumir fila:', error);
    return []; // Retorna array vazio em caso de erro
  } finally {
    await prisma.$disconnect();
  }
}
