import mongoose from 'mongoose';
import fs from 'fs';
import { Product } from './models/Product.mongo';
import path from 'path';

mongoose.connect('mongodb://localhost:27017/your_database', {})
  .catch(err => console.error('Erro ao conectar ao banco de dados:', err));

async function generateJson(): Promise<void> {
  try {
    const products = await Product.find().populate({
      path: 'stock',
      populate: {
        path: 'stockDetails',
        populate: {
          path: 'detailId',
          populate: {
            path: 'typeId'
          }
        }
      }
    });

    const jsonOutput = {
      Op: "ADM",
      Day: new Date().toLocaleDateString(),
      Products: products.map(product => ({
        name: product.name,
        price: product.price,
        promotions: {},
        stocks: product.stock.map((stock: any) => ({
          id: stock._id.toString(),
          quantityOpen: stock.quantity,
          quantityNow: stock.quantity,
          details: stock.stockDetails.map((stockDetail: any) => ({
            typeId: stockDetail.detailId.typeId._id.toString(),
            type: stockDetail.detailId.typeId.name,
            detailId: stockDetail.detailId._id.toString(),
            detailName: stockDetail.detailId.value
          })),
          orders: {},
        }))
      }))
    };

    const dir = './database/today';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(path.join(dir, 'output.json'), JSON.stringify(jsonOutput, null, 2));

    console.log('Arquivo JSON gerado com sucesso!');
  } catch (err) {
    console.error('Erro ao gerar o JSON:', err);
  } finally {
    mongoose.connection.close();
  }
}

generateJson();
