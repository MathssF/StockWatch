import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
// import { Stock } from './models/Stock.mongo';
// import { StockDetail } from './models/StockDetail.mongo';
// import { Detail } from './models/Details.mongo';
// import { DetailType } from './models/DetailsType.mongo';
// import { Product } from './models/Product.mongo';

const prisma = new PrismaClient();

async function generateJson(): Promise<void> {
  try {
    const products = await prisma.product.findMany({
      include: {
        stock: {
          include: {
            StockDetail: {
              include: {
                detail: {
                  include: {
                    type: {
                      select: {
                        id: true,
                        name: true,
                      }
                    }
                  },
                },
              },
            },
            customerPromotions: { // Busca promoções relacionadas ao estoque
              where: { isActive: true }, // Apenas promoções ativas
              select: {
                customerId: true,
                promoValue: true,
              },
            },
          },
        },
      }
    });

    const jsonOutput = {
      Op: "ADM",
      Day: new Date().toLocaleDateString(),
      Products: products.map(product => ({
        productId: product.id,
        name: product.name,
        price: product.price,
        promotions: product.stock.flatMap(stock =>
          stock.customerPromotions?.map(promotion => ({
            customerId: promotion.customerId.toString(),
            stockId: stock.id.toString(),
            promoValue: promotion.promoValue,
          })) || []
        ),
        stocks: product.stock.map(stock => ({
          id: stock.id.toString(),
          quantityOpen: stock.quantity,
          quantityNow: stock.quantity,
          details: stock.StockDetail?.map((stockDetail: any) => ({
            typeId: stockDetail.detail?.type?.id?.toString(),
            type: stockDetail.detail?.type?.name,
            detailId: stockDetail.detail?.id?.toString(),
            detailName: stockDetail.detail?.value
          })) || [],
          orders: {},
        }))
      }))
    };

    const dir = './Core/src/database/today';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Gerar o nome do arquivo com base no dia
    // const fileName = `${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}stocks.json`;
    // Caso precise usar no futuro

    fs.writeFileSync(path.join(dir, 'output.json'), JSON.stringify(jsonOutput, null, 2));

    console.log('Arquivo JSON gerado com sucesso!');
  } catch (err) {
    console.error('Erro ao gerar o JSON:', err);
  }
}

generateJson();
