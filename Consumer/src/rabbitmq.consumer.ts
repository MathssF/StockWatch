import amqp from 'amqplib';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid'; // Para gerar um ID único


const prisma = new PrismaClient();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

export async function consumeQueue(
  queueName: string,
  processMessage: (message: string) => void)
{
  // const msgid = processMessage.
  const msgid2 = uuidv4();
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
        const { id, msgid, message } = parseMessage(messageContent);

        console.log(`A Seguinte mensagem foi recebida:.. ${messageContent}`);

        let dbMessage = await prisma.rabbitMQMessage.findUnique({
          where: { messageId: consumerId },
        });

        if (!dbMessage) {
          const dbMessage = await prisma.rabbitMQMessage.create({
            data: {
              produceId: id || "UNKNOW",
              consumerId,
              messageId: msgid2,
              queue: queueName,
              message: message,
              status: 'PENDING',
            },
          });
        } else {
          // Se já existir, atualiza o consumerId e o status, se necessário
          dbMessage = await prisma.rabbitMQMessage.update({
            where: { messageId: consumerId },
            data: {
              consumerId: dbMessage.consumerId || consumerId, // Adiciona o consumerId se ainda não estiver registrado
              status: dbMessage.status !== 'PROCESSED' ? 'PENDING' : dbMessage.status, // Só altera o status se não estiver 'PROCESSED'
            },
          });
        }

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
