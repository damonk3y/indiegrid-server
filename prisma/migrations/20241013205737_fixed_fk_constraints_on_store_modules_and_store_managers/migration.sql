/*
  Warnings:

  - The primary key for the `StoreManager` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `StoreManager` table. All the data in the column will be lost.
  - The primary key for the `StoreModules` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `StoreModules` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "StoreManager" DROP CONSTRAINT "StoreManager_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "StoreManager_pkey" PRIMARY KEY ("user_id", "store_id");

-- AlterTable
ALTER TABLE "StoreModules" DROP CONSTRAINT "StoreModules_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "StoreModules_pkey" PRIMARY KEY ("store_id", "module_id");

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email_otp_code" SET DEFAULT floor(random() * 1000000)::text;
