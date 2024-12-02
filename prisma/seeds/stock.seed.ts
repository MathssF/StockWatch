import { PrismaClient } from '@prisma/client';
import productsTable from './products.table';

const prisma = new PrismaClient();

async function main() {
  //
  for (let i = 0; i < productsTable.length -1; i++) {
    const { details } = productsTable[i];
    if (!Array.isArray(details)) {
        continue;
      }
    let variables = 1;
    let divisions = [1, 1, 1, 1, 1]
    if (details.includes(1)) {
      variables = variables * 5;
      divisions[0] = 5;
    };
    if (details.includes(2)) {
      variables = variables * 4;
      divisions[1] = 4;
    };
    if (details.includes(3)) {
      variables = variables * 3;
      divisions[2] = 3;
    };
    if (details.includes(4)) {
      variables = variables * 2;
      divisions[3] = 2;
    };
    if (details.includes(5)) {
      variables = variables * 3;
      divisions[4] = 3;
    };

    //
    for (let j = 0; j > variables; j++) {
      //
    }
    await prisma.stock.create({
      //
      data: 
    })

  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });