import express from 'express';

// Importa as rotas específicas do Producer e Consumer
import producerStockRoutes from './Producer/src/routes/stock.routes';
import consumerStockRoutes from './Consumer/src/routes/stock.routes';

const app = express();

// Middleware para parsing de JSON
app.use(express.json());

// Adiciona as rotas do Producer e Consumer com os prefixos
app.use('/producer/stock', producerStockRoutes);
app.use('/consumer/stock', consumerStockRoutes);

// Inicia o servidor principal
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.EXPRESS_HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Servidor Principal rodando em http://${HOST}:${PORT}`);
});
