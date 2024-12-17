import fs from 'fs/promises';
import path from 'path';

// Caminho do arquivo output.json
const filePath = path.resolve(__dirname, 'output.json');

// Função principal para randomizar quantidades
async function randomizeStockQuantities() {
  try {
    // Lê o arquivo output.json
    const data = await fs.readFile(filePath, 'utf-8');
    const stocks = JSON.parse(data);

    // Percorre cada stock e adiciona uma quantidade aleatória entre 5 e 25
    const updatedStocks = stocks.map((stock: { stockId: string }) => ({
      ...stock,
      quantity: Math.floor(Math.random() * (25 - 5 + 1)) + 5, // Gera um número entre 5 e 25
    }));

    // Salva o resultado no mesmo arquivo
    await fs.writeFile(filePath, JSON.stringify(updatedStocks, null, 2));
    console.log('Stock quantities have been randomized successfully!');
  } catch (error) {
    console.error('Error while randomizing stock quantities:', error);
  }
}

// Executa a função
randomizeStockQuantities();
