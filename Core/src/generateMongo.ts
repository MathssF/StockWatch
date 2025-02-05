import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const uri = "mongodb://localhost:27017"; // Substitua pelo URI do seu MongoDB
const client = new MongoClient(uri);
const dir = './Core/src/database/error';

async function syncMongoWithPrisma(): Promise<void> {
  try {
    await client.connect();
    const database = client.db("myDatabase");
    const collection = database.collection("products");

    // Obtendo produtos do Prisma
    const prismaProducts = await prisma.product.findMany({
      include: { stock: { include: {
        StockDetail: { include: { detail: { include: { type: true } } } },
        customerPromotions: true
      } } }
    });

    for (const product of prismaProducts) {
      const mongoProduct = await collection.findOne({ productId: product.id });

      if (mongoProduct) {
        if (!mongoProduct.open) {
          // Atualiza o campo open para true
          await collection.updateOne({ productId: product.id }, { $set: { open: true } });
        } else {
          // Verifica diferenças e gera arquivo de erro se houver
          const prismaData = JSON.stringify(product, null, 2);
          const mongoData = JSON.stringify(mongoProduct, null, 2);
          if (prismaData !== mongoData) {
            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir, { recursive: true });
            }
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filePath = path.join(dir, `try(${timestamp}).json`);
            fs.writeFileSync(filePath, JSON.stringify({ prisma: product, mongo: mongoProduct }, null, 2));
          }
        }
      } else {
        // Insere produto novo caso não exista no MongoDB
        const formattedProduct = {
          productId: product.id,
          name: product.name,
          price: product.price,
          open: true,
          promotions: product.stock.flatMap(stock =>
            // ver aqui
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
            details: stock.StockDetail?.map(stockDetail => ({
              typeId: stockDetail.detail?.type?.id?.toString(),
              type: stockDetail.detail?.type?.name,
              detailId: stockDetail.detail?.id?.toString(),
              detailName: stockDetail.detail?.value
            })) || [],
            orders: {},
          }))
        };

        await collection.insertOne(formattedProduct);
      }
    }

    console.log("Sincronização concluída.");
  } catch (err) {
    console.error("Erro ao sincronizar MongoDB com Prisma:", err);
  } finally {
    await client.close();
    await prisma.$disconnect();
  }
}

syncMongoWithPrisma();
