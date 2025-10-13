/*
  Warnings:

  - You are about to drop the column `trade_in_id` on the `contracts` table. All the data in the column will be lost.
  - You are about to drop the `trade_in_requests` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."contracts" DROP CONSTRAINT "contracts_trade_in_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."trade_in_requests" DROP CONSTRAINT "trade_in_requests_new_device_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."trade_in_requests" DROP CONSTRAINT "trade_in_requests_old_device_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."trade_in_requests" DROP CONSTRAINT "trade_in_requests_seller_id_fkey";

-- AlterTable
ALTER TABLE "contracts" DROP COLUMN "trade_in_id";

-- AlterTable
ALTER TABLE "devices" ADD COLUMN     "isTradible" BOOLEAN DEFAULT false;

-- DropTable
DROP TABLE "public"."trade_in_requests";
