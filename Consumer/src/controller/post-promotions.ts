import amqp from 'amqplib';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const filePath = path.join(__dirname, '../../Core/src/database/today/output.json');
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

export async function consumeQueue(
  queueName: string,
  processMessage: (message: string) => Promise<void>
) {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(queueName, {
      durable: false,
    });

    console.log(`Aguardando mensagens na fila: ${queueName}`);

    channel.consume(queueName, async (msg) => {
      if (msg) {
        const messageContent = msg.content.toString();
        const consumerId = msg.properties.messageId || new Date().getTime().toString();
        const { id, message } = parseMessage(messageContent);

        console.log(`Mensagem recebida: ${messageContent}`);

        const dbMessage = await prisma.rabbitMQMessage.create({
          data: {
            produceId: id || 'UNKNOWN',
            consumerId,
            messageId: consumerId,
            queue: queueName,
            status: 'PENDING',
          },
        });

        try {
          // Processa a mensagem e cria as promoções
          await processPromotions(messageContent);

          // Marca a mensagem como processada no banco
          await prisma.rabbitMQMessage.update({
            where: { id: dbMessage.id },
            data: { status: 'PROCESSED' },
          });

          // Confirma o recebimento da mensagem
          channel.ack(msg);
        } catch (error) {
          console.error('Erro ao processar a mensagem:', error);

          // Marca a mensagem como falha no banco
          await prisma.rabbitMQMessage.update({
            where: { id: dbMessage.id },
            data: { status: 'FAILED' },
          });

          // Rejeita a mensagem
          channel.nack(msg, false, false);
        }
      }
    });
  } catch (error) {
    console.error('Erro ao consumir a fila:', error);
  }
}

function parseMessage(messageContent: string): { id: any; message: any } {
  // Supondo que a mensagem venha como um JSON com campos id e message
  try {
    return JSON.parse(messageContent);
  } catch (error) {
    throw new Error('Erro ao parsear a mensagem.');
  }
}

async function processPromotions(messageContent: string) {
  const { stockId, customers } = JSON.parse(messageContent);
  const promotions = await preparePromotions(stockId, customers);

  // Verifica se o arquivo output.json existe
  if (fs.existsSync(filePath)) {
    updateOutputFile(promotions);
  } else {
    // Caso não exista, salva diretamente no banco de dados
    await savePromotionsToDatabase(promotions);
  }
}

async function preparePromotions(stockId: string, customers: any[]): Promise<any[]> {
  const promotions = [];

  // Processa as promoções para cada cliente
  for (const customer of customers) {
    const promoValue = customer.promoValue || 0;  // Valor da promoção
    promotions.push({
      stockId,
      customerId: customer.customerId,
      promoValue,
    });
  }

  return promotions;
}

function updateOutputFile(promotions: any[]): void {
  try {
    const currentData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // Adiciona as promoções ao arquivo JSON existente
    currentData.Promotions.push(...promotions);

    // Escreve as promoções no arquivo output.json
    fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2));
    console.log('Promoções adicionadas ao arquivo output.json');
  } catch (error) {
    console.error('Erro ao atualizar o arquivo output.json:', error);
  }
}

async function savePromotionsToDatabase(promotions: any[]): Promise<void> {
  try {
    // Salva as promoções diretamente no banco de dados
    for (const promotion of promotions) {
      await prisma.promotion.create({
        data: {
          stockId: promotion.stockId,
          customerId: promotion.customerId,
          promoValue: promotion.promoValue,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      console.log(`Promoção registrada no banco para o cliente ${promotion.customerId}`);
    }
  } catch (error) {
    console.error('Erro ao salvar promoções no banco de dados:', error);
  }
}
