// import { PrismaClient } from '@prisma/client';
// import fs from 'fs';
// import path from 'path';
// import { consumeQueue } from '../rabbitmq.consumer';  // Importa a função de consumo
// import { v4 as uuidv4 } from 'uuid';

// const prisma = new PrismaClient();
// const queueName = 'promotion-queue';
// const filePath = path.join(__dirname, '../../Core/src/database/today/output.json');

// const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

// export const postPromotions = async (messageContent?: string): Promise<void> => {
//   try {
//     let promotions;
//     if (messageContent) {
//       const { stockId, customers } = JSON.parse(messageContent);
//       promotions = await preparePromotions(stockId, customers);
//     } else {
//       promotions = await consumeQueue(queueName);
//     }

//     // Verifica se o arquivo output.json existe
//     if (fs.existsSync(filePath)) {
//       updateOutputFile(promotions);
//     } else {
//       // Caso não exista, salva diretamente no banco de dados
//       await savePromotionsToDatabase(promotions);
//     }
//   } catch (error) {
//     console.error('Erro ao processar a mensagem:', error);
//     throw error;  // Lançar o erro para que o RabbitMQ possa tratá-lo
//   }
// };

// // Função para preparar as promoções
// async function preparePromotions(stockId: string, customers: any[]): Promise<any[]> {
//   const promotions = [];
//   for (const customer of customers) {
//     const promoValue = customer.promoValue || 0;
//     promotions.push({
//       stockId,
//       customerId: customer.customerId,
//       promoValue,
//     });
//   }
//   return promotions;
// }

// // Função para atualizar o arquivo output.json
// function updateOutputFile(promotions): void {
//   try {
//     const currentData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
//     currentData.Promotions.push(...promotions);
//     fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2));
//     console.log('Promoções adicionadas ao arquivo output.json');
//   } catch (error) {
//     console.error('Erro ao atualizar o arquivo output.json:', error);
//   }
// }

// // Função para salvar promoções no banco de dados
// async function savePromotionsToDatabase(promotions): Promise<void> {
//   try {
//     for (const promotion of promotions) {
//       await prisma.customerPromotions.create({
//         data: {
//           stockId: promotion.stockId,
//           customerId: promotion.customerId,
//           promoValue: promotion.promoValue,
//           createdAt: new Date(),
//           updatedAt: new Date(),
//         },
//       });
//       console.log(`Promoção registrada no banco para o cliente ${promotion.customerId}`);
//     }
//   } catch (error) {
//     console.error('Erro ao salvar promoções no banco de dados:', error);
//   }
// }