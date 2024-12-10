import { PrismaClient } from '@prisma/client';
import productsTable from './products.table';
import { details, color, size, year, materials, style } from './datails.table';

function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateCombinations(arrays: any[][]): any[][] {
  const results: any[][] = [];
  const current: any[] = Array(arrays.length).fill(null);

  const backtrack = (level: number) => {
    if (level === arrays.length) {
      results.push([...current]);
      return;
    }

    for (const element of arrays[level]) {
      current[level] = element;
      backtrack(level + 1);
    }
  };

  backtrack(0);
  return results;
}

export default async function mainS(prisma: PrismaClient) {
  for (const product of productsTable) {
    const { id, details: productDetails } = product;
    const Xcolor = productDetails[0] ? getRandomElements(color, 2) : [null];
    const Xsize = productDetails[1] ? getRandomElements(size, 2) : [null];
    const Xyear = productDetails[2] ? getRandomElements(year, 2) : [null];
    const Xmaterials = productDetails[3] ? getRandomElements(materials, 2) : [null];
    const Xstyle = productDetails[4] ? getRandomElements(style, 2) : [null];

    const attributeCombinations = generateCombinations([Xcolor, Xsize, Xyear, Xmaterials, Xstyle]);

    console.log(`Tentando criar o produto: ${id}`);
    for (const combination of attributeCombinations) {
      const [colorValue, sizeValue, yearValue, materialValue, styleValue] = combination;
      try {
        const stock = await prisma.stock.create({
          data: {
            productId: id,
            quantity: 10,
          },
        });

        console.log(`Primeira parte feita para o produto ${id} com atributos:`, combination);

        await prisma.stockDetail.create({
          data: {
            stockId: stock.id,
            color: colorValue, // Ta na cara
            size: sizeValue,
            year: yearValue,
            material: materialValue,
            style: styleValue,
          },
        });

        console.log(`StockDetail criado com sucesso! Produto: ${id}, Atributos: ${combination}`);
      } catch (error) {
        console.error(`Erro ao criar estoque para o produto ${id} com atributos ${combination}:`, error);
      }
    }
  }

  console.log('Estoque inserido com sucesso!');
}
