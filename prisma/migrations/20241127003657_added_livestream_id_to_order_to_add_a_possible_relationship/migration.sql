-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "livestream_collection_id" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email_otp_code" SET DEFAULT floor(random() * 1000000)::text;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_livestream_collection_id_fkey" FOREIGN KEY ("livestream_collection_id") REFERENCES "LivestreamCollection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
