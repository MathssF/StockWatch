/*
  Warnings:

  - Added the required column `message` to the `RabbitMQMessage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `RabbitMQMessage` ADD COLUMN `message` TEXT NOT NULL;
