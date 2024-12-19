import app from './app';
const PORT = Number(process.env.CONSUMER_PORT) || 3013;

app.listen(PORT, 'localhost', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
