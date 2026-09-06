-- Per-masjid roles. Additive: the implicit "_MasjidUsers" relation is left in
-- place so existing membership queries keep working during the cutover.

CREATE TYPE "MasjidRole" AS ENUM (
  'OWNER', 'ADMIN', 'CONTENT_EDITOR', 'PRAYER_TIMES', 'FINANCE', 'VIEWER'
);

CREATE TABLE "MasjidMember" (
  "id"        TEXT NOT NULL,
  "masjidId"  TEXT NOT NULL,
  "userId"    TEXT NOT NULL,
  "role"      "MasjidRole" NOT NULL DEFAULT 'VIEWER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MasjidMember_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MasjidMember_masjidId_userId_key" ON "MasjidMember"("masjidId", "userId");
CREATE INDEX "MasjidMember_masjidId_idx" ON "MasjidMember"("masjidId");

ALTER TABLE "MasjidMember"
  ADD CONSTRAINT "MasjidMember_masjidId_fkey" FOREIGN KEY ("masjidId")
    REFERENCES "Masjid"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "MasjidMember_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Invites carry the role granted on acceptance.
ALTER TABLE "MasjidInvite"
  ADD COLUMN "role" "MasjidRole" NOT NULL DEFAULT 'VIEWER';

-- Backfill: everyone who is already a member becomes ADMIN, which is the access
-- they effectively had before roles existed. Owners are excluded (they resolve
-- to OWNER from Masjid.ownerId and have no membership row).
INSERT INTO "MasjidMember" ("id", "masjidId", "userId", "role", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, mu."A", mu."B", 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "_MasjidUsers" mu
JOIN "Masjid" m ON m."id" = mu."A"
WHERE m."ownerId" <> mu."B"
ON CONFLICT ("masjidId", "userId") DO NOTHING;
