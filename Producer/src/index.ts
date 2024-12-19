import app from './app';
const PORT = Number(process.env.PRODUCER_PORT) || 3012;

app.listen(PORT, 'localhost', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
