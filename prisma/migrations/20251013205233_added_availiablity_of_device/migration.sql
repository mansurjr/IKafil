-- CreateEnum
CREATE TYPE "DeviceSaleStatus" AS ENUM ('available', 'sold');

-- AlterTable
ALTER TABLE "devices" ADD COLUMN     "status" "DeviceSaleStatus" DEFAULT 'available';
