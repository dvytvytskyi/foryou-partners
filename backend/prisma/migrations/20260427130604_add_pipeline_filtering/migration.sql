-- AlterTable
ALTER TABLE "lead_snapshots" ADD COLUMN     "pipeline_id" BIGINT;

-- CreateTable
CREATE TABLE "partner_pipelines" (
    "id" BIGSERIAL NOT NULL,
    "partner_id" TEXT NOT NULL,
    "amocrm_pipeline_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partner_pipelines_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "partner_pipelines_partner_id_idx" ON "partner_pipelines"("partner_id");

-- CreateIndex
CREATE UNIQUE INDEX "partner_pipelines_partner_id_amocrm_pipeline_id_key" ON "partner_pipelines"("partner_id", "amocrm_pipeline_id");

-- AddForeignKey
ALTER TABLE "partner_pipelines" ADD CONSTRAINT "partner_pipelines_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
