-- CreateEnum
CREATE TYPE "CommissionType" AS ENUM ('DIRECT', 'REFERRAL');

-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('PENDING', 'AVAILABLE', 'PAID');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PayoutType" AS ENUM ('BANK_TRANSFER', 'CASH', 'USDT');

-- AlterTable
ALTER TABLE "partners" ADD COLUMN     "referred_by_id" TEXT,
ALTER COLUMN "labels" DROP DEFAULT;

-- CreateTable
CREATE TABLE "commissions" (
    "id" BIGSERIAL NOT NULL,
    "partner_id" TEXT NOT NULL,
    "external_lead_id" BIGINT,
    "amount" DECIMAL(18,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'AED',
    "type" "CommissionType" NOT NULL,
    "status" "CommissionStatus" NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "commissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payouts" (
    "id" BIGSERIAL NOT NULL,
    "partner_id" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'AED',
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "type" "PayoutType" NOT NULL,
    "details" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "processed_at" TIMESTAMPTZ(6),

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "commissions_partner_id_idx" ON "commissions"("partner_id");

-- CreateIndex
CREATE INDEX "payouts_partner_id_idx" ON "payouts"("partner_id");

-- AddForeignKey
ALTER TABLE "partners" ADD CONSTRAINT "partners_referred_by_id_fkey" FOREIGN KEY ("referred_by_id") REFERENCES "partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
