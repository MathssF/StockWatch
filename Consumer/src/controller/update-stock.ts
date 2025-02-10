import { PrismaClient } from '@prisma/client';
import { MongoClient } from 'mongodb';

const prisma = new PrismaClient();
const mongoClient = new MongoClient('mongodb://localhost:27017');
let mongoDb: any;
let mongoOpen = false;

async function connectMongo() {
  try {
    await mongoClient.connect();
    mongoDb = mongoClient.db('seuBanco');
    mongoOpen = true;
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
    mongoOpen = false;
  }
}

// Conecta ao MongoDB antes de executar operações
await connectMongo();

async function updateStock(productId: string, quantity: number) {
  try {
    if (mongoOpen) {
      const result = await mongoDb.collection('stocks').updateOne(
        { productId },
        { $inc: { quantity } },
        { upsert: true }
      );
      return result;
    } else {
      return await prisma.stock.update({
        where: { productId },
        data: { quantity: { increment: quantity } },
      });
    }
  } catch (error) {
    console.error('Erro ao atualizar estoque:', error);
  }
}

// Exemplo de uso
await updateStock('123', 10);
