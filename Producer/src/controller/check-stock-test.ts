import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { sendToQueue } from '../rabbitmq.producer';
import { v4 as uuidv4 } from 'uuid';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const mongoClient = new MongoClient(process.env.MONGO_URL || '');
const queueNames = JSON.parse(process.env.RABBITMQ_QUEUE_NAMES || '{}');
const durable = JSON.parse(process.env.RABBIT_QUEUE_DURABLE || '{}');
const queueName = queueNames.checkStock || 'low-stock-queue';
const durableValue = durable.checkStock || false;

const isMongoAvailable = async () => {
  try {
    await mongoClient.connect();
    const db = mongoClient.db(process.env.MONGO_NAME);
    const status = await db.admin().serverStatus();
    return status.ok === 1;
  } catch (error) {
    console.error('Erro ao verificar MongoDB:', error);
    return false;
  }
};

export const CheckStock = async (): Promise<{ lowStocks: any[]; randomId: string; message: any | null }> => {
  let lowStocks: any[] = [];
  let message: any | null = null;
  let randomId: string = '';

  try {
    let data: any;
    const useMongo = await isMongoAvailable();

    if (useMongo) {
      console.log('Carregando dados do MongoDB...');
      const db = mongoClient.db(process.env.MONGO_NAME);
      data = await db.collection('products').find().toArray();
    } else {
      console.log('MongoDB não disponível. Buscando dados no Prisma...');
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
      const currentDate = new Date().toISOString().slice(0, 10);
      randomId = `${uuidv4().split('-')[0]}.${currentDate}`;
      message = {
        notification: 'Os seguintes produtos precisam reestabelecer o estoque',
        products: lowStocks.map((item) => ({
          stockId: item.stockId,
          quantityNow: item.quantityNow,
          quantityNeeded: 10 - item.quantityNow,
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
