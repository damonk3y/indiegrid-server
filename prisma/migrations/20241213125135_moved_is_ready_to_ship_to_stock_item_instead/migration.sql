/*
  Warnings:

  - You are about to drop the column `is_ready_to_ship` on the `StockProduct` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "StockItem" ADD COLUMN     "is_ready_to_ship" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "StockProduct" DROP COLUMN "is_ready_to_ship";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email_otp_code" SET DEFAULT floor(random() * 1000000)::text;
