import { PrismaClient } from '@prisma/client';
import productsTable from './products.table';
import mapToProcessedMatrix from '../utils/stockA.utils';
import generateArrayFinal from '../utils/stoclB.utils';
import { color, size, year, materials, style } from './datails.table';

export default async function mainS(prisma: PrismaClient) {
  let newColor: number[] = [];
  let newYear: number[] = [];
  let newMaterials: number[] = [];
  let newStyles: number[] = [];
  for (let i = 0; i < productsTable.length -1; i++) {
    const { details } = productsTable[i];
    if (!Array.isArray(details)) {
        continue;
      }
    let variables = 1;
    let divisions = [1, 1, 1, 1, 1];
    let types = [false, false, false, false, false];
    let newStock: number[] = [];
    if (details.includes(1)) {
      variables = variables * 5;
      divisions[0] = 5;
      types[0] = true;
      newColor = color.sort(() => Math.random() - 0.5).slice(0, 5);
    };
    if (details.includes(2)) {
      variables = variables * 4;
      divisions[1] = 4;
      types[1] = true;
    };
    if (details.includes(3)) {
      variables = variables * 3;
      divisions[2] = 3;
      types[2] = true;
      newYear = year.sort(() => Math.random() - 0.5).slice(0, 3);
    };
    if (details.includes(4)) {
      variables = variables * 2;
      divisions[3] = 2;
      types[3] = true;
      newMaterials = materials.sort(() => Math.random() - 0.5).slice(0, 2);
    };
    if (details.includes(5)) {
      variables = variables * 3;
      divisions[4] = 3;
      types[4] = true;
      newStyles = style.sort(() => Math.random() - 0.5).slice(0, 2);
      newStyles.push(501)
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
        orderItems  OrderItem[] // Relação oposta com OrderItem
        customerPromotions CustomerPromotions[]
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
    const finalStock = generateArrayFinal(
      stockMatrix, newColor,
      size, newYear,
      newMaterials, newStyles,
      types,
    )
    for(let m = 0; m < finalStock.length; m++) {
      for(let n = 0; n < finalStock[m].matrix.length; n++) {
        await prisma.stockDetail.create({
          data: {
            stockId: finalStock[m].id, 
            detailId: finalStock[m].matrix[n],
          }
        })
      }
    }

  }
  console.log('Estoque inserido com sucesso!')
}