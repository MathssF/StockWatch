import { MongoClient } from 'mongodb';

async function generateToMongoDB(): Promise<void> {
  const uri = "mongodb://localhost:27017"; // Substitua pelo URI do seu MongoDB
  const client = new MongoClient(uri);

  try {
    // Conecte ao banco de dados
    await client.connect();
    const database = client.db("myDatabase"); // Nome do banco de dados
    const collection = database.collection("products"); // Nome da coleção

    // Simulação de consulta (substitua com a lógica para obter os dados reais)
    const products = [
      {
        id: 1,
        name: "Produto A",
        price: 100,
        stock: [
          {
            id: 101,
            quantity: 50,
            customerPromotions: [
              { customerId: 201, promoValue: 10 }
            ],
            StockDetail: [
              {
                detail: {
                  id: 301,
                  value: "Detalhe X",
                  type: { id: 401, name: "Tipo Y" }
                }
              }
            ]
          }
        ]
      },
      // Adicione mais produtos conforme necessário
    ];

    // Formate os dados para salvar no MongoDB
    const formattedProducts = products.map(product => ({
      productId: product.id,
      name: product.name,
      price: product.price,
      promotions: product.stock.flatMap(stock =>
        stock.customerPromotions?.map(promotion => ({
          customerId: promotion.customerId.toString(),
          stockId: stock.id.toString(),
          promoValue: promotion.promoValue,
        })) || []
      ),
      stocks: product.stock.map(stock => ({
        id: stock.id.toString(),
        quantityOpen: stock.quantity,
        quantityNow: stock.quantity,
        details: stock.StockDetail?.map((stockDetail: any) => ({
          typeId: stockDetail.detail?.type?.id?.toString(),
          type: stockDetail.detail?.type?.name,
          detailId: stockDetail.detail?.id?.toString(),
          detailName: stockDetail.detail?.value
        })) || [],
        orders: {},
      }))
    }));

    // Insira os dados na coleção
    const result = await collection.insertMany(formattedProducts);

    console.log(`${result.insertedCount} produtos foram salvos no MongoDB.`);
  } catch (err) {
    console.error("Erro ao salvar no MongoDB:", err);
  } finally {
    await client.close();
  }
}

generateToMongoDB();
