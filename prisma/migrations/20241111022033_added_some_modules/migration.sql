/*
  Warnings:

  - A unique constraint covering the columns `[public_id]` on the table `Collection` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[public_id]` on the table `DirectClient` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[public_id]` on the table `LivestreamCollection` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[public_id]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[public_id]` on the table `StockItem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[public_id]` on the table `StockProduct` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[public_id]` on the table `Store` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[public_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[direct_client_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - The required column `public_id` was added to the `Collection` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `public_id` was added to the `DirectClient` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `public_id` was added to the `LivestreamCollection` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `public_id` was added to the `Product` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `public_id` was added to the `StockItem` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `public_id` was added to the `StockProduct` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `public_id` was added to the `Store` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `public_id` was added to the `User` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_direct_client_id_fkey";

-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "user_id" TEXT,
ALTER COLUMN "direct_client_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Collection" ADD COLUMN     "public_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "DirectClient" ADD COLUMN     "public_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "LivestreamCollection" ADD COLUMN     "public_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "public_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "StockItem" ADD COLUMN     "public_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "StockProduct" ADD COLUMN     "public_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "public_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "direct_client_id" TEXT,
ADD COLUMN     "public_id" TEXT NOT NULL,
ALTER COLUMN "email_otp_code" SET DEFAULT floor(random() * 1000000)::text;

-- CreateTable
CREATE TABLE "OrderStockItem" (
    "order_id" TEXT NOT NULL,
    "stock_item_id" TEXT NOT NULL,

    CONSTRAINT "OrderStockItem_pkey" PRIMARY KEY ("order_id","stock_item_id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" "OrderStatus" NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "coupon_code" TEXT NOT NULL,
    "user_id" TEXT,
    "direct_client_id" TEXT,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_public_id_key" ON "Order"("public_id");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_coupon_code_key" ON "Coupon"("coupon_code");

-- CreateIndex
CREATE UNIQUE INDEX "Collection_public_id_key" ON "Collection"("public_id");

-- CreateIndex
CREATE UNIQUE INDEX "DirectClient_public_id_key" ON "DirectClient"("public_id");

-- CreateIndex
CREATE UNIQUE INDEX "LivestreamCollection_public_id_key" ON "LivestreamCollection"("public_id");

-- CreateIndex
CREATE UNIQUE INDEX "Product_public_id_key" ON "Product"("public_id");

-- CreateIndex
CREATE UNIQUE INDEX "StockItem_public_id_key" ON "StockItem"("public_id");

-- CreateIndex
CREATE UNIQUE INDEX "StockProduct_public_id_key" ON "StockProduct"("public_id");

-- CreateIndex
CREATE UNIQUE INDEX "Store_public_id_key" ON "Store"("public_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_public_id_key" ON "User"("public_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_direct_client_id_key" ON "User"("direct_client_id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_direct_client_id_fkey" FOREIGN KEY ("direct_client_id") REFERENCES "DirectClient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_direct_client_id_fkey" FOREIGN KEY ("direct_client_id") REFERENCES "DirectClient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderStockItem" ADD CONSTRAINT "OrderStockItem_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderStockItem" ADD CONSTRAINT "OrderStockItem_stock_item_id_fkey" FOREIGN KEY ("stock_item_id") REFERENCES "StockItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_direct_client_id_fkey" FOREIGN KEY ("direct_client_id") REFERENCES "DirectClient"("id") ON DELETE SET NULL ON UPDATE CASCADE;
