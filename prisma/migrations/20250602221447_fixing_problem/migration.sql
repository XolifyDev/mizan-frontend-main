/*
  Warnings:

  - You are about to drop the column `recurring` on the `DonationCategory` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('image', 'video', 'countdown', 'announcement', 'website', 'predesigned', 'google_calendar', 'daily_verse', 'daily_hadith', 'daily_dua', 'ramadan_countdown', 'eid_countdown', 'days_countdown', 'taraweeh_timings', 'iqamah_timings');

-- DropIndex
DROP INDEX "DonationCategory_masjidId_idx";

-- AlterTable
ALTER TABLE "DonationCategory" DROP COLUMN "recurring",
ADD COLUMN     "allowAnonymous" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "allowComments" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "allowCustomAmount" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "allowPledge" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "amountDonated" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "amountsPerInterval" JSONB,
ADD COLUMN     "appreciation" TEXT,
ADD COLUMN     "collectAddress" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "collectPhone" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "complianceText" TEXT,
ADD COLUMN     "coverFee" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "coverFeeDefault" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ctaMessage" TEXT,
ADD COLUMN     "customLabel" TEXT,
ADD COLUMN     "defaultInterval" TEXT,
ADD COLUMN     "designations" TEXT[],
ADD COLUMN     "enableAppleGooglePay" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "enforceMax" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "excludeFromReceipts" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "featuredImage" TEXT,
ADD COLUMN     "goalAmount" INTEGER,
ADD COLUMN     "headerBgColor" TEXT,
ADD COLUMN     "hideTitle" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "intervals" TEXT[],
ADD COLUMN     "logo" TEXT,
ADD COLUMN     "mailingListOptIn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "quickDonate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recurringCountOptions" INTEGER[],
ADD COLUMN     "redirectUrl" TEXT,
ADD COLUMN     "showLogo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showOnKiosk" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "subtitle" TEXT,
ALTER COLUMN "defaultAmounts" DROP NOT NULL,
ALTER COLUMN "defaultAmounts" DROP DEFAULT,
ALTER COLUMN "defaultAmounts" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "TVDisplay" (
    "id" TEXT NOT NULL,
    "masjidId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSeen" TIMESTAMP(3),
    "ipAddress" TEXT,
    "status" TEXT NOT NULL DEFAULT 'offline',
    "layout" TEXT,
    "config" JSONB,
    "assignedContentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TVDisplay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Content" (
    "id" TEXT NOT NULL,
    "masjidId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "ContentType" NOT NULL,
    "url" TEXT,
    "data" JSONB,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "startTime" TEXT,
    "endTime" TEXT,
    "duration" TEXT,
    "dayType" TEXT,
    "timeType" TEXT,
    "zones" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "displayLocations" TEXT[],
    "fullscreen" BOOLEAN NOT NULL,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "masjidId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fullscreen" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "zones" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "displayLocations" TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "contentItemId" TEXT,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DisplayContent" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_AnnouncementToTVDisplay" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_DisplayContent_AB_unique" ON "_DisplayContent"("A", "B");

-- CreateIndex
CREATE INDEX "_DisplayContent_B_index" ON "_DisplayContent"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AnnouncementToTVDisplay_AB_unique" ON "_AnnouncementToTVDisplay"("A", "B");

-- CreateIndex
CREATE INDEX "_AnnouncementToTVDisplay_B_index" ON "_AnnouncementToTVDisplay"("B");

-- AddForeignKey
ALTER TABLE "TVDisplay" ADD CONSTRAINT "TVDisplay_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES "Masjid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TVDisplay" ADD CONSTRAINT "TVDisplay_assignedContentId_fkey" FOREIGN KEY ("assignedContentId") REFERENCES "Content"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES "Masjid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES "Masjid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_contentItemId_fkey" FOREIGN KEY ("contentItemId") REFERENCES "Content"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DisplayContent" ADD CONSTRAINT "_DisplayContent_A_fkey" FOREIGN KEY ("A") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DisplayContent" ADD CONSTRAINT "_DisplayContent_B_fkey" FOREIGN KEY ("B") REFERENCES "TVDisplay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnnouncementToTVDisplay" ADD CONSTRAINT "_AnnouncementToTVDisplay_A_fkey" FOREIGN KEY ("A") REFERENCES "Announcement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnnouncementToTVDisplay" ADD CONSTRAINT "_AnnouncementToTVDisplay_B_fkey" FOREIGN KEY ("B") REFERENCES "TVDisplay"("id") ON DELETE CASCADE ON UPDATE CASCADE;
