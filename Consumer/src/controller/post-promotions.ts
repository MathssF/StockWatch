import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { consumeQueue } from '../rabbitmq.consumer';  // Importa a função de consumo
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const queueNames = JSON.parse(process.env.RABBITMQ_QUEUE_NAMES || '{}');
const durable = JSON.parse(process.env.RABBIT_QUEUE_DURABLE || '{}');

// Agora você pode acessar os valores de 'checkStock' ou 'promotions'
const queueName = queueNames.promotions || 'promotions-queue';
const durableValue = durable.promotions || false;
const filePath = path.join(__dirname, '../../../Core/src/database/today/output.json');

export const postPromotions = async (messageContent?: string): Promise<void> => {
  try {
    let promotions: any[] = [];

    if (messageContent) {
      console.log('Mensagem recebida:', messageContent);
      const { promotions: promotionsFromQueue } = JSON.parse(messageContent);
      promotions = promotionsFromQueue || [];
    } else {
      const message = await consumeQueue(queueName, durableValue);
      const { promotions: promotionsFromQueue } = JSON.parse(message.message);
      promotions = promotionsFromQueue || [];
    }

    if (promotions.length > 0) {
      // Verifica se o arquivo output.json existe
      if (fs.existsSync(filePath)) {
        console.log('Arquivo output.json encontrado, atualizando...');
        updateOutputFile(promotions);
      } else {
        console.log('Arquivo output.json não encontrado, salvando no banco de dados...');
        await savePromotionsToDatabase(promotions);
      }
    } else {
      console.log('Nenhuma promoção encontrada.');
    }
  } catch (error) {
    console.error('Erro ao processar a mensagem:', error);
    throw error;  // Lançar o erro para que o RabbitMQ possa tratá-lo
  }
};

// Função para atualizar o arquivo output.json
function updateOutputFile(promotions: any[]): void {
  try {
    const currentData = fs.existsSync(filePath) 
      ? JSON.parse(fs.readFileSync(filePath, 'utf-8')) 
      : { Promotions: [] };
    
    currentData.Promotions.push(...promotions);
    fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2));
    console.log('Promoções adicionadas ao arquivo output.json');
  } catch (error) {
    console.error('Erro ao atualizar o arquivo output.json:', error);
  }
}

// Função para salvar promoções no banco de dados
async function savePromotionsToDatabase(promotions: any[]): Promise<void> {
  try {
    for (const promotion of promotions) {
      await prisma.customerPromotions.create({
        data: {
          stockId: promotion.stockId,
          customerId: promotion.customerId,
          promoValue: promotion.promoValue,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      console.log(`Promoção registrada no banco para o cliente ${promotion.customerId}`);
    }
  } catch (error) {
    console.error('Erro ao salvar promoções no banco de dados:', error);
  }
}
