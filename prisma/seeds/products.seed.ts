import { PrismaClient } from '@prisma/client';
import productsTable from './products.table';

const prisma = new PrismaClient();


async function main() {
  for (let i = 0; i < productsTable.length -1; i++) {
    const sku = `${productsTable[i].name.split(' ').join('_').toUpperCase()}`;

    await prisma.product.create({
      data: {
        name: productsTable[i].name,
        sku: sku,
        price: productsTable[i].price,
        description: productsTable[i].description,
      },
    });
  }

  console.log('Produtos inseridos com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
