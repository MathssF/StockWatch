import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { consumeQueue } from '../../Consumer/src/rabbitmq.consumer';

const prisma = new PrismaClient();
const queueNames = JSON.parse(process.env.RABBITMQ_QUEUE_NAMES || '{}');
const durable = JSON.parse(process.env.RABBIT_QUEUE_DURABLE || '{}');

const queueName = queueNames.promotions || 'promotions-queue';
const durableValue = durable.promotions || false;
const filePath = path.join(__dirname, '../../../Core/src/database/today/output.json');

export const postPromotions = async (messageContent?: string): Promise<any> => {
  try {
    let promotions: any[] = [];
    let processedPromotions: any[] = [];

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
        processedPromotions = promotions;
      } else {
        console.log('Arquivo output.json não encontrado, salvando no banco de dados...');
        processedPromotions = await savePromotionsToDatabase(promotions);
      }
    } else {
      console.log('Nenhuma promoção encontrada.');
    }

    return { processedPromotions };
  } catch (error) {
    console.error('Erro ao processar a mensagem:', error);
    throw error;
  }
};

// Função para atualizar o arquivo output.json
function updateOutputFile(promotions: any[]) {
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
async function savePromotionsToDatabase(promotions: any[]): Promise<any> {
  try {
    const savedPromotions: any[] = [];
    for (const promotion of promotions) {
      const savedPromotion = await prisma.customerPromotions.create({
        data: {
          stockId: promotion.stockId,
          customerId: promotion.customerId,
          promoValue: promotion.promoValue,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      savedPromotions.push(savedPromotion);
    }
    return savedPromotions;
  } catch (error) {
    console.error('Erro ao salvar promoções no banco de dados:', error);
  }
}
