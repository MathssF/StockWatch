import { PrismaClient } from '@prisma/client';
import { MongoClient } from 'mongodb';
import { consumeQueue } from '../rabbitmq.consumer';

const prisma = new PrismaClient();
const queueNames = JSON.parse(process.env.RABBITMQ_QUEUE_NAMES || '{}');
const durable = JSON.parse(process.env.RABBIT_QUEUE_DURABLE || '{}');
const mongoUrl = process.env.MONGODB_URL || ''; // URL do MongoDB
const mongoOpen = JSON.parse(process.env.MONGODB_OPEN || 'false'); // Flag para determinar se o MongoDB está aberto

const queueName = queueNames.promotions || 'promotions-queue';
const durableValue = durable.promotions || false;

const mongoClient = new MongoClient(mongoUrl);

export const postPromotions = async (messageContent?: string): Promise<any> => {
  try {
    let promotions: any[] = [];
    let processedPromotions: any[] = [];

    // Consome a mensagem da fila ou usa a mensagem fornecida diretamente
    if (messageContent) {
      console.log('Mensagem recebida:', messageContent);
      const { promotions: promotionsFromQueue } = JSON.parse(messageContent);
      promotions = promotionsFromQueue || [];
    } else {
      const message = await consumeQueue(queueName, durableValue);
      const { promotions: promotionsFromQueue } = JSON.parse(message.message);
      promotions = promotionsFromQueue || [];
    }

    // Processa as promoções se existirem
    if (promotions.length > 0) {
      if (mongoOpen && mongoUrl) {
        console.log('MongoDB configurado e aberto, salvando promoções no MongoDB...');
        processedPromotions = await savePromotionsToMongoDB(promotions);
      } else {
        console.log('MongoDB não configurado ou Open é false, salvando promoções no banco Prisma...');
        processedPromotions = await savePromotionsToDatabase(promotions);
      }
    } else {
      console.log('Nenhuma promoção encontrada.');
    }

    return { processedPromotions };
  } catch (error) {
    console.error('Erro ao processar a mensagem:', error);
    throw error;
  }
};

// Função para salvar promoções no MongoDB
async function savePromotionsToMongoDB(promotions: any[]): Promise<any> {
  try {
    await mongoClient.connect();
    const database = mongoClient.db('promotionsDatabase');
    const collection = database.collection('promotions');
    const result = await collection.insertMany(promotions);
    console.log('Promoções salvas no MongoDB:', result.insertedCount);
    return promotions;
  } catch (error) {
    console.error('Erro ao salvar promoções no MongoDB:', error);
  } finally {
    await mongoClient.close();
  }
}

// Função para salvar promoções no banco de dados (Prisma)
async function savePromotionsToDatabase(promotions: any[]): Promise<any> {
  try {
    const savedPromotions: any[] = [];
    for (const promotion of promotions) {
      const savedPromotion = await prisma.customerPromotions.create({
        data: {
          stockId: promotion.stockId,
          customerId: promotion.customerId,
          promoValue: promotion.promoValue,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      savedPromotions.push(savedPromotion);
    }
    console.log('Promoções salvas no banco de dados Prisma');
    return savedPromotions;
  } catch (error) {
    console.error('Erro ao salvar promoções no banco de dados Prisma:', error);
  }
}
