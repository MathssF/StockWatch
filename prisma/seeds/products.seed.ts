import { PrismaClient } from '@prisma/client';
import productsTable from './products.table';


export default async function mainP(prisma: PrismaClient) {
  for (let i = 0; i < productsTable.length -1; i++) { // depois tirar o -1 aqui
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