import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Caminho do arquivo JSON
const JSON_FILE_PATH = './database/today/output.json';

// Função para verificar se o JSON existe
const isJsonFileAvailable = (): boolean => fs.existsSync(JSON_FILE_PATH);

// Função para ler o arquivo JSON
const readJsonFile = (): any => {
  const fileContent = fs.readFileSync(JSON_FILE_PATH, 'utf-8');
  return JSON.parse(fileContent);
};

// Função para buscar produtos
export async function FindProducts(): Promise<any> {
  if (isJsonFileAvailable()) {
    return { mode: 'MongoDB', data: readJsonFile() };
  }

  const products = await prisma.product.findMany({
    include: {
      stock: {
        include: {
          StockDetail: {
            include: {
              detail: {
                include: {
                  type: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return {
    mode: 'MySQL',
    data: products.map((product) => ({
      name: product.name,
      price: product.price,
      promotions: {},
      stocks: product.stock.map((stock) => ({
        id: stock.id.toString(),
        quantityOpen: stock.quantity,
        quantityNow: stock.quantity,
        details: stock.StockDetail.map((stockDetail) => ({
          typeId: stockDetail.detail.type.id.toString(),
          type: stockDetail.detail.type.name,
          detailId: stockDetail.detail.id.toString(),
          detailName: stockDetail.detail.value,
        })),
        orders: {},
      })),
    })),
  };
}

// Função para buscar estoque
export async function FindStocks(): Promise<any> {
  if (isJsonFileAvailable()) {
    const data = readJsonFile();
    return { mode: 'MongoDB', stocks: data.Products.flatMap((product: any) => product.stocks) };
  }

  const stocks = await prisma.stock.findMany({
    include: {
      StockDetail: {
        include: {
          detail: {
            include: {
              type: true,
            },
          },
        },
      },
      product: true,
    },
  });

  return {
    mode: 'MySQL',
    stocks: stocks.map((stock) => ({
      productId: stock.productId,
      productName: stock.product.name,
      stockId: stock.id,
      quantity: stock.quantity,
      details: stock.StockDetail.map((stockDetail) => ({
        typeId: stockDetail.detail.type.id.toString(),
        type: stockDetail.detail.type.name,
        detailId: stockDetail.detail.id.toString(),
        detailName: stockDetail.detail.value,
      })),
    })),
  };
}

// Função para atualizar estoque
export async function UpdateStock(stockId: number, quantityNow: number): Promise<any> {
  if (!quantityNow || typeof quantityNow !== 'number') {
    throw new Error('Quantidade inválida');
  }

  if (isJsonFileAvailable()) {
    const data = readJsonFile();
    const stock = data.Products.flatMap((product: any) => product.stocks).find(
      (stock: any) => stock.id === stockId.toString()
    );

    if (!stock) {
      throw new Error('Estoque não encontrado no JSON');
    }

    const oldQuantity = stock.quantityNow;
    stock.quantityNow = quantityNow;
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(data, null, 2));

    return {
      mode: 'MongoDB',
      stockId,
      oldQuantity,
      newQuantity: quantityNow,
    };
  }

  const stock = await prisma.stock.update({
    where: { id: stockId },
    data: { quantity: quantityNow },
  });

  return {
    mode: 'MySQL',
    stockId: stock.id,
    oldQuantity: stock.quantity,
    newQuantity: quantityNow,
  };
}
