import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetAutoIncrement() {
  await prisma.$executeRawUnsafe(`ALTER TABLE product AUTO_INCREMENT = 1`);
  await prisma.$executeRawUnsafe(`ALTER TABLE stock AUTO_INCREMENT = 1`);
  await prisma.$executeRawUnsafe(`ALTER TABLE stockDetail AUTO_INCREMENT = 1`);
  await prisma.$executeRawUnsafe(`ALTER TABLE detail AUTO_INCREMENT = 1`);
  await prisma.$executeRawUnsafe(`ALTER TABLE detailType AUTO_INCREMENT = 1`);
  await prisma.$executeRawUnsafe(`ALTER TABLE customer AUTO_INCREMENT = 1`);

  console.log('Auto-increment counters reset!');
  await prisma.$disconnect();
}

resetAutoIncrement().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
