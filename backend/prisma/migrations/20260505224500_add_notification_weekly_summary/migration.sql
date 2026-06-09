ALTER TABLE "notification_prefs"
ADD COLUMN IF NOT EXISTS "on_weekly_summary" BOOLEAN NOT NULL DEFAULT false;
