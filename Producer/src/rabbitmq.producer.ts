import amqp from 'amqplib';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://user:password@rabbitmq:5672';

export async function sendToQueue(queueName: string, message: string, id?: string) {
  try {
    const msgid = uuidv4();
    await prisma.rabbitMQMessage.create({
      data: {
        messageId: msgid, 
        produceId: id || "UNKNOWN",
        consumerId: "", 
        queue: queueName, 
        message: message,
        status: 'PENDING',
      },
    });

    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(queueName, {
      durable: false,
    });

    const messageToSend = id ? JSON.stringify({ id, msgid, message }) : JSON.stringify({ msgid, message});
    channel.sendToQueue(queueName, Buffer.from(messageToSend));

    console.log(`Mensagem enviada para a fila ${queueName}: ${message}`);

    await channel.close();
    await connection.close();

    setTimeout(() => {
      connection.close();
    }, 500);

  } catch(error) {
    console.error('Erro ao enviar mensagem para o RabbitMQ:', error);
  } finally {
    await prisma.$disconnect();
  }
}