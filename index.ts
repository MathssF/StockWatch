import app from './app';

// Importação dos apps de Producer e Consumer
import producerApp from './Producer/src/app';
import consumerApp from './Consumer/src/app';

// Porta e host usando variáveis de ambiente
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.EXPRESS_HOST || '0.0.0.0';

// Configuração das rotas para Producer e Consumer
app.use('/producer', producerApp); // Rotas do Producer estarão em /producer
app.use('/consumer', consumerApp); // Rotas do Consumer estarão em /consumer

// Inicia o servidor principal
app.listen(PORT, HOST, () => {
  console.log(`Servidor Principal rodando em http://${HOST}:${PORT}`);
});
