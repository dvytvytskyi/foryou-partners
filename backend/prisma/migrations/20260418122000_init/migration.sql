-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('partner_user', 'admin');

-- CreateEnum
CREATE TYPE "WebhookStatus" AS ENUM ('received', 'processed', 'failed');

-- CreateTable
CREATE TABLE "partners" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "partner_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_tags" (
    "id" BIGSERIAL NOT NULL,
    "partner_id" TEXT NOT NULL,
    "amocrm_tag_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partner_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_sources" (
    "id" BIGSERIAL NOT NULL,
    "partner_id" TEXT NOT NULL,
    "amocrm_source" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partner_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "refresh_token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "revoked_at" TIMESTAMPTZ,
    "user_agent" TEXT,
    "ip" INET,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_snapshots" (
    "id" BIGSERIAL NOT NULL,
    "external_lead_id" BIGINT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "budget" DECIMAL(18,2),
    "city" TEXT,
    "comment" TEXT,
    "contact_name" TEXT,
    "contact_phone" TEXT,
    "contact_email" TEXT,
    "broker_name" TEXT,
    "broker_phone" TEXT,
    "broker_email" TEXT,
    "amocrm_source" TEXT,
    "tag_ids" BIGINT[],
    "updated_at_source" TIMESTAMPTZ NOT NULL,
    "synced_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "lead_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_status_history" (
    "id" BIGSERIAL NOT NULL,
    "external_lead_id" BIGINT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "from_status" TEXT,
    "to_status" TEXT NOT NULL,
    "changed_at" TIMESTAMPTZ NOT NULL,
    "changed_by" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_prefs" (
    "user_id" TEXT NOT NULL,
    "on_status_change" BOOLEAN NOT NULL DEFAULT true,
    "on_broker_change" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "notification_prefs_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "webhook_events" (
    "id" BIGSERIAL NOT NULL,
    "event_id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "received_at" TIMESTAMPTZ NOT NULL,
    "processed_at" TIMESTAMPTZ,
    "status" "WebhookStatus" NOT NULL DEFAULT 'received',
    "error_message" TEXT,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" BIGSERIAL NOT NULL,
    "request_id" TEXT NOT NULL,
    "actor_user_id" TEXT,
    "actor_role" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_partner_id_idx" ON "users"("partner_id");

-- CreateIndex
CREATE INDEX "partner_tags_partner_id_idx" ON "partner_tags"("partner_id");

-- CreateIndex
CREATE UNIQUE INDEX "partner_tags_partner_id_amocrm_tag_id_key" ON "partner_tags"("partner_id", "amocrm_tag_id");

-- CreateIndex
CREATE INDEX "partner_sources_partner_id_idx" ON "partner_sources"("partner_id");

-- CreateIndex
CREATE UNIQUE INDEX "partner_sources_partner_id_amocrm_source_key" ON "partner_sources"("partner_id", "amocrm_source");

-- CreateIndex
CREATE INDEX "refresh_sessions_user_id_idx" ON "refresh_sessions"("user_id");

-- CreateIndex
CREATE INDEX "lead_snapshots_partner_id_updated_at_source_idx" ON "lead_snapshots"("partner_id", "updated_at_source" DESC);

-- CreateIndex
CREATE INDEX "lead_snapshots_external_lead_id_idx" ON "lead_snapshots"("external_lead_id");

-- CreateIndex
CREATE UNIQUE INDEX "lead_snapshots_external_lead_id_partner_id_key" ON "lead_snapshots"("external_lead_id", "partner_id");

-- CreateIndex
CREATE INDEX "lead_status_history_partner_id_changed_at_idx" ON "lead_status_history"("partner_id", "changed_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "webhook_events_event_id_key" ON "webhook_events"("event_id");

-- CreateIndex
CREATE INDEX "webhook_events_status_received_at_idx" ON "webhook_events"("status", "received_at");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at" DESC);

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_tags" ADD CONSTRAINT "partner_tags_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_sources" ADD CONSTRAINT "partner_sources_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_sessions" ADD CONSTRAINT "refresh_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_snapshots" ADD CONSTRAINT "lead_snapshots_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_status_history" ADD CONSTRAINT "lead_status_history_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_prefs" ADD CONSTRAINT "notification_prefs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

