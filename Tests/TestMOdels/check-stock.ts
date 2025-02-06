import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { sendToQueue } from '../../Producer/src/rabbitmq.producer';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const queueNames = JSON.parse(process.env.RABBITMQ_QUEUE_NAMES || '{}');
const durable = JSON.parse(process.env.RABBIT_QUEUE_DURABLE || '{}');

const queueName = queueNames.checkStock || 'low-stock-queue';
const durableValue = durable.checkStock || false;

export const CheckStock = async (): Promise<{ lowStocks: any[]; randomId: string; message: any | null }> => {
  let lowStocks: any[] = [];
  let message: any | null = null;
  let randomId: string = '';

  try {
    // Verifica se o arquivo output.json existe
    let data: any;

    if (fs.existsSync(path.join(__dirname, '../../../Core/src/database/today/output.json'))) {
      console.log('Carregando dados do arquivo output.json...');
      const fileData = fs.readFileSync(path.join(__dirname, '../../../Core/src/database/today/output.json'), 'utf-8');
      data = JSON.parse(fileData);
    } else {
      console.log('Arquivo não encontrado. Buscando dados no banco...');
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

    // Analisa os produtos com quantidade menor que 10
    lowStocks = data.Products
      ? data.Products.flatMap((product: any) =>
          product.stocks
            .filter((stock: any) => stock.quantityNow < 10)
            .map((stock: any) => ({
              productId: product.productId,
              productName: product.name,
              stockId: stock.id,
              quantityNow: stock.quantityNow,
            }))
        )
      : data.flatMap((product: any) =>
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
      // Gerando um ID com referência ao dia
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().slice(0, 10); // yyyy-mm-dd
      randomId = `${uuidv4().split('-')[0]}.${formattedDate}`;
      message = {
        notification: "Os seguintes produtos precisam reestabelecer o estoque",
        products: lowStocks.map((item) => {
          const quantityNow = item.quantityNow || 0;
          return {
            stockId: item.stockId,
            quantityNow: quantityNow,
            quantityNeeded: 10 - quantityNow,
          };
        }),
      };
      // Enviar para RabbitMQ
      await sendToQueue(queueName, JSON.stringify(message), randomId, durableValue);
      console.log(`Mensagem enviada com sucesso! ID: ${randomId}`);
    } else {
      const message = { Notification: "Nenhum produto com baixo estoque encontrado." }
      console.log('Nenhum produto com baixo estoque encontrado.');
    }

  } catch (error) {
    console.error('Erro ao verificar estoque:', error);
  }
  return { lowStocks, randomId, message };
};
