import amqp from 'amqplib';
// import executeWithTryCatch from "../../Shared/src/utils/tryCath";

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

async function sendToQueue(id?: string, queueName: string, message: string) {
  //
//   const connection = await executeWithTryCatch(amqp.connect(RABBITMQ_URL))
  try {}
}