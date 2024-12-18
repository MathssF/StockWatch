/*
  Warnings:

  - A unique constraint covering the columns `[stockId,customerId]` on the table `CustomerPromotions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `CustomerPromotions_stockId_customerId_key` ON `CustomerPromotions`(`stockId`, `customerId`);
