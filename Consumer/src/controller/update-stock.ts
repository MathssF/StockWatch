import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { consumeQueue } from '../rabbitmq.consumer';  // Importando a função consumeQueue
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const queueName = 'low-stock-queue';
const filePath = path.join(__dirname, '../../../Core/src/database/today/output.json');

// Função para processar as mensagens da fila
export const updateStock = async (message: string) => {
  console.log('Entrou no updateStock');
  const msgs = await consumeQueue(queueName);
  const content = JSON.parse(message);
  console.log('Mensagem recebida:', content);

  let updatedStocks: { stockId: number; quantityAdded: number; price: number }[] = [];

  // Atualizando output.json ou o banco de dados
  if (fs.existsSync(filePath)) {
    console.log('Atualizando output.json...');
    const fileData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    content.products.forEach((update: any) => {
      fileData.Products.forEach((product: any) => {
        product.stocks.forEach((stock: any) => {
          if (stock.id === update.stockId) {
            const addedQuantity = update.quantityNeeded || 0;
            stock.quantityNow += addedQuantity;

            updatedStocks.push({
              stockId: stock.id,
              quantityAdded: addedQuantity,
              price: stock.price || 0,
            });
          }
        });
      });
    });

    fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2));
    console.log('output.json atualizado com sucesso!');
  } else {
    console.log('output.json não encontrado. Atualizando o banco de dados...');
    for (const update of content.products) {
      const stock = await prisma.stock.findUnique({
        where: { id: update.stockId },
        select: { quantity: true, product: { select: { price: true } } },
      });

      console.log('dentro do for');
      if (stock) {
        const addedQuantity = update.quantityNeeded || 0;
        console.log('Stock: ', addedQuantity);
        await prisma.stock.update({
          where: { id: update.stockId },
          data: { quantity: stock.quantity + addedQuantity },
        });

        updatedStocks.push({
          stockId: update.stockId,
          quantityAdded: addedQuantity,
          price: stock.product?.price || 0,
        });
      }
    }
    console.log('Banco de dados atualizado com sucesso!');
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
