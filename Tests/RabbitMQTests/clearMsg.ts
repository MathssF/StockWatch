import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearRabbitMQMessages() {
  try {
    // Exclui todos os registros da tabela 'RabbitMQMessage'
    const result = await prisma.rabbitMQMessage.deleteMany({});
    
    console.log(`${result.count} registros excluídos com sucesso.`);
  } catch (error) {
    console.error('Erro ao excluir registros:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Chama a função para limpar os registros
clearRabbitMQMessages();
