-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('SHIPPING', 'BILLING');

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email_otp_code" SET DEFAULT floor(random() * 1000000)::text;

-- CreateTable
CREATE TABLE "DirectClient" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "facebook_url" TEXT,
    "instagram_url" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DirectClient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "address_line_1" TEXT NOT NULL,
    "address_line_2" TEXT,
    "address_line_3" TEXT,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "direct_client_id" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "type" "AddressType" NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockProductLivestreamCollection" (
    "stock_product_id" TEXT NOT NULL,
    "livestream_collection_id" TEXT NOT NULL,

    CONSTRAINT "StockProductLivestreamCollection_pkey" PRIMARY KEY ("stock_product_id","livestream_collection_id")
);

-- CreateTable
CREATE TABLE "LivestreamCollection" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LivestreamCollection_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_direct_client_id_fkey" FOREIGN KEY ("direct_client_id") REFERENCES "DirectClient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockProductLivestreamCollection" ADD CONSTRAINT "StockProductLivestreamCollection_stock_product_id_fkey" FOREIGN KEY ("stock_product_id") REFERENCES "StockProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockProductLivestreamCollection" ADD CONSTRAINT "StockProductLivestreamCollection_livestream_collection_id_fkey" FOREIGN KEY ("livestream_collection_id") REFERENCES "LivestreamCollection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
