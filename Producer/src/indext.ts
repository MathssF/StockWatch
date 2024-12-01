import app from './app';
const PORT = process.env.PORT_PRODUCER || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
