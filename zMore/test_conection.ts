import amqp from 'amqplib';

async function createQueueAndSendMessage() {
  try {
    // Estabelece a conexão com o RabbitMQ
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    const queue = 'test_queue';
    const message = 'Hello RabbitMQ from TypeScript!';

    // Declara a fila (se não existir)
    await channel.assertQueue(queue, {
      durable: true, // Fila será persistente
    });

    // Envia a mensagem para a fila
    channel.sendToQueue(queue, Buffer.from(message), {
      persistent: true, // A mensagem será persistente
    });

    console.log(`Mensagem enviada para a fila ${queue}: ${message}`);

    // Fecha a conexão após um pequeno delay
    setTimeout(() => {
      channel.close();
      connection.close();
    }, 500);
  } catch (error) {
    console.error('Erro ao conectar ou enviar mensagem:', error);
  }
}

// Chama a função
createQueueAndSendMessage();
