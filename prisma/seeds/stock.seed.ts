import { PrismaClient } from '@prisma/client';
import productsTable from './products.table';
import { color, size, year, materials, style } from './datails.table';

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

    // Sorteando elementos aleatórios para cada atributo
    const Xcolor = productDetails[0] ? getRandomElements(color, 2) : [];
    const Xsize = productDetails[1] ? getRandomElements(size, 2) : [];
    const Xyear = productDetails[2] ? getRandomElements(year, 2) : [];
    const Xmaterials = productDetails[3] ? getRandomElements(materials, 2) : [];
    const Xstyle = productDetails[4] ? getRandomElements(style, 2) : [];

    // Gerar todas as combinações possíveis
    const attributeCombinations = generateCombinations([Xcolor, Xsize, Xyear, Xmaterials, Xstyle].filter(attr => attr.length > 0));

    for (const combination of attributeCombinations) {
      try {
        // Criando o Stock
        const stock = await prisma.stock.create({
          data: {
            productId: id,
            quantity: 10,
          },
        });

        // Criando StockDetails para cada atributo da combinação
        for (const detailId of combination) {
          if (detailId !== null) {
            await prisma.stockDetail.create({
              data: {
                stockId: stock.id,
                detailId: detailId,
              },
            });
          }
        }
      } catch (error) {
        console.error(`Erro ao criar Stock ou StockDetail para o produto ${id}:`, error);
      }
    }
  }

  console.log('Processo de inserção de estoque finalizado!');
}
