import app from './app';
const PORT = Number(process.env.CONSUMER_PORT) || 3023;
const HOST = process.env.EXPRESS_HOST || 'localhost';

app.listen(PORT, HOST, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
