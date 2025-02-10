import { MongoClient, ObjectId } from 'mongodb';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const uri = process.env.MONGO_URL || "mongodb://localhost:27017";
const mName = process.env.MONGO_NAME || "stockwatch";
const client = new MongoClient(uri);
const errorDir = './Core/src/database/error';

async function closeStock(): Promise<void> {
  try {
    await client.connect();
    const database = client.db(mName);
    const collection = database.collection("products");
    const logCollection = database.collection("logs");

    const products = await collection.find({}).toArray();

    for (const product of products) {
      for (const stock of product.stock) {
        const stockId = stock.id.toString();
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

          // Log da alteração no MongoDB
          await logCollection.insertOne({
            timestamp: new Date(),
            productId: product.productId,
            stockId,
            action: 'stock quantity update',
            details: { quantityOpen, quantityNow },
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

          // Log da atualização de promoção
          await logCollection.insertOne({
            timestamp: new Date(),
            productId: product.productId,
            stockId,
            action: 'promotion update',
            details: { customerId, promoValue },
          });
        }

        // Desativar promoções que não estão no JSON
        for (const dbPromotion of dbPromotions) {
          if (!jsonPromotionIds.has(dbPromotion.customerId.toString())) {
            await prisma.customerPromotions.update({
              where: { id: dbPromotion.id },
              data: { isActive: false },
            });

            // Log da desativação de promoção
            await logCollection.insertOne({
              timestamp: new Date(),
              productId: product.productId,
              stockId,
              action: 'promotion deactivated',
              details: { customerId: dbPromotion.customerId },
            });

            console.log(
              `Promoção marcada como inativa: Stock ID ${stockId}, Customer ID ${dbPromotion.customerId}`
            );
          }
        }
      }
    }

    // Atualizando a configuração para 'open: true'
    const configCollection = database.collection("config");
    await configCollection.updateOne(
      { key: "global" },
      { $set: { open: true } },
      { upsert: true }
    );

    console.log("Fechamento de estoque concluído.");

  } catch (err) {
    console.error('Erro ao fechar o estoque:', err);
  } finally {
    await client.close();
    await prisma.$disconnect();
  }
}

closeStock();
