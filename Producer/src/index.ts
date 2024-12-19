import app from './app';
const PORT = Number(process.env.PRODUCER_PORT) || 3011;

app.listen(PORT, 'localhost', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
