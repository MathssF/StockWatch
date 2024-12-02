import { PrismaClient } from '@prisma/client';
import productsTable from './products.table';

const prisma = new PrismaClient();

async function main() {
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
    } else {
      divisions[0] = 0;
    };
    if (details.includes(2)) {
      variables = variables * 4;
      divisions[1] = 4;
    } else {
      divisions[1] = 0;
    };
    if (details.includes(3)) {
      variables = variables * 3;
      divisions[2] = 3;
    } else {
      divisions[2] = 0;
    };
    if (details.includes(4)) {
      variables = variables * 2;
      divisions[3] = 2;
    } else {
      divisions[3] = 0;
    };
    if (details.includes(5)) {
      variables = variables * 3;
      divisions[4] = 3;
    } else {
      divisions[4] = 0;
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
    const stockMatrix = newStock.map((id) => {
      const matrix = [...divisions];
    //   let newMatrix: array[number[]]= [];
      let divValue = 1;
      for (let xi = 0; xi < divisions.length; xi++) {
        if (divisions[xi] = 0) continue;
        const divSize = divisions[xi];
        for (let xj = 0; xj < divSize; xj++) {
        matrix.push(divValue);
          }
        divValue++;
      }
      return {id, matrix};
    });
    // for (let w = 0; w < stockMatrix.length; w++) {
    //   //
    //   await prisma.stockDetail.create({
    //     data: {}
    //   })
    // }



    
    // const color = variables / divisions[0];
    // const size = variables / divisions[1];
    // const y = variables / divisions[2];
    // const material = variables / divisions[3];
    // const style = variables / divisions[4];

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