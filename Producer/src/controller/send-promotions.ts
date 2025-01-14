import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { sendToQueue } from '../rabbitmq.producer';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const queueNames = JSON.parse(process.env.RABBITMQ_QUEUE_NAMES || '{}');
const durable = JSON.parse(process.env.RABBIT_QUEUE_DURABLE || '{}');

// Agora você pode acessar os valores de 'checkStock' ou 'promotions'
const queueName = queueNames.promotions || 'low-stock-queue'; // 'low-stock-queue'
const durableValue = durable.promotions || false; // false

export const SendPromotions = async (): Promise<void> => {
  let promotionsOptions: any[] = []; // Variável para salvar as promoções

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

    // Monta os dados de promoções
    promotionsOptions = data.Products
      ? data.Products.flatMap((product: any) =>
          product.stocks.map((stock: any) => ({
            stockId: stock.id,
            details: stock.details?.map((detail: any) => ({
              detailId: detail.detailId,
              type: detail.type,
              value: detail.detailName,
            })),
            product: product,
          }))
        )
      : [];

    // Para cada promoção, verifica os clientes que têm detalhes em comum
    for (const promotion of promotionsOptions) {
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

        promotion.customers.push({
          customerId: customer.id,
          promoValue,
        });
      }

      if (promotion.customers.length > 0) {

        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().slice(0, 10);
        const randomId = `${uuidv4().split('-')[0]}.${formattedDate}`;

        const message = {
          notification: "Promoção para os seguintes clientes",
          stockId: promotion.stockId,
          customers: promotion.customers.map((item: any) => ({
            customerId: item.customerId,
            promoValue: item.promoValue,
          })),
        };

        await sendToQueue(queueName, JSON.stringify(message), randomId, durableValue);

        console.log(`Promoção enviada com sucesso! ID: ${randomId}`);
      }
    }

    console.log('Promoções disponíveis:', promotionsOptions);

  } catch (error) {
    console.error('Erro ao enviar promoções:', error);
  }
};
