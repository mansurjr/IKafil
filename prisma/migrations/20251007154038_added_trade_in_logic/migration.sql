/*
  Warnings:

  - You are about to drop the column `old_device_name` on the `trade_in_requests` table. All the data in the column will be lost.
  - You are about to drop the `likes` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `old_device_id` to the `trade_in_requests` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."likes" DROP CONSTRAINT "likes_device_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."likes" DROP CONSTRAINT "likes_user_id_fkey";

-- AlterTable
ALTER TABLE "admin" ADD COLUMN     "password" TEXT;

-- AlterTable
ALTER TABLE "contracts" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "devices" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "payment_schedule" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "trade_in_requests" DROP COLUMN "old_device_name",
ADD COLUMN     "old_device_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "password" TEXT;

-- DropTable
DROP TABLE "public"."likes";

-- AddForeignKey
ALTER TABLE "trade_in_requests" ADD CONSTRAINT "trade_in_requests_old_device_id_fkey" FOREIGN KEY ("old_device_id") REFERENCES "devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
