const mongoose = require('mongoose');
const fs = require('fs');
const Product = require('./models/Product');  // Importando o modelo Product

mongoose.connect('mongodb://localhost:27017/seu-banco-de-dados', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function generateJson() {
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
        stocks: product.stock.map(stock => ({
          id: stock._id,
          qtd: stock.quantity,
          details: stock.stockDetails.map(stockDetail => ({
            typeId: stockDetail.detailId.typeId._id,
            type: stockDetail.detailId.typeId.name,
            detailId: stockDetail.detailId._id,
            detailName: stockDetail.detailId.value
          }))
        }))
      }))
    };

    // Salvando o JSON em um arquivo
    fs.writeFileSync('output.json', JSON.stringify(jsonOutput, null, 2));

    console.log('Arquivo JSON gerado com sucesso!');
  } catch (err) {
    console.error('Erro ao gerar o JSON:', err);
  }
}

generateJson();
