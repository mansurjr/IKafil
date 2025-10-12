/*
  Warnings:

  - Added the required column `initial_payment` to the `contracts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "contracts" ADD COLUMN     "initial_payment" DECIMAL(65,30) NOT NULL;
