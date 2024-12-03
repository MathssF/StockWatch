import amqp from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

export async function sendToQueue(queueName: string, message: string, id?: string) {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(queueName, {
      durable: false,
    });

    await channel.assertQueue(queueName, {
      durable: false,
    })

    const messageToSend = id ? JSON.stringify({ id, message }) : message;
    channel.sendToQueue(queueName, Buffer.from(messageToSend));

    console.log(`Mensagem enviada para a fila ${queueName}: ${message}`);

    setTimeout(() => {
      connection.close();
    }, 500);

  } catch(error) {
    console.error('Erro ao enviar mensagem para o RabbitMQ:', error);
  }
}