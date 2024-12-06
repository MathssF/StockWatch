import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    // Desabilitar as restrições de chaves estrangeiras temporariamente para evitar conflitos
    await prisma.$executeRaw`SET foreign_key_checks = 0`;

    // Deletar os registros em ordem reversa para evitar problemas com chaves estrangeiras
    // await prisma.customerPromotions.deleteMany({});
    // await prisma.customerPreferences.deleteMany({});
    await prisma.orderItem.deleteMany({});
    // await prisma.orders.deleteMany({});
    await prisma.customer.deleteMany({});
    await prisma.rabbitMQMessage.deleteMany({});
    await prisma.stockDetail.deleteMany({});
    await prisma.stock.deleteMany({});
    await prisma.detail.deleteMany({});
    await prisma.detailType.deleteMany({});
    await prisma.product.deleteMany({});

    // Reabilitar as restrições de chaves estrangeiras após a exclusão
    await prisma.$executeRaw`SET foreign_key_checks = 1`;

    console.log('Banco de dados limpo com sucesso!');
  } catch (error) {
    console.error('Erro ao limpar o banco de dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();
