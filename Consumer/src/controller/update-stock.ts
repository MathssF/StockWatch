import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const queueName = 'low-stock-queue';
const filePath = path.join(__dirname, '../../../Core/src/database/today/output.json');
const logDir = path.join(__dirname, '../../../Core/src/database/update-logs');


// Função para processar as mensagens da fila
export const updateStock = async (message: string) => {
  console.log('Entrou no updateStock');
  const content = JSON.parse(message);
  const data = JSON.parse(content.message);

  console.log('Mensagem recebida:', content);
  console.log('Teste ', data);

  let updatedStocks: { stockId: number; quantityAdded: number; price: number }[] = [];

  // Atualizando output.json ou o banco de dados
  if (fs.existsSync(filePath)) {
    console.log('Atualizando output.json...');
    const fileData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    let productFound = false;
    for (const product of data.products) {
      const { stockId, quantityNow, quantityNeeded } = product;

      console.log(`Atualizando estoque do produto ${stockId}`);

      for (const fileProduct of fileData.Products) {
        for (const stock of fileProduct.stocks) {
          if (stock.id === stockId) {
            const addedQuantity = quantityNeeded || 0;
            stock.quantityNow += addedQuantity;

            updatedStocks.push({
              stockId: stock.id,
              quantityAdded: addedQuantity,
              price: stock.price || 0,
            });

            productFound = true;
          }
        }
      }
    }

    if (productFound) {
      fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2));
      console.log('output.json atualizado com sucesso!');
    }
  } else {
    console.log('output.json não encontrado. Atualizando o banco de dados...');
    for (const product of data.products) {
      const { stockId, quantityNeeded } = product;

      const stock = await prisma.stock.findUnique({
        where: { id: stockId },
        select: { quantity: true, product: { select: { price: true } } },
      });

      if (stock) {
        const addedQuantity = quantityNeeded || 0;
        await prisma.stock.update({
          where: { id: stockId },
          data: { quantity: stock.quantity + addedQuantity },
        });

        updatedStocks.push({
          stockId: stockId,
          quantityAdded: addedQuantity,
          price: stock.product?.price || 0,
        });
      }
    }
    console.log('Banco de dados atualizado com sucesso!');
  }

  // Criar um log com as atualizações
  if (updatedStocks.length > 0) {
    // Verifica se o diretório existe, caso contrário, cria
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // Nome do arquivo com base na data e hora
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().replace(/[:.]/g, '-'); // Formatar para um nome de arquivo válido
    const logFilePath = path.join(logDir, `${formattedDate}.json`);

    // Escrever as atualizações no arquivo de log
    fs.writeFileSync(logFilePath, JSON.stringify(updatedStocks, null, 2));
    console.log(`Log de atualização de estoque gerado em: ${logFilePath}`);
  }


  // Criar uma ordem
  if (updatedStocks.length > 0) {
    const orderNumber = `ORD-${uuidv4().split('-')[0]}`;
    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: 'PENDING',
        items: {
          create: updatedStocks.map((stock) => ({
            stockId: stock.stockId,
            quantity: stock.quantityAdded,
            price: stock.price,
          })),
        },
      },
      include: { items: true },
    });
    console.log('Ordem registrada com sucesso:', order);
  }
};
