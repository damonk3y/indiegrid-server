/*
  Warnings:

  - The values [OPEN,CLIENT_AWAITNG_PAYMENT_DETAILS] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('CLIENT_AWAITING_PAYMENT_DETAILS', 'AWAITING_PAYMENT', 'PENDING', 'STORED', 'SHIPPED', 'DELIVERED', 'CANCELLED');
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "OrderStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "StockProduct" ADD COLUMN     "is_ready_to_ship" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email_otp_code" SET DEFAULT floor(random() * 1000000)::text;
