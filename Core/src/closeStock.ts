import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { Product } from './models/Product.mongo';

const prisma = new PrismaClient();

async function closeStock(): Promise<void> {
  try {
    const dirToday = './Core/src/database/today';
    const dirOld = './Core/src/database/olders';

    // Verifique se o diretório 'today' existe e o arquivo 'output.json' está presente
    const filePath = path.join(dirToday, 'output.json');
    if (!fs.existsSync(filePath)) {
      console.error('Arquivo output.json não encontrado.');
      return;
    }

    // Carregar o conteúdo do arquivo JSON gerado no fechamento do estoque
    const fileData = fs.readFileSync(filePath, 'utf-8');
    const jsonData = JSON.parse(fileData);

    // Atualize o banco de dados com base na diferença de quantidades
    for (const product of jsonData.Products) {
      for (const stock of product.stocks) {
        const stockId = stock.id;
        const quantityOpen = stock.quantityOpen;
        const quantityNow = stock.quantityNow;

        // Verifique se houve alteração na quantidade
        if (quantityOpen !== quantityNow) {
          console.log(`Alterando estoque para o produto: ${product.name}, Stock ID: ${stockId}`);
          // Atualize a quantidade no Prisma
          await prisma.stock.update({
            where: { id: stockId },
            data: { quantity: quantityNow },
          });
        }
      }
    }

    // Gerar um novo nome para o arquivo de fechamento
    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
    const newFileName = `${timestamp}stocks.ts`;

    // Mover o arquivo para a pasta 'olders' com o novo nome
    const newFilePath = path.join(dirOld, newFileName);
    fs.renameSync(filePath, newFilePath);

    console.log(`Fechamento de estoque concluído e arquivo movido para: ${newFilePath}`);
  } catch (err) {
    console.error('Erro ao fechar o estoque:', err);
  } finally {
    await prisma.$disconnect();
  }
}

closeStock();
