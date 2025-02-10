import { PrismaClient } from '@prisma/client';
import { MongoClient } from 'mongodb';
import { sendToQueue } from '../rabbitmq.producer';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const mongoUrl = process.env.MONGO_URL || 'mongodb://root:root@localhost:27017/stockwatch?authSource=admin';
const mongoName = process.env.MONGO_NAME || 'stockwatch';

const queueNames = JSON.parse(process.env.RABBITMQ_QUEUE_NAMES || '{}');
const durable = JSON.parse(process.env.RABBIT_QUEUE_DURABLE || '{}');

const queueName = queueNames.promotions || 'promotions-queue';
const durableValue = durable.promotions || false;

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

export const SendPromotions = async (): Promise<{ promotions: any[]; randomId: string; message: any | null }> => {
  let promotions: any[] = [];
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

    const promotionsOptions = data
      ? data.flatMap((product: any) =>
          product.stock.map((stock: any) => ({
            stockId: stock.id,
            details: stock.details?.map((detail: any) => ({
              detailId: Number(detail.detailId),
              type: detail.type,
              value: detail.detailName,
            })),
            product: product,
            quantity: stock.quantity,
          }))
        )
      : [];

    for (const promotion of promotionsOptions) {
      if (promotion.quantity > 20) {
        const customers = await prisma.customer.findMany({
          where: {
            preferences: {
              some: {
                detailId: {
                  in: promotion.details.map((detail: any) => detail.detailId),
                },
              },
            },
          },
          select: {
            id: true,
            preferences: true,
          },
        });

        for (const customer of customers) {
          const commonDetails = promotion.details.filter((promotionDetail: any) =>
            customer.preferences.some((customerDetail: any) => customerDetail.detailId === promotionDetail.detailId)
          );

          let promoValue = 0;
          if (commonDetails.length === 1) {
            promoValue = Math.ceil(promotion.product.price * 0.9);
          } else if (commonDetails.length === 2) {
            promoValue = Math.ceil(promotion.product.price * 0.75);
          }

          if (promoValue > 0) {
            promotions.push({
              id: uuidv4(),
              stockId: promotion.stockId,
              customerId: customer.id,
              promoValue: promoValue,
            });
          }
        }
      }
    }

    if (promotions.length > 0) {
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().slice(0, 10);
      randomId = `${uuidv4().split('-')[0]}.${formattedDate}`;

      message = {
        notification: 'Promoções para os seguintes clientes e estoques',
        promotions: promotions,
      };

      await sendToQueue(queueName, JSON.stringify(message), randomId, durableValue);
      console.log(`Promoções enviadas com sucesso! ID: ${randomId}`);
    } else {
      message = { notification: 'Nenhuma promoção disponível.' };
      console.log('Nenhuma promoção disponível.');
    }
  } catch (error) {
    console.error('Erro ao enviar promoções:', error);
  }

  return { promotions, randomId, message };
};
