-- DropForeignKey
ALTER TABLE "Announcement" DROP CONSTRAINT "Announcement_contentItemId_fkey";

-- DropForeignKey
ALTER TABLE "Announcement" DROP CONSTRAINT "Announcement_masjidId_fkey";

-- DropForeignKey
ALTER TABLE "Content" DROP CONSTRAINT "Content_masjidId_fkey";

-- DropForeignKey
ALTER TABLE "Device" DROP CONSTRAINT "Device_currentThemeId_fkey";

-- DropForeignKey
ALTER TABLE "Device" DROP CONSTRAINT "Device_masjidId_fkey";

-- DropForeignKey
ALTER TABLE "Donation" DROP CONSTRAINT "Donation_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Donation" DROP CONSTRAINT "Donation_kioskInstanceId_fkey";

-- DropForeignKey
ALTER TABLE "Donation" DROP CONSTRAINT "Donation_masjidId_fkey";

-- DropForeignKey
ALTER TABLE "DonationCategory" DROP CONSTRAINT "DonationCategory_masjidId_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_masjidId_fkey";

-- DropForeignKey
ALTER TABLE "Flyer" DROP CONSTRAINT "Flyer_masjidId_fkey";

-- DropForeignKey
ALTER TABLE "KioskInstance" DROP CONSTRAINT "KioskInstance_masjidId_fkey";

-- DropForeignKey
ALTER TABLE "KioskInstance" DROP CONSTRAINT "KioskInstance_productId_fkey";

-- DropForeignKey
ALTER TABLE "MasjidProduct" DROP CONSTRAINT "MasjidProduct_masjidId_fkey";

-- DropForeignKey
ALTER TABLE "MasjidProduct" DROP CONSTRAINT "MasjidProduct_productId_fkey";

-- DropForeignKey
ALTER TABLE "PrayerTime" DROP CONSTRAINT "PrayerTime_masjidId_fkey";

-- DropForeignKey
ALTER TABLE "ProductImage" DROP CONSTRAINT "ProductImage_productId_fkey";

-- DropForeignKey
ALTER TABLE "ScreenLog" DROP CONSTRAINT "ScreenLog_deviceId_fkey";

-- DropForeignKey
ALTER TABLE "TVDisplay" DROP CONSTRAINT "TVDisplay_assignedContentId_fkey";

-- DropForeignKey
ALTER TABLE "TVDisplay" DROP CONSTRAINT "TVDisplay_masjidId_fkey";

-- DropForeignKey
ALTER TABLE "Theme" DROP CONSTRAINT "Theme_masjidId_fkey";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "requiredSubscriptionId" TEXT;

-- AlterTable
ALTER TABLE "_AnnouncementToTVDisplay" ADD CONSTRAINT "_AnnouncementToTVDisplay_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_AnnouncementToTVDisplay_AB_unique";

-- AlterTable
ALTER TABLE "_DisplayContent" ADD CONSTRAINT "_DisplayContent_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_DisplayContent_AB_unique";

-- AlterTable
ALTER TABLE "_MasjidUsers" ADD CONSTRAINT "_MasjidUsers_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_MasjidUsers_AB_unique";

-- CreateTable
CREATE TABLE "MasjidInvite" (
    "id" TEXT NOT NULL,
    "masjidId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "joinDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasjidInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SystemLog_userId_idx" ON "SystemLog"("userId");

-- CreateIndex
CREATE INDEX "SystemLog_entityType_entityId_idx" ON "SystemLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "SystemLog_createdAt_idx" ON "SystemLog"("createdAt");

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES "Masjid"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_currentThemeId_fkey" FOREIGN KEY ("currentThemeId") REFERENCES "Theme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScreenLog" ADD CONSTRAINT "ScreenLog_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Theme" ADD CONSTRAINT "Theme_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES "Masjid"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerTime" ADD CONSTRAINT "PrayerTime_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES "Masjid"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flyer" ADD CONSTRAINT "Flyer_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES "Masjid"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasjidProduct" ADD CONSTRAINT "MasjidProduct_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES "Masjid"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasjidProduct" ADD CONSTRAINT "MasjidProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES "Masjid"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KioskInstance" ADD CONSTRAINT "KioskInstance_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KioskInstance" ADD CONSTRAINT "KioskInstance_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES "Masjid"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonationCategory" ADD CONSTRAINT "DonationCategory_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES "Masjid"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES "Masjid"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "DonationCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_kioskInstanceId_fkey" FOREIGN KEY ("kioskInstanceId") REFERENCES "KioskInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TVDisplay" ADD CONSTRAINT "TVDisplay_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES "Masjid"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TVDisplay" ADD CONSTRAINT "TVDisplay_assignedContentId_fkey" FOREIGN KEY ("assignedContentId") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES "Masjid"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES "Masjid"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_contentItemId_fkey" FOREIGN KEY ("contentItemId") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasjidInvite" ADD CONSTRAINT "MasjidInvite_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES "Masjid"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasjidInvite" ADD CONSTRAINT "MasjidInvite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasjidInvite" ADD CONSTRAINT "MasjidInvite_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemLog" ADD CONSTRAINT "SystemLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
