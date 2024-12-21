import pika

# Estabelece a conexão com o RabbitMQ
connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()

# Cria uma fila (se não existir)
channel.queue_declare(queue='test_queue', durable=True)

# Publica uma mensagem na fila
channel.basic_publish(
    exchange='',
    routing_key='test_queue',
    body='Hello RabbitMQ!',
    properties=pika.BasicProperties(
        delivery_mode=2,  # Torna a mensagem persistente
    )
)

print("Mensagem enviada!")

# Fecha a conexão
connection.close()
