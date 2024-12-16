/*
  Warnings:

  - The values [RETURNED] on the enum `StockStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StockStatus_new" AS ENUM ('AVAILABLE', 'RESERVED', 'STORED_TO_SHIP_LATER', 'SENT', 'UNSELLABLE');
ALTER TABLE "StockItem" ALTER COLUMN "status" TYPE "StockStatus_new" USING ("status"::text::"StockStatus_new");
ALTER TYPE "StockStatus" RENAME TO "StockStatus_old";
ALTER TYPE "StockStatus_new" RENAME TO "StockStatus";
DROP TYPE "StockStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "OrderStockItem" ADD COLUMN     "was_returned" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email_otp_code" SET DEFAULT floor(random() * 1000000)::text;
