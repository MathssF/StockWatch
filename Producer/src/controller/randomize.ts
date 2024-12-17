import fs from 'fs/promises';
import path from 'path';

const filePath = path.resolve(__dirname, '../../Core/src/database/today/output.Json');

async function randomizeStockQuantities() {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    const stocks = JSON.parse(data);

    const updatedStocks = stocks.map((stock: { stockId: string }) => ({
      ...stock,
      quantity: Math.floor(Math.random() * (25 - 5 + 1)) + 5, // Gera número entre 5 e 25
    }));

    await fs.writeFile(filePath, JSON.stringify(updatedStocks, null, 2));
    console.log('Stock quantities have been randomized successfully!');
  } catch (error) {
    console.error('Error while randomizing stock quantities:', error);
  }
}

randomizeStockQuantities();
