import { PrismaClient } from '@prisma/client';
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

      // Ação que será chamada
      // Exemplo: this.triggerLowStockAction(lowStocks);

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
        : data.flatMap((product: any) =>
            product.stock.map((stock: any) => ({
              stockId: stock.id,
              details: stock.StockDetail.map((stockDetail: any) => ({
                detailId: stockDetail.detail.id,
                type: stockDetail.detail.type.name,
                value: stockDetail.detail.value,
              })),
            }))
          );

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
