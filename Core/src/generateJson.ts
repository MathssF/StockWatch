import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

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
            customerPromotions: {
              where: { isActive: true },
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

    fs.writeFileSync(path.join(dir, 'output.json'), JSON.stringify(jsonOutput, null, 2));

    console.log('Arquivo JSON gerado com sucesso!');
  } catch (err) {
    console.error('Erro ao gerar o JSON:', err);
  }
}

generateJson();
