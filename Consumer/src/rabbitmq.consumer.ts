import amqp from 'amqplib';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid'; // Para gerar um ID único

const prisma = new PrismaClient();

const RABBITMQ_URL = process.env.RABBITMQ_LOCAL || 'amqp://user:password@localhost:5672';

// Definição do tipo específico
// interface Product {
//   stockId: number;
//   quantityNow: number;
//   quantityNeeded: number;
// }

// interface ParsedMessage {
//   notification: string;
//   products: Product[];
// }

interface CustomConsumeMessage extends amqp.ConsumeMessage {
  msgid?: string;
}

export async function consumeQueue(queueName: string): Promise<
  { id: string; msgid: string; message: string;
    // notification: string; products: Product[]
  }[]
> {
  const processedMessages: {
    id: string;
    msgid: string;
    message: string;
    // notification: string;
    // products: Product[];
  }[] = [];

  try {
    console.log('Conectando ao RabbitMQ...');
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(queueName, { durable: false });

    console.log(`Aguardando mensagens na fila: ${queueName}`);

    await new Promise<void>((resolve, reject) => {
      channel.consume(queueName, async (msg: CustomConsumeMessage | null) => {
        if (msg) {
          const messageContent = msg.content.toString();
          console.log(`Mensagem recebida: ${messageContent}`);

          // Parse da mensagem recebida
          let parsedMessage: { id?: string; msgid?: string; message: string };
          // let parsedMsg2: ParsedMessage;
          try {
            parsedMessage = JSON.parse(messageContent);
            // parsedMsg2 = JSON.parse(parsedMessage.message);
          } catch (error) {
            console.error('Erro ao parsear a mensagem. Ignorando...', error);
            channel.nack(msg, false, false); // Não confirma a mensagem
            return;
          }

          const { id, msgid, message } = parsedMessage;
          // const { notification, products } = parsedMsg2;

          // Verificar se a mensagem já está no banco
          let dbMessage = await prisma.rabbitMQMessage.findUnique({
            where: { messageId: msgid },
          });

          if (!dbMessage) {
            // Se não existir, cria um registro
            dbMessage = await prisma.rabbitMQMessage.create({
              data: {
                produceId: id || 'UNKNOWN',
                consumerId: uuidv4(),
                messageId: msgid || uuidv4(),
                queue: queueName,
                // message: JSON.stringify(parsedMsg2),
                message,
                status: 'PENDING',
              },
            });
          }

          console.log('Mensagem processada com sucesso. Atualizando status no banco de dados.');

          // Atualiza o status para "PROCESSED"
          await prisma.rabbitMQMessage.update({
            where: { id: dbMessage.id },
            data: { status: 'PROCESSED' },
          });

          // Adiciona ao array de mensagens processadas
          processedMessages.push({
            id: id || 'UNKNOWN',
            msgid: msgid || 'UNKNOWN',
            message,
            // notification,
            // products,
          });

          channel.ack(msg); // Confirma a mensagem
        } else {
          resolve(); // Finaliza o consumo quando não há mais mensagens
        }
      });
    });
  } catch (error) {
    console.error('Erro ao consumir fila:', error);
  } finally {
    await prisma.$disconnect();
  }

  return processedMessages; // Retorna as mensagens processadas
}
