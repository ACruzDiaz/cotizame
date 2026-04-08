-- CreateEnum
CREATE TYPE "CompanyTier" AS ENUM ('free', 'premium');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('pending', 'complete', 'closed');

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "clientPhone" TEXT NOT NULL,
    "name" TEXT,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tier" "CompanyTier" NOT NULL DEFAULT 'free',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanySecret" (
    "companyId" TEXT NOT NULL,
    "whatsappTokenHash" TEXT NOT NULL,
    "phoneNumberId" TEXT NOT NULL,

    CONSTRAINT "CompanySecret_pkey" PRIMARY KEY ("companyId")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parameters" JSONB NOT NULL,
    "description" TEXT NOT NULL,
    "notes" TEXT,
    "basePrice" DECIMAL(65,30) NOT NULL,
    "dynamicPricingDsl" JSONB NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "status" "QuoteStatus" NOT NULL DEFAULT 'pending',
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteItem" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "parameters" JSONB NOT NULL,
    "calculatedPrice" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "QuoteItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_clientPhone_companyId_key" ON "Client"("clientPhone", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_phoneNumber_key" ON "Company"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanySecret" ADD CONSTRAINT "CompanySecret_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteItem" ADD CONSTRAINT "QuoteItem_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteItem" ADD CONSTRAINT "QuoteItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
