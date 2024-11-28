/*
  Warnings:

  - The values [COMPLETED] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [AWAITING_PAYMENT,AWAITING_SHIPMENT,SHIPPED,DELIVERED,CLIENT_AWAITING_PAYMENT_DETAILS] on the enum `StockStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('OPEN', 'CLIENT_AWAITNG_PAYMENT_DETAILS', 'AWAITING_PAYMENT', 'PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED');
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "OrderStatus_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "StockStatus_new" AS ENUM ('AVAILABLE', 'RESERVED', 'STORED_TO_SHIP_LATER', 'SENT', 'RETURNED', 'UNSELLABLE');
ALTER TABLE "StockItem" ALTER COLUMN "status" TYPE "StockStatus_new" USING ("status"::text::"StockStatus_new");
ALTER TYPE "StockStatus" RENAME TO "StockStatus_old";
ALTER TYPE "StockStatus_new" RENAME TO "StockStatus";
DROP TYPE "StockStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email_otp_code" SET DEFAULT floor(random() * 1000000)::text;
