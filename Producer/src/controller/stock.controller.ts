import { PrismaClient } from '@prisma/client';
import { sendToQueue } from '../rabbitmq.producer';
import { v4 as uuidv4 } from 'uuid'; // Para gerar um id único

import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export class StockController {
  private static OUTPUT_PATH = path.join(
    __dirname,
    '../../Core/src/database/today/output.json'
  );

  // Método CheckStock
  static async CheckStock(): Promise<void> {
    let lowStocks: any[] = []; // Variável para salvar produtos com baixo estoque

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

      // Exibe os produtos com baixo estoque
      console.log('Produtos com baixo estoque:', lowStocks);

      if (lowStocks.length > 0) {
        const queueName = 'low-stock-queue';

        // Gerando um ID com referência ao dia
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().slice(0, 10); // yyyy-mm-dd
        const randomId = `${uuidv4().split('-')[0]}.${formattedDate}`;

        // Mensagem para envio
        const message = {
            notification: "Os seguintes produtos precisam reestabelecer o estoque",
            products: lowStocks.map((item) => ({
              stockId: item.stockId,
              quantityNow: item.quantityNow,
              quantityNeeded: item.quantityNeeded,
            })),
          };
  
          // Enviar para RabbitMQ
          await sendToQueue(queueName, JSON.stringify(message), randomId);
  
          console.log(`Mensagem enviada com sucesso! ID: ${randomId}`);
        } else {
          console.log('Nenhum produto com baixo estoque encontrado.');
        }

    } catch (error) {
      console.error('Erro ao verificar estoque:', error);
    }
  }

  // Método SendPromotions
  static async SendPromotions(): Promise<void> {
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
            }))
          )
        // : data.flatMap((product: any) =>
        //     product.stock.map((stock: any) => ({
        //       stockId: stock.id,
        //       details: stock.StockDetail.map((stockDetail: any) => ({
        //         detailId: stockDetail.detail.id,
        //         type: stockDetail.detail.type.name,
        //         value: stockDetail.detail.value,
        //       })),
        //     }))
        //   );
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
          promoValue = Math.ceil(product.price * 0.9); // 90% do preço
        } else if (commonDetails.length === 2) {
          promoValue = Math.ceil(product.price * 0.75); // 75% do preço
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
          customers: promotion.customers.map((item) => ({
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

      // Funções futuras que serão chamadas aqui
      // Exemplo: this.triggerPromotionsAction(promotionsOptions);

    } catch (error) {
      console.error('Erro ao enviar promoções:', error);
    }
  }
}

// Exemplo de uso:
(async () => {
  console.log('--- Verificando Estoque ---');
  await StockController.CheckStock();

  console.log('--- Enviando Promoções ---');
  await StockController.SendPromotions();

  await prisma.$disconnect();
})();
