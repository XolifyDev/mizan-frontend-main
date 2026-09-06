-- Mizan Pro subscription (money FROM the masjid to Mizan).
-- Additive only: new enum + nullable columns with a safe default.

CREATE TYPE "MasjidPlan" AS ENUM ('FREE', 'PRO');

ALTER TABLE "Masjid"
  ADD COLUMN "plan" "MasjidPlan" NOT NULL DEFAULT 'FREE',
  ADD COLUMN "planStatus" TEXT,
  ADD COLUMN "stripeSubscriptionId" TEXT,
  ADD COLUMN "billingCustomerId" TEXT,
  ADD COLUMN "planCurrentPeriodEnd" TIMESTAMP(3);
