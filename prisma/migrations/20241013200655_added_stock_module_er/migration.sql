-- CreateEnum
CREATE TYPE "StockStatus" AS ENUM ('AVAILABLE', 'AWAITING_PAYMENT', 'AWAITING_SHIPMENT', 'SHIPPED', 'DELIVERED', 'OUT_OF_STOCK');

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email_otp_code" SET DEFAULT floor(random() * 1000000)::text;

-- CreateTable
CREATE TABLE "StockProduct" (
    "id" TEXT NOT NULL,
    "internal_reference_id" TEXT NOT NULL,
    "weight_in_kgs" DOUBLE PRECISION,
    "cost_price" DOUBLE PRECISION,
    "selling_price" DOUBLE PRECISION,
    "store_id" TEXT NOT NULL,
    "product_id" TEXT,

    CONSTRAINT "StockProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockProductImages" (
    "id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "stock_product_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "StockProductImages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockItem" (
    "id" TEXT NOT NULL,
    "status" "StockStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "stock_product_id" TEXT NOT NULL,

    CONSTRAINT "StockItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StockProduct" ADD CONSTRAINT "StockProduct_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockProduct" ADD CONSTRAINT "StockProduct_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockProductImages" ADD CONSTRAINT "StockProductImages_stock_product_id_fkey" FOREIGN KEY ("stock_product_id") REFERENCES "StockProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockItem" ADD CONSTRAINT "StockItem_stock_product_id_fkey" FOREIGN KEY ("stock_product_id") REFERENCES "StockProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
