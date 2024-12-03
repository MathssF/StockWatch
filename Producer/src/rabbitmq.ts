import amqp from 'amqplib';
// import { config } from 'dotenv';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

async function sendToQueue(id?: string, queueName: string, message: string) {
  //
}