import amqp from 'amqplib';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

export async function consumeQueue(queueName: string, processMessage: (message: string) => void) {
  //
  try {
    //
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(queueName, {
      durable: false,
    })

    console.log(`Aguardando mensagens na fila: ${queueName}`);

    channel.consume(queueName, async (msg) => {
      if (msg) {
        const messageContent = msg.content.toString();
        console.log(`A Seguinte mensagem foi recebida:.. ${messageContent}`);

        // const dbMessage = await prisma.rabbitMQMessage.create({
        //   data: {
        //     messageId,
        //     queue: queueName,
        //     status: 'PENDING',
        //   },
        // });

        // Processamento da mensagem:
        try {
          const result = await processMessage(messageContent);
        //   await prisma.rabbitMQMessage.update({
        //     where: { id: dbMessage.id },
        //     data: { status: 'PROCESSED' },
        //   });
          channel.ack(msg)
        } catch(error) {
          console.error('Erro ao processar a mensagem', error);
          channel.nack(msg, false, false);
        }
      }
    })

  } catch(error) {
    console.error('Erro ao consumir fila:', error)
  }
}