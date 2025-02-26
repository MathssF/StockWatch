import { PrismaClient } from '@prisma/client';
import { MongoClient } from 'mongodb';
import { sendToQueue } from '../rabbitmq.producer';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const mongoUrl = process.env.MONGO_URL || 'mongodb://root:root@localhost:27017/stockwatch?authSource=admin';
const mongoName = process.env.MONGO_NAME || 'stockwatch';

const queueNames = JSON.parse(process.env.RABBITMQ_QUEUE_NAMES || '{}');
const durable = JSON.parse(process.env.RABBIT_QUEUE_DURABLE || '{}');

const queueName = queueNames.checkStock || 'low-stock-queue';
const durableValue = durable.checkStock || false;

async function checkMongoDB() {
  try {
    const client = new MongoClient(mongoUrl);
    await client.connect();
    const db = client.db(mongoName);
    const settings = await db.collection('settings').findOne({ key: 'databaseStatus' });

    await client.close();
    return settings?.open === true;
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
    return false;
  }
}

export const CheckStock = async (): Promise<{ lowStocks: any[]; randomId: string; message: any | null }> => {
  let lowStocks: any[] = [];
  let message: any | null = null;
  let randomId: string = '';

  try {
    let data: any;
    const mongoAvailable = await checkMongoDB();

    if (mongoAvailable) {
      console.log('Buscando dados no MongoDB...');
      const client = new MongoClient(mongoUrl);
      await client.connect();
      const db = client.db(mongoName);
      data = await db.collection('products').find().toArray();
      await client.close();
    } else {
      console.log('MongoDB indisponível. Buscando dados no Prisma...');
      data = await prisma.product.findMany({
        include: {
          stock: {
            include: {
              StockDetail: {
                include: {
                  detail: {
                    include: {
                      type: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    }

    lowStocks = data.flatMap((product: any) =>
      product.stock
        .filter((stock: any) => stock.quantity < 10)
        .map((stock: any) => ({
          productId: product.id,
          productName: product.name,
          stockId: stock.id,
          quantityNow: stock.quantity,
        }))
    );

    if (lowStocks.length > 0) {
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().slice(0, 10);
      randomId = `${uuidv4().split('-')[0]}.${formattedDate}`;
      message = {
        notification: 'Os seguintes produtos precisam reestabelecer o estoque',
        products: lowStocks.map((item) => ({
          stockId: item.stockId,
          quantityNow: item.quantityNow || 0,
          quantityNeeded: 10 - (item.quantityNow || 0),
        })),
      };
      await sendToQueue(queueName, JSON.stringify(message), randomId, durableValue);
      console.log(`Mensagem enviada com sucesso! ID: ${randomId}`);
    } else {
      console.log('Nenhum produto com baixo estoque encontrado.');
    }
  } catch (error) {
    console.error('Erro ao verificar estoque:', error);
  }

  return { lowStocks, randomId, message };
};
