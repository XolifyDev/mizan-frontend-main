/*
  Warnings:

  - The primary key for the `_AnnouncementToTVDisplay` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_DisplayContent` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_MasjidUsers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[A,B]` on the table `_AnnouncementToTVDisplay` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_DisplayContent` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_MasjidUsers` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Orders" ADD COLUMN     "masjidId" TEXT;

-- AlterTable
ALTER TABLE "_AnnouncementToTVDisplay" DROP CONSTRAINT "_AnnouncementToTVDisplay_AB_pkey";

-- AlterTable
ALTER TABLE "_DisplayContent" DROP CONSTRAINT "_DisplayContent_AB_pkey";

-- AlterTable
ALTER TABLE "_MasjidUsers" DROP CONSTRAINT "_MasjidUsers_AB_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "_AnnouncementToTVDisplay_AB_unique" ON "_AnnouncementToTVDisplay"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_DisplayContent_AB_unique" ON "_DisplayContent"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_MasjidUsers_AB_unique" ON "_MasjidUsers"("A", "B");

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES "Masjid"("id") ON DELETE CASCADE ON UPDATE CASCADE;
