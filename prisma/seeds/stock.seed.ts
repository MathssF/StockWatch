import { PrismaClient } from '@prisma/client';
import productsTable from './products.table';
import mapToProcessedMatrix from '../utils/stockA.utils';
import { color, size, year, materials, style } from './datails.table';

const prisma = new PrismaClient();

async function main() {
  let newColor = [];
//   let newSize = [];
  let newYear = [];
  let newMaterials = [];
  let newStyles = [];
  for (let i = 0; i < productsTable.length -1; i++) {
    const { details } = productsTable[i];
    if (!Array.isArray(details)) {
        continue;
      }
    let variables = 1;
    let divisions = [1, 1, 1, 1, 1];
    let newStock: number[] = [];
    if (details.includes(1)) {
      variables = variables * 5;
      divisions[0] = 5;

    // } else {
    //   divisions[0] = 0;
    };
    if (details.includes(2)) {
      variables = variables * 4;
      divisions[1] = 4;
    // } else {
    //   divisions[1] = 0;
    };
    if (details.includes(3)) {
      variables = variables * 3;
      divisions[2] = 3;
    // } else {
    //   divisions[2] = 0;
    };
    if (details.includes(4)) {
      variables = variables * 2;
      divisions[3] = 2;
    // } else {
    //   divisions[3] = 0;
    };
    if (details.includes(5)) {
      variables = variables * 3;
      divisions[4] = 3;
    // } else {
    //   divisions[4] = 0;
    };

    // Model no Prisma para servir de exemplo
    /*
    model Stock {
        id          Int      @id @default(autoincrement())
        productId   Int
        quantity    Int      // Quantidade disponível para essa variação específica
        product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
        createdAt   DateTime @default(now())
        updatedAt   DateTime @updatedAt
        StockDetail StockDetail[]
    }
    */
    for (let j = 0; j < variables; j++) {
      const stock = await prisma.stock.create({
        data: {
          productId: productsTable[i].id,
          quantity: 10,
        }
      });
      newStock.push(stock.id);
    }

    // Model no prisma para a relação de stock com detalhes
    /*
    model StockDetail {
        id          Int      @id @default(autoincrement())
        stockId     Int
        detailId    Int
        stock       Stock    @relation(fields: [stockId], references: [id], onDelete: Cascade)
        detail      Detail   @relation(fields: [detailId], references: [id], onDelete: Cascade)
        createdAt   DateTime @default(now())
        updatedAt   DateTime @updatedAt
    }
    */
    const stockMatrix = mapToProcessedMatrix(newStock, divisions);
    for(let w = 0; w < stockMatrix.length; w++) {
      //

    }

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