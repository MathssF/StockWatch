import amqp from 'amqplib';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid'; // Para gerar um ID único

const prisma = new PrismaClient();

const RABBITMQ_URL = process.env.RABBITMQ_LOCAL || 'amqp://user:password@localhost:5672';

interface CustomConsumeMessage extends amqp.ConsumeMessage {
  msgid?: string;
}

export async function consumeQueue(queueName: string, durableValue?: boolean): Promise<
  { id: string; msgid: string; message: string; }[]
> {
  const processedMessages: {
    id: string;
    msgid: string;
    message: string;
  }[] = [];

  let durableBoolean = durableValue || false;

  try {
    console.log('Conectando ao RabbitMQ...');
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(queueName, { durable: durableBoolean });

    console.log(`Aguardando mensagens na fila: ${queueName}`);

    await new Promise<void>((resolve, reject) => {
      console.log('Entrou no newPromise');
      channel.consume(queueName, async (msg: CustomConsumeMessage | null) => {
        if (msg) {
          const messageContent = msg.content.toString();
          console.log(`(CONSUMER) Mensagem recebida: ${messageContent}`);

          // Parse da mensagem recebida
          let parsedMessage: { id?: string; msgid?: string; message: string };
          console.log('Parsed Message');
          try {
            parsedMessage = JSON.parse(messageContent);
            console.log('Parsed 2', parsedMessage);
          } catch (error) {
            console.error('Erro ao parsear a mensagem. Ignorando...', error);
            channel.nack(msg, false, false);
            return;
          }

          const { id, msgid, message } = parsedMessage;

          // Verificar se a mensagem já está no banco
          let dbMessage = await prisma.rabbitMQMessage.findUnique({
            where: { messageId: msgid },
          });

          console.log('dbMessage? ', dbMessage);

          if (!dbMessage) {
            console.log('CONSUMER - Não achou a mensagem no banco de dados, esta criando');
            // Se não existir, cria um registro
            dbMessage = await prisma.rabbitMQMessage.create({
              data: {
                produceId: id || 'UNKNOWN',
                consumerId: uuidv4(),
                messageId: msgid || uuidv4(),
                queue: queueName,
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
          console.log('Status Atualizado');

          // Adiciona ao array de mensagens processadas
          processedMessages.push({
            id: id || 'UNKNOWN',
            msgid: msgid || 'UNKNOWN',
            message,
          });

          // Confirma o recebimento da mensagem
          channel.ack(msg);
        } else {
          resolve();
        }
      });
    });
  } catch (error) {
    console.error('Erro ao consumir fila:', error);
  } finally {
    await prisma.$disconnect();
  }

  // Retorna todas as mensagens processadas
  return processedMessages;
}
