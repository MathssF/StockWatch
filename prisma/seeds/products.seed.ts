import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


async function seed() {
  const products = [
    'Camisa Larga',
    'Camisa Longa',
    'Camisa Polo',
    'Camisa Social',
    'Camisa Estampada',
    'Calça',
    'Calça Social',
    'Bermuda',
    'Sapato',
    'Tênis',
    'Máscara',
    'Colar',
    'Jaqueta',
    'Luvas',
    'Meias',
    'Touca',
    'Chapéu',
  ];

  const sortedProducts = products.sort();

  for (const name of sortedProducts) {
    const sku = `${name.split(' ').join('_').toUpperCase()}`;
    const price = Math.floor(Math.random() * (12)) + 2;

    await prisma.product.create({
      data: {
        name: name,
        sku: sku,
        price: price,
        description: `${name} de exemplo`,
      },
    });
  }

  console.log('Produtos inseridos com sucesso!');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
