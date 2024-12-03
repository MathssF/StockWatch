import { PrismaClient } from '@prisma/client';
import mainD from "./details.seed";
import mainP from "./products.seed";
import mainS from "./stock.seed";

const prisma = new PrismaClient();

async function main() {
  try {
    await mainD(prisma);
    await mainP(prisma);
    await mainS(prisma);
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    // Desconecta após todas as migrações serem executadas
    await prisma.$disconnect();
  }
}

main();