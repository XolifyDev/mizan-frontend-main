-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('percentage', 'fixed');

-- CreateTable
CREATE TABLE "Masjid" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT NOT NULL,
    "postal" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "websiteUrl" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "googleCalendarId" TEXT NOT NULL DEFAULT '',
    "googleCalendarCredentials" JSONB,
    "googleCalendarPfp" TEXT,
    "latitude" TEXT NOT NULL,
    "longitude" TEXT NOT NULL,
    "locationAddress" TEXT NOT NULL,
    "logo" TEXT NOT NULL DEFAULT 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIC25nqru3yN9lhtoTwdBWt_u0QlOcPzw3Bw&s',
    "timezone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "Masjid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL,
    "masjidId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSeen" TIMESTAMP(3),
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "currentThemeId" TEXT,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScreenLog" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" TEXT NOT NULL,
    "details" TEXT,

    CONSTRAINT "ScreenLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Theme" (
    "id" TEXT NOT NULL,
    "masjidId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "configJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Theme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrayerTime" (
    "id" TEXT NOT NULL,
    "masjidId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "fajr" TIMESTAMP(3) NOT NULL,
    "sunrise" TIMESTAMP(3) NOT NULL,
    "dhuhr" TIMESTAMP(3) NOT NULL,
    "asr" TIMESTAMP(3) NOT NULL,
    "maghrib" TIMESTAMP(3) NOT NULL,
    "isha" TIMESTAMP(3) NOT NULL,
    "isCalculated" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "month" TEXT NOT NULL,
    "year" INTEGER NOT NULL,

    CONSTRAINT "PrayerTime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Flyer" (
    "id" TEXT NOT NULL,
    "masjidId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Flyer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "features" TEXT[],
    "price" INTEGER NOT NULL,
    "image" TEXT NOT NULL DEFAULT 'placeholder.svg?height=200&width=300',
    "category" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL DEFAULT 'kiosk',
    "url" TEXT NOT NULL DEFAULT '',
    "popular" BOOLEAN NOT NULL DEFAULT false,
    "stripeProductId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "discountType" "DiscountType",
    "discountValue" INTEGER,
    "discountStart" TIMESTAMP(3),
    "discountEnd" TIMESTAMP(3),

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasjidProduct" (
    "id" TEXT NOT NULL,
    "masjidId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MasjidProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "timeStart" TIMESTAMP(3) NOT NULL,
    "timeEnd" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "tagColor" TEXT NOT NULL,
    "masjidId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "syncToGoogleCalendar" BOOLEAN NOT NULL DEFAULT false,
    "googleCalendarEventId" TEXT,
    "lastSyncedAt" TIMESTAMP(3),
    "syncStatus" TEXT,
    "flyerUrl" TEXT,
    "tvFlyerUrl" TEXT,
    "recurrence" JSONB,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "admin" BOOLEAN NOT NULL DEFAULT false,
    "role" TEXT NOT NULL DEFAULT 'user',
    "stripeCustomerId" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckoutSessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "paymentType" TEXT NOT NULL,
    "completed" TEXT NOT NULL,
    "cart" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CheckoutSessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Orders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeSessionId" TEXT,
    "status" TEXT NOT NULL,
    "cart" TEXT NOT NULL,
    "trackingNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MizanTv" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "accessCode" TEXT NOT NULL,

    CONSTRAINT "MizanTv_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrayerCalculation" (
    "id" TEXT NOT NULL,
    "masjidId" TEXT NOT NULL,
    "calculationMethod" TEXT NOT NULL,
    "asrMethod" TEXT NOT NULL,
    "higherLatitudeMethod" TEXT NOT NULL,
    "fajrOffset" INTEGER NOT NULL,
    "sunriseOffset" INTEGER NOT NULL,
    "dhuhrOffset" INTEGER NOT NULL,
    "asrOffset" INTEGER NOT NULL,
    "maghribOffset" INTEGER NOT NULL,
    "ishaOffset" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrayerCalculation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IqamahTiming" (
    "id" TEXT NOT NULL,
    "masjidId" TEXT NOT NULL,
    "changeDate" TIMESTAMP(3) NOT NULL,
    "fajr" TEXT NOT NULL,
    "dhuhr" TEXT NOT NULL,
    "asr" TEXT NOT NULL,
    "maghrib" TEXT NOT NULL,
    "maghribType" TEXT NOT NULL,
    "maghribOffset" TEXT NOT NULL,
    "isha" TEXT NOT NULL,
    "jumuahI" TEXT,
    "jumuahII" TEXT,
    "jumuahIII" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IqamahTiming_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KioskInstance" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "masjidId" TEXT NOT NULL,
    "serial" TEXT NOT NULL,
    "activatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'active',
    "config" JSONB,
    "kioskName" TEXT,
    "kioskLocation" TEXT,

    CONSTRAINT "KioskInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DonationCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#550C18',
    "icon" TEXT,
    "defaultAmounts" INTEGER[] DEFAULT ARRAY[10, 25, 50, 100]::INTEGER[],
    "min" INTEGER NOT NULL DEFAULT 1,
    "max" INTEGER NOT NULL DEFAULT 10000,
    "recurring" BOOLEAN NOT NULL DEFAULT false,
    "restricted" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "masjidId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DonationCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Donation" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "donorName" TEXT,
    "donorEmail" TEXT,
    "masjidId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "kioskInstanceId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paymentMethod" TEXT NOT NULL,
    "transactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MasjidUsers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "PrayerTime_masjidId_idx" ON "PrayerTime"("masjidId");

-- CreateIndex
CREATE INDEX "PrayerTime_date_idx" ON "PrayerTime"("date");

-- CreateIndex
CREATE UNIQUE INDEX "PrayerTime_masjidId_date_key" ON "PrayerTime"("masjidId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "MasjidProduct_masjidId_productId_key" ON "MasjidProduct"("masjidId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "KioskInstance_serial_key" ON "KioskInstance"("serial");

-- CreateIndex
CREATE INDEX "DonationCategory_masjidId_idx" ON "DonationCategory"("masjidId");

-- CreateIndex
CREATE UNIQUE INDEX "_MasjidUsers_AB_unique" ON "_MasjidUsers"("A", "B");

-- CreateIndex
CREATE INDEX "_MasjidUsers_B_index" ON "_MasjidUsers"("B");

-- AddForeignKey
ALTER TABLE "Masjid" ADD CONSTRAINT "Masjid_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES "Masjid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_currentThemeId_fkey" FOREIGN KEY ("currentThemeId") REFERENCES "Theme"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScreenLog" ADD CONSTRAINT "ScreenLog_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Theme" ADD CONSTRAINT "Theme_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES "Masjid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerTime" ADD CONSTRAINT "PrayerTime_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES "Masjid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flyer" ADD CONSTRAINT "Flyer_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES "Masjid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasjidProduct" ADD CONSTRAINT "MasjidProduct_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES "Masjid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasjidProduct" ADD CONSTRAINT "MasjidProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES "Masjid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckoutSessions" ADD CONSTRAINT "CheckoutSessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MizanTv" ADD CONSTRAINT "MizanTv_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MizanTv" ADD CONSTRAINT "MizanTv_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerCalculation" ADD CONSTRAINT "PrayerCalculation_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES "Masjid"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IqamahTiming" ADD CONSTRAINT "IqamahTiming_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES "Masjid"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KioskInstance" ADD CONSTRAINT "KioskInstance_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KioskInstance" ADD CONSTRAINT "KioskInstance_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES "Masjid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonationCategory" ADD CONSTRAINT "DonationCategory_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES "Masjid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES "Masjid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "DonationCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_kioskInstanceId_fkey" FOREIGN KEY ("kioskInstanceId") REFERENCES "KioskInstance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MasjidUsers" ADD CONSTRAINT "_MasjidUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "Masjid"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MasjidUsers" ADD CONSTRAINT "_MasjidUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
