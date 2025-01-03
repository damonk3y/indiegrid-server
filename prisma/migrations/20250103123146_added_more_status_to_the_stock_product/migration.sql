/*
  Warnings:

  - You are about to drop the column `custom_selling_price` on the `StockItem` table. All the data in the column will be lost.
  - You are about to drop the column `has_defect` on the `StockItem` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "StockStatus" ADD VALUE 'STORED_TO_SHIP_LATER_UNPAID';
ALTER TYPE "StockStatus" ADD VALUE 'TO_BE_SHIPPED';
ALTER TYPE "StockStatus" ADD VALUE 'RETURNED';

-- AlterTable
ALTER TABLE "StockItem" DROP COLUMN "custom_selling_price",
DROP COLUMN "has_defect";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email_otp_code" SET DEFAULT floor(random() * 1000000)::text;
