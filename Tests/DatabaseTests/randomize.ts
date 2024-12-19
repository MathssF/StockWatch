import fs from 'fs/promises';
import path from 'path';

const filePath = path.resolve(__dirname, '../../../Core/src/database/today/output.json');

async function randomizeStockQuantities() {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    const parsedData = JSON.parse(data);

    // Verifica se o JSON possui a propriedade Products
    if (!parsedData.Products || !Array.isArray(parsedData.Products)) {
        throw new Error('Invalid JSON format: Missing "Products" array.');
    }

    const updatedProducts = parsedData.Products.map((product: any) => {
        if (Array.isArray(product.stocks)) {
          product.stocks = product.stocks.map((stock: any) => ({
            ...stock,
            quantityNow: Math.floor(Math.random() * (25 - 5 + 1)) + 5, // Gera entre 5 e 25
          }));
        }
        return product;
      });

    await fs.writeFile(filePath, JSON.stringify(parsedData, null, 2));
    console.log('Stock quantities have been randomized successfully!');
  } catch (error) {
    console.error('Error while randomizing stock quantities:', error);
  }
}

randomizeStockQuantities();
