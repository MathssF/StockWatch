import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateRandomPrice(): number {
  const randomPrice = Math.floor(Math.random() * (12)) + 2;
  const multPrice = randomPrice * 10;
  const valorPrice = multPrice + 9;
  return parseFloat(`${valorPrice},99`);
  return randomPrice;
}

async function seed() {
  const products = [
    'Camisa Larga',
    'Camisa Longa',
    'Camisa Polo',
    'Camisa Social',
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

  // Ordenando os produtos em ordem alfabética
  const sortedProducts = products.sort();

  for (const name of sortedProducts) {
    const sku = `${name.split(' ').join('_').toUpperCase()}`;
    const price = generateRandomPrice(); 

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
