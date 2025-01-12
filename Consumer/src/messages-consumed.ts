import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Atualiza o status de uma mensagem no banco de dados para 'PROCESSED'.
 * @param dbMessageId ID da mensagem no banco de dados.
 * @param id Identificador do produtor da mensagem.
 * @param msgid Identificador único da mensagem.
 * @param message Conteúdo da mensagem.
 * @param processedMessages Array de mensagens processadas para atualizar.
 */
export async function updateMessageStatus(
  dbMessageId: string,
  id: string | null,
  msgid: string | null,
  message: string,
  processedMessages: {
    id: string;
    msgid: string;
    message: string;
  }[]
) {
  try {
    // Atualiza o status no banco de dados
    await prisma.rabbitMQMessage.update({
      where: { id: dbMessageId },
      data: { status: 'PROCESSED' },
    });
    console.log('Status Atualizado');

    // Adiciona a mensagem ao array de mensagens processadas
    processedMessages.push({
      id: id || 'UNKNOWN',
      msgid: msgid || 'UNKNOWN',
      message,
    });
  } catch (error) {
    console.error('Erro ao atualizar o status da mensagem:', error);
    throw error;
  }
}
