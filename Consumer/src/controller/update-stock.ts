import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { consumeQueue } from '../rabbitmq.consumer';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const filePath = path.join(__dirname, '../../../Core/src/database/today/output.json');
const logDir = path.join(__dirname, '../../../Core/src/database/update-logs');

const queueNames = JSON.parse(process.env.RABBITMQ_QUEUE_NAMES || '{}');
const durable = JSON.parse(process.env.RABBIT_QUEUE_DURABLE || '{}');

const queueName = queueNames.checkStock || 'low-stock-queue';
const durableValue = durable.checkStock || false;

export const updateStock = async (message?: string) => {
  console.log('Entrou no updateStock');
  let content;
  let mode = 0;
  const updatedStocks: { stockId: number; quantityAdded: number; price: number }[] = [];
  let createdOrder = null;

  if (message) {
    console.log('Com Body');
    content = JSON.parse(message);
  } else {
    console.log('Sem Body');
    content = await consumeQueue(queueName, durableValue);
    console.log('Finalizada o Consumer');
  }

  const data = JSON.parse(content.message);
  console.log('Mensagem recebida:', content);

  if (data.products && data.products.length > 0) {
    if (fs.existsSync(filePath)) {
      console.log('Atualizando output.json...');
      const fileData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      let productFound = false;
      for (const product of data.products) {
        const { stockId, quantityNeeded } = product;

        console.log(`Atualizando estoque do produto ${stockId}`);
        for (const fileProduct of fileData.Products) {
          for (const stock of fileProduct.stocks) {
            if (stock.id === stockId) {
              const addedQuantity = quantityNeeded || 0;
              stock.quantityNow += addedQuantity;

              updatedStocks.push({
                stockId: Number(stock.id),
                quantityAdded: addedQuantity,
                price: fileProduct.price || 0,
              });

              productFound = true;
            }
          }
        }
      }

      if (productFound) {
        fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2));
        console.log('output.json atualizado com sucesso!');
        mode = 1;
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
            stockId,
            quantityAdded: addedQuantity,
            price: stock.product?.price || 0,
          });
        }
      }
      console.log('Banco de dados atualizado com sucesso!');
      mode = 2;
    }
  } else {
    console.log('Nenhum produto para atualizar. Mensagem:', data.notification);
    return { updatedStocks: [], createdOrder: null, mode: 0 };
  }

  if (updatedStocks.length > 0) {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().replace(/[:.]/g, '-');
    const logFilePath = path.join(logDir, `${formattedDate}.json`);
    fs.writeFileSync(logFilePath, JSON.stringify(updatedStocks, null, 2));
    console.log(`Log de atualização de estoque gerado em: ${logFilePath}`);
  }

  if (updatedStocks.length > 0) {
    const orderNumber = `ORD-${uuidv4().split('-')[0]}`;
    createdOrder = await prisma.order.create({
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
    console.log('Ordem registrada com sucesso:', createdOrder);
  }

  return { updatedStocks, createdOrder, mode };
};
