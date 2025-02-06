import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { ObjectId } from 'mongodb';

const prisma = new PrismaClient();
const uri = "mongodb://localhost:27017"; // Substitua pelo URI do seu MongoDB
const client = new MongoClient(uri);
const dir = './Core/src/database/error';

async function syncMongoWithPrisma(): Promise<void> {
  try {
    await client.connect();
    const database = client.db("myDatabase");
    const collection = database.collection("products");
    const configCollection = database.collection("config");
    
    // Obtendo ou criando configuração global
    let config = await configCollection.findOne({ key: "global" });
    if (!config) {
      config = { _id: new ObjectId(), key: "global", open: false };
      await configCollection.insertOne(config);
    }
    
    // Obtendo produtos do Prisma
    const prismaProducts = await prisma.product.findMany({
      include: { stock: { include: {
        StockDetail: { include: { detail: { include: { type: true } } } },
        customerPromotions: true
      } } }
    });

    // Determinar status "open" com base nos estoques
    const allStocksOpen = prismaProducts.every(product => 
      product.stock.every(stock => stock.quantity > 0)
    );
    const newOpenStatus = allStocksOpen;
    
    // Atualizar configuração global se necessário
    if (config.open !== newOpenStatus) {
      await configCollection.updateOne(
        { key: "global" }, 
        { $set: { open: newOpenStatus } }
      );
    }
    
    // Processar produtos
    for (const product of prismaProducts) {
      const mongoProduct = await collection.findOne({ productId: product.id });
      
      if (mongoProduct) {
        // Verifica diferenças e gera arquivo de erro se houver
        const prismaData = JSON.stringify(product, null, 2);
        const mongoData = JSON.stringify(mongoProduct, null, 2);
        if (prismaData !== mongoData) {
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          const filePath = path.join(dir, 'sync_error.json');
          fs.writeFileSync(filePath, JSON.stringify({ prisma: product, mongo: mongoProduct }, null, 2));
          
          if (!config.open) {
            // Atualiza open global e sobrescreve todos os dados do MongoDB
            await configCollection.updateOne({ key: "global" }, { $set: { open: true } });
            await collection.updateOne(
              { productId: product.id },
              { $set: { ...product } }
            );
          }
        }
      } else {
        // Insere produto novo caso não exista no MongoDB
        await collection.insertOne({ productId: product.id, ...product });
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
