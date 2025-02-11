import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGO_NAME || 'myDatabase';

async function randomizeStockQuantities() {
  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const productsCollection = db.collection('products');

    const products = await productsCollection.find({ "open": true }).toArray();

    if (!products.length) {
      throw new Error('No open products found.');
    }

    const bulkOperations = products.map(product => {
      if (Array.isArray(product.stocks)) {
        product.stocks = product.stocks.map(stock => ({
          ...stock,
          quantityNow: Math.floor(Math.random() * (25 - 5 + 1)) + 5, // Gera entre 5 e 25
        }));
      }
      return {
        updateOne: {
          filter: { _id: product._id },
          update: { $set: { stocks: product.stocks } },
        },
      };
    });

    if (bulkOperations.length > 0) {
      await productsCollection.bulkWrite(bulkOperations);
      console.log('Stock quantities have been randomized successfully!');
    } else {
      console.log('No stock quantities updated.');
    }
  } catch (error) {
    console.error('Error while randomizing stock quantities:', error);
  } finally {
    await client.close();
  }
}

randomizeStockQuantities();
