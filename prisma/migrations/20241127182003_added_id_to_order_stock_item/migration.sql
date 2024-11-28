/*
  Warnings:

  - The primary key for the `OrderStockItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The required column `id` was added to the `OrderStockItem` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email_otp_code" SET DEFAULT floor(random() * 1000000)::text;

-- Step 1: Add the new column as nullable
ALTER TABLE "OrderStockItem" ADD COLUMN "id" TEXT;

-- Step 2: Populate the new column with UUIDs
UPDATE "OrderStockItem" SET "id" = gen_random_uuid()::text;

-- Step 3: Make the column NOT NULL and set it as the primary key
ALTER TABLE "OrderStockItem" 
DROP CONSTRAINT "OrderStockItem_pkey",
ALTER COLUMN "id" SET NOT NULL,
ADD CONSTRAINT "OrderStockItem_pkey" PRIMARY KEY ("id");
