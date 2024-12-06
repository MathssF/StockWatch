import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function generateSeparateJson(): Promise<void> {
  try {
    // Detalhes dos tipos
    const detailTypes = await prisma.detailType.findMany();
    saveJsonFile('detailTypes.json', detailTypes);

    // Detalhes
    const details = await prisma.detail.findMany({
      include: {
        type: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    saveJsonFile('details.json', details);

    // Produtos
    const products = await prisma.product.findMany();
    saveJsonFile('products.json', products);

    // Estoques
    const stocks = await prisma.stock.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    saveJsonFile('stocks.json', stocks);

    // Detalhes do Estoque
    const stockDetails = await prisma.stockDetail.findMany({
      include: {
        detail: {
          include: {
            type: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        stock: {
          select: {
            id: true,
          },
        },
      },
    });
    saveJsonFile('stockDetails.json', stockDetails);

    console.log('Arquivos JSON gerados com sucesso!');
  } catch (err) {
    console.error('Erro ao gerar os JSONs:', err);
  } finally {
    await prisma.$disconnect();
  }
}

// Função para salvar os arquivos JSON
function saveJsonFile(fileName: string, data: any): void {
  const dir = './prisma/tests';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filePath = path.join(dir, fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

generateSeparateJson();
