import { PrismaClient } from '@prisma/client';
import productsTable from './products.table';


export default async function mainP(prisma: PrismaClient) {
  for (let i = 0; i < productsTable.length; i++) {
    const sku = `${productsTable[i].name.split(' ').join('_').toUpperCase()}`;

    try {
    await prisma.product.create({
      data: {
        name: productsTable[i].name,
        sku: sku,
        price: productsTable[i].price,
        description: productsTable[i].description,
      },
    });
  } catch (error) {
    console.error('Erro: ', error)
  }
  }

  console.log('Produtos inseridos com sucesso!');
}