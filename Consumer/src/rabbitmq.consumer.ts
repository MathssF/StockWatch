import amqp from 'amqplib';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

export async function consumeQueue(
    queueName: string,
    processMessage: (message: string) => void) {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(queueName, {
      durable: false,
    })

    console.log(`Aguardando mensagens na fila: ${queueName}`);

    channel.consume(queueName, async (msg) => {
      if (msg) {
        const messageContent = msg.content.toString();
        const consumerId = msg.properties.messageId || new Date().getTime().toString();
        const { id, message } = parseMessage(messageContent);

        console.log(`A Seguinte mensagem foi recebida:.. ${messageContent}`);

        const dbMessage = await prisma.rabbitMQMessage.create({
          data: {
            produceId: id || "UNKNOW",
            consumerId,
            messageId: consumerId,
            queue: queueName,
            status: 'PENDING',
          },
        });

        try {
          const result = await processMessage(messageContent);
          await prisma.rabbitMQMessage.update({
            where: { id: dbMessage.id },
            data: { status: 'PROCESSED' },
          });
          channel.ack(msg)
        } catch(error) {
          console.error('Erro ao processar a mensagem', error);
          await prisma.rabbitMQMessage.update({
            where: { id: dbMessage.id },
            data: { status: 'FAILED' },
          });
          channel.nack(msg, false, false);
        }
      }
    })

  } catch(error) {
    console.error('Erro ao consumir fila:', error)
  }
}

function parseMessage(messageContent: string): { id: any; message: any; } {
    throw new Error('Function not implemented.');
}
