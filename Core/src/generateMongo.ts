import { MongoClient, ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const uri = process.env.MONGO_URL || "mongodb://localhost:27017";
const mName = process.env.MONGO_NAME || "stockwatch";
const client = new MongoClient(uri);
const errorDir = './Core/src/database/error';

async function syncMongoWithPrisma(): Promise<void> {
  try {
    await client.connect();
    const database = client.db(mName);
    const collection = database.collection("products");
    const configCollection = database.collection("config");
    
    // Obtendo ou criando configuração global
    let config = await configCollection.findOne({ key: "global" });
    if (!config) {
      config = { _id: new ObjectId(), key: "global", open: false };
      await configCollection.insertOne(config);
    }
    
    const prismaProducts = await prisma.product.findMany({
      include: {
        stock: {
          include: {
            StockDetail: {
              include: { detail: { include: { type: true } } }
            },
            customerPromotions: true
          }
        }
      }
    });
    
    for (const product of prismaProducts) {
      const mongoProduct = await collection.findOne({ productId: product.id });
      const productData = {
        productId: product.id,
        name: product.name,
        price: product.price,
        stock: product.stock.map(stock => ({
          id: stock.id,
          quantity: stock.quantity,
          details: stock.StockDetail?.map(sd => ({
            typeId: sd.detail?.type?.id,
            type: sd.detail?.type?.name,
            detailId: sd.detail?.id,
            detailName: sd.detail?.value
          })) || []
        }))
      };
      
      if (!mongoProduct) {
        await collection.insertOne(productData);
        continue;
      }
      
      const prismaDataString = JSON.stringify(productData);
      const mongoDataString = JSON.stringify(mongoProduct);
      
      if (prismaDataString !== mongoDataString) {
        if (!fs.existsSync(errorDir)) {
          fs.mkdirSync(errorDir, { recursive: true });
        }
        fs.writeFileSync(path.join(errorDir, 'sync_error.json'), JSON.stringify({ prisma: productData, mongo: mongoProduct }, null, 2));
        
        if (!config.open) {
          await collection.updateOne({ productId: product.id }, { $set: productData });
        }
      }
    }
    
    if (!config.open) {
      await configCollection.updateOne({ key: "global" }, { $set: { open: true } });
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
