import amqp from 'amqplib';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid'; // Para gerar um ID único

const prisma = new PrismaClient();

const RABBITMQ_URL = process.env.RABBITMQ_LOCAL || 'amqp://user:password@localhost:5672';

interface CustomConsumeMessage extends amqp.ConsumeMessage {
  msgid?: string;
}

export async function consumeQueue(
  queueName: string,
  durableValue?: boolean
): Promise<
  {
    id: string;
    msgid: string;
    message: string;
  }[]
> {

  try {
    console.log('Conectando ao RabbitMQ...');
    const connection = await amqp.connect(RABBITMQ_URL);

    const channel = await connection.createChannel();
    await channel.assertQueue(queueName, { durable: durableValue ?? false });

    console.log(`Aguardando mensagens na fila: ${queueName}`);

    await new Promise<void>((resolve) => {
      console.log('Entrou no newPromise');
      channel.consume(queueName, (msg) => {
        if (msg) {
          channel.ack(msg);
          resolve({
            id: msg.properties.correlationId,
            msgid: msg.properties.messageId,
            message: msg.content.toString(),
          });
        }
      });
  
    });

    return message as {
      id: string;
      msgid: string;
      message: string;
    };
  } catch (error) {
    console.error('Erro ao consumir fila:', error);
  } finally {
    await prisma.$disconnect();
  }
}
