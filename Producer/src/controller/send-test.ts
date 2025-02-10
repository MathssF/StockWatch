import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { sendToQueue } from '../rabbitmq.producer';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const queueNames = JSON.parse(process.env.RABBITMQ_QUEUE_NAMES || '{}');
const durable = JSON.parse(process.env.RABBIT_QUEUE_DURABLE || '{}');

const queueName = queueNames.promotions || 'promotions-queue';
const durableValue = durable.promotions || false;

export const SendPromotions = async (): Promise<{ promotions: any[]; randomId: string; message: any | null }> => {
  let promotions: any[] = [];
  let message: any | null = null;
  let randomId: string = '';

  try {
    let data: any;
    const filePath = path.join(__dirname, '../../../Core/src/database/today/output.json');

    if (fs.existsSync(filePath)) {
      console.log('Carregando dados do arquivo output.json...');
      const fileData = fs.readFileSync(filePath, 'utf-8');
      data = JSON.parse(fileData);
    } else {
      console.log('Arquivo output.json não encontrado. Buscando dados no banco...');
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

    const promotionsOptions = data.Products
      ? data.Products.flatMap((product: any) =>
          product.stocks.map((stock: any) => ({
            stockId: stock.id,
            details: stock.StockDetail?.map((detail: any) => ({
              detailId: Number(detail.detailId),
              type: detail.detail.type,
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
          } else if (commonDetails.length >= 2) {
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
        notification: "Promoções para os seguintes clientes e estoques",
        promotions,
      };

      await sendToQueue(queueName, JSON.stringify(message), randomId, durableValue);
      console.log(`Promoções enviadas com sucesso! ID: ${randomId}`);
    } else {
      message = { notification: "Nenhuma promoção disponível." };
      console.log('Nenhuma promoção disponível.');
    }
  } catch (error) {
    console.error('Erro ao enviar promoções:', error);
  }
  return { promotions, randomId, message };
};
