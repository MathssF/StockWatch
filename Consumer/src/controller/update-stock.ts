import { PrismaClient } from '@prisma/client';
import { MongoClient } from 'mongodb';
import { consumeQueue } from '../rabbitmq.consumer';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

const queueNames = JSON.parse(process.env.RABBITMQ_QUEUE_NAMES || '{}');
const durable = JSON.parse(process.env.RABBIT_QUEUE_DURABLE || '{}');

const queueName = queueNames.checkStock || 'low-stock-queue';
const durableValue = durable.checkStock || false;

const mongoUrl = process.env.MONGO_URL || 'mongodb://root:root@localhost:27017/';
const mongoName = process.env.MONGO_NAME || 'stockwatch';

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

export const updateStock = async (message?: string) => {
  console.log('Entrou no updateStock');
  let content;
  let mode = 0;
  const updatedStocks: { stockId: number; quantityAdded: number; price: number }[] = [];
  let createdOrder: any = null;

  if (message) {
    console.log('Com Body');
    content = JSON.parse(message);
  } else {
    console.log('Sem Body');
    content = await consumeQueue(queueName, durableValue);
    console.log('Finalizada o Consumer');
  }

  const data = JSON.parse(content.message);
  console.log('Mensagem recebida:', content);

  const mongoAvailable = await checkMongoDB();

  if (data.products && data.products.length > 0) {
    if (mongoAvailable) {
      console.log('Atualizando estoque diretamente no MongoDB...');
      const client = new MongoClient(mongoUrl);
      await client.connect();
      const db = client.db(mongoName);
      const stockCollection = db.collection('stocks');

      for (const product of data.products) {
        const { stockId, quantityNeeded } = product;
        const addedQuantity = quantityNeeded || 0;

        const result = await stockCollection.findOneAndUpdate(
          { _id: stockId },
          { $inc: { quantityNow: addedQuantity } },
          { returnDocument: 'after' }
        );

        if (result.value) {
          updatedStocks.push({
            stockId: stockId,
            quantityAdded: addedQuantity,
            price: result.value.price || 0,
          });
        }
      }

      await client.close();
      console.log('Banco de dados MongoDB atualizado com sucesso!');
      mode = 3;
    } else {
      console.log('MongoDB não encontrado ou não autorizado. Atualizando o banco de dados via Prisma...');
      for (const product of data.products) {
        const { stockId, quantityNeeded } = product;

        const stock = await prisma.stock.findUnique({
          where: { id: stockId },
          select: { quantity: true, product: { select: { price: true } } },
        });

        if (stock) {
          const addedQuantity = quantityNeeded || 0;
          await prisma.stock.update({
            where: { id: stockId },
            data: { quantity: stock.quantity + addedQuantity },
          });

          updatedStocks.push({
            stockId,
            quantityAdded: addedQuantity,
            price: stock.product?.price || 0,
          });
        }
      }
      console.log('Banco de dados Prisma atualizado com sucesso!');
      mode = 2;
    }
  } else {
    console.log('Nenhum produto para atualizar. Mensagem:', data.notification);
    return { updatedStocks: [], createdOrder: null, mode: 0 };
  }

  if (updatedStocks.length > 0) {
    const orderNumber = `ORD-${uuidv4().split('-')[0]}`;
    createdOrder = await prisma.order.create({
      data: {
        orderNumber,
        status: 'PENDING',
        items: {
          create: updatedStocks.map((stock) => ({
            stockId: stock.stockId,
            quantity: stock.quantityAdded,
            price: stock.price,
          })),
        },
      },
      include: { items: true },
    });
    console.log('Ordem registrada com sucesso:', createdOrder);
  }

  return { updatedStocks, createdOrder, mode };
};
