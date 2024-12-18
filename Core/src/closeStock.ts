import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function closeStock(): Promise<void> {
  try {
    const dirToday = './Core/src/database/today';
    const dirOld = './Core/src/database/olders';

    // Verifique se o diretório 'today' existe e o arquivo 'output.json' está presente
    const filePath = path.join(dirToday, 'output.json');
    if (!fs.existsSync(filePath)) {
      console.error('Arquivo output.json não encontrado.');
      return;
    }

    // Carregar o conteúdo do arquivo JSON gerado no fechamento do estoque
    const fileData = fs.readFileSync(filePath, 'utf-8');
    const jsonData = JSON.parse(fileData);

    // Atualize o banco de dados com base na diferença de quantidades
    for (const product of jsonData.Products) {
      for (const stock of product.stocks) {
        const stockId = stock.id;
        const quantityOpen = stock.quantityOpen;
        const quantityNow = stock.quantityNow;

        // Verifique se houve alteração na quantidade
        if (quantityOpen !== quantityNow) {
          console.log(`Alterando estoque para o produto: ${product.name}, Stock ID: ${stockId}`);
          // Atualize a quantidade no Prisma
          await prisma.stock.update({
            where: { id: parseInt(stockId, 10) },
            data: { quantity: quantityNow },
          });
        }

        // Processar promoções associadas ao estoque
        const jsonPromotions = stock.promotions || [];
        // Obter promoções ativas no banco para este estoque
    const dbPromotions = await prisma.customerPromotions.findMany({
      where: { stockId: parseInt(stockId, 10), isActive: true },
    });

    const jsonPromotionIds = new Set(
      jsonPromotions.map((promo: any) => promo.customerId)
    );

    // Atualizar promoções no banco de dados
    for (const promotion of jsonPromotions) {
      const { customerId, promoValue } = promotion;
      await prisma.customerPromotions.upsert({
        where: {
          stockId_customerId: {
            stockId: stockId,
            customerId: customerId,
          },
        },
        update: { promoValue, isActive: true },
        create: {
          stockId: parseInt(stockId, 10),
          customerId: parseInt(customerId, 10),
          promoValue,
          isActive: true,
        },
      });
    }

    // Desativar promoções que não estão no JSON
    for (const dbPromotion of dbPromotions) {
      if (!jsonPromotionIds.has(dbPromotion.customerId.toString())) {
        await prisma.customerPromotions.update({
          where: { id: dbPromotion.id },
          data: { isActive: false },
        });
        console.log(
          `Promoção marcada como inativa: Stock ID ${stockId}, Customer ID ${dbPromotion.customerId}`
        );
      }
    }
      }
    }

    

    // Gerar um novo nome para o arquivo de fechamento
    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
    const newFileName = `${timestamp}stocks.json`;

    // Mover o arquivo para a pasta 'olders' com o novo nome
    const newFilePath = path.join(dirOld, newFileName);
    fs.renameSync(filePath, newFilePath);

    console.log(`Fechamento de estoque concluído e arquivo movido para: ${newFilePath}`);
  } catch (err) {
    console.error('Erro ao fechar o estoque:', err);
  } finally {
    await prisma.$disconnect();
  }
}

closeStock();
