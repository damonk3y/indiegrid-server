/*
  Warnings:

  - You are about to drop the column `quantity` on the `StockItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "StockItem" DROP COLUMN "quantity";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email_otp_code" SET DEFAULT floor(random() * 1000000)::text;
