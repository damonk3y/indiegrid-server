/*
  Warnings:

  - Added the required column `store_id` to the `LivestreamCollection` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LivestreamCollection" ADD COLUMN     "store_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email_otp_code" SET DEFAULT floor(random() * 1000000)::text;

-- AddForeignKey
ALTER TABLE "LivestreamCollection" ADD CONSTRAINT "LivestreamCollection_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
