import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { sendToQueue } from '../rabbitmq.producer';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const queueNames = JSON.parse(process.env.RABBITMQ_QUEUE_NAMES || '{}');
const durable = JSON.parse(process.env.RABBIT_QUEUE_DURABLE || '{}');

// Agora você pode acessar os valores de 'checkStock' ou 'promotions'
const queueName = queueNames.promotions || 'promotions-queue'; // 'promotions-queue'
const durableValue = durable.promotions || false; // false

export const SendPromotions = async (): Promise<{ promotions: any[]; randomId: string; message: any | null }> => {
  let promotions: any[] = []; // Variável para salvar as promoções
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

    // Monta os dados de promoções
    const promotionsOptions = data.Products
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

    // Gerar promoções baseadas no relacionamento N:N
    for (const promotion of promotionsOptions) {
      // Para cada estoque, identificar os clientes que têm preferências relacionadas a esse estoque
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
        // Verifica as preferências do cliente para o estoque atual
        const commonDetails = promotion.details.filter((promotionDetail: any) =>
          customer.preferences.some((customerDetail: any) => customerDetail.detailId === promotionDetail.detailId)
        );

        let promoValue = 0;
        if (commonDetails.length === 1) {
          promoValue = Math.ceil(promotion.product.price * 0.9);
        } else if (commonDetails.length === 2) {
          promoValue = Math.ceil(promotion.product.price * 0.75);
        }

        // Cria uma promoção para essa combinação de cliente e estoque
        if (promoValue > 0) {
          promotions.push({
            id: uuidv4(),  // ID único para cada promoção
            stockId: promotion.stockId,  // O estoque relacionado
            customerId: customer.id,  // O cliente relacionado
            promoValue: promoValue,  // O valor do desconto calculado
          });
        }
      }
    }

    // Após a geração das promoções, envia as promoções para a fila (RabbitMQ)
    if (promotions.length > 0) {
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().slice(0, 10);
      randomId = `${uuidv4().split('-')[0]}.${formattedDate}`;

      message = {
        notification: "Promoções para os seguintes clientes e estoques",
        promotions: promotions,  // Envia a lista completa de promoções
      };

      // Enviar para RabbitMQ
      await sendToQueue(queueName, JSON.stringify(message), randomId, durableValue);

      console.log(`Promoções enviadas com sucesso! ID: ${randomId}`);
    } else {
      message = { notification: "Nenhuma promoção disponível." };
      console.log('Nenhuma promoção disponível.');
    }

    console.log('Promoções disponíveis:', promotions);

  } catch (error) {
    console.error('Erro ao enviar promoções:', error);
  }

  return { promotions, randomId, message };
};
