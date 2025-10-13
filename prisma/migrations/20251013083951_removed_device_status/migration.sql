/*
  Warnings:

  - You are about to drop the column `status` on the `devices` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "devices" DROP COLUMN "status";

-- DropEnum
DROP TYPE "public"."DeviceStatus";
