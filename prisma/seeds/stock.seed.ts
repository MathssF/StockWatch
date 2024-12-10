import { PrismaClient } from '@prisma/client';
import productsTable from './products.table';
import { details, color, size, year, materials, style } from './datails.table';

// Aqui vou mudar tudo

export default async function mainS(prisma: PrismaClient) {
  let variants = 1;
  let Xcolor = [];
  let Xsize = [];
  let Xyear = [];
  let Xmaterials = [];
  let Xstyle = []
    for (let i =0; i < productsTable.length; i++) {
      if (productsTable[i].details[0]) {
        variants *= 2
      }if (productsTable[i].details[1]) {
        variants *= 2
      }if (productsTable[i].details[2]) {
        variants *= 2
      }if (productsTable[i].details[3]) {
        variants *= 2
      }if (productsTable[i].details[4]) {
        variants *= 2
      }
      console.log('Tentando criar o produto: ', productsTable[i].id);
      for (let j = 0; j < variants; j++) {
        console.log(' Na variavel: ', j)
        try {
          const stock = await prisma.stock.create({
            data: {
              productId: productsTable[i].id,
              quantity: 10,
           }
          });
          console.log('Primeira parte feita na v= ', j);
          await prisma.stockDetail.create({
            data
          });
          console.log('Stock criado com sucesso! No produto: ', productsTable[i].id, ' E na variavel ', j);
        } catch (error) {
          console.error('Erro: ', error);
        }
      }
  }
  console.log('Estoque inserido com sucesso!')
}