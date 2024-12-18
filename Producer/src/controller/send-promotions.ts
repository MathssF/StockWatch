import { PrismaClient } from '@prisma/client';
import { sendToQueue } from '../rabbitmq.producer';
import { v4 as uuidv4 } from 'uuid'; // Para gerar um id único
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

type CustomerPromotion = {
  customerId: number;
  promoValue: number;
};

export class SendPromotions {
  private static OUTPUT_PATH = path.join(__dirname, '../../Core/src/database/today/output.json');

  static async run(): Promise<void> {
    let promotionsOptions: any[] = []; // Variável para salvar as promoções

    try {
      // Verifica se o arquivo output.json existe
      let data: any;

      if (fs.existsSync(this.OUTPUT_PATH)) {
        console.log('Carregando dados do arquivo output.json...');
        const fileData = fs.readFileSync(this.OUTPUT_PATH, 'utf-8');
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
        // Buscar os clientes que têm pelo menos 1 detalhe em comum com o stock
        const customers = await prisma.customer.findMany({
          where: {
            preferences: {
              some: {
                detailId: {
                  in: promotion.details.map((detail: any) => detail.detailId), // Procura detalhes que correspondem
                },
              },
            },
          },
          select: {
            id: true, // ID do cliente
            preferences: true, // Adiciona o campo preferences
          },
        });

        // Para cada cliente, calcular a promoção e adicionar à lista de promoções
        for (const customer of customers) {
          const commonDetails = promotion.details.filter((promotionDetail: any) =>
            customer.preferences.some((customerDetail: any) => customerDetail.detailId === promotionDetail.detailId)
          );

          // Calcula o valor da promoção baseado no número de detalhes em comum
          let promoValue = 0;
          if (commonDetails.length === 1) {
            promoValue = Math.ceil(promotion.product.price * 0.9); // 90% do preço
          } else if (commonDetails.length === 2) {
            promoValue = Math.ceil(promotion.product.price * 0.75); // 75% do preço
          }

          // Adiciona o cliente à lista de promoções
          promotion.customers.push({
            customerId: customer.id,
            promoValue,
          });
        }

        // Enviar as promoções para os clientes
        if (promotion.customers.length > 0) {
          const queueName = 'promotion-queue';

          // Gerando um ID único para a promoção
          const currentDate = new Date();
          const formattedDate = currentDate.toISOString().slice(0, 10); // yyyy-mm-dd
          const randomId = `${uuidv4().split('-')[0]}.${formattedDate}`;

          // Mensagem para envio
          const message = {
            notification: "Promoção para os seguintes clientes",
            stockId: promotion.stockId,
            customers: promotion.customers.map((item: CustomerPromotion) => ({
              customerId: item.customerId,
              promoValue: item.promoValue,
            })),
          };

          // Enviar para RabbitMQ
          await sendToQueue(queueName, JSON.stringify(message), randomId);

          console.log(`Promoção enviada com sucesso! ID: ${randomId}`);
        }
      }

      // Exibe as promoções formatadas
      console.log('Promoções disponíveis:', promotionsOptions);

    } catch (error) {
      console.error('Erro ao enviar promoções:', error);
    }
  }
}
