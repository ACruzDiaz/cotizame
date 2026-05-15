/*
  Warnings:

  - Made the column `updatedAt` on table `Company` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `isParamsCompleted` to the `QuoteItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "QIStatus" ADD VALUE 'Canceled';

-- AlterTable
ALTER TABLE "Company" ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "Quote" ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "totalAmount" DROP NOT NULL;

-- AlterTable
ALTER TABLE "QuoteItem" ADD COLUMN     "isParamsCompleted" BOOLEAN NOT NULL,
ALTER COLUMN "calculatedPrice" DROP NOT NULL,
ALTER COLUMN "status" DROP DEFAULT;
