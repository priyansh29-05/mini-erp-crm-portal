/*
  Warnings:

  - Made the column `email` on table `Customer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `businessName` on table `Customer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `followUpDate` on table `Customer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `notes` on table `Customer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `location` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "businessName" SET NOT NULL,
ALTER COLUMN "followUpDate" SET NOT NULL,
ALTER COLUMN "notes" SET NOT NULL;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "location" SET NOT NULL;
