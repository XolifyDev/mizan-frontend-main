"use server";

import { prisma } from "@/lib/db";
import { startOfMonth, endOfMonth } from "date-fns";

export const getDonations = async () => {
  const donations = await prisma.donation.findMany();
  return donations;
};

export const getDonationCategories = async () => {
  const donationCategories = await prisma.donationCategory.findMany();
  return donationCategories;
};

export const getTotalDonationsThisMonth = async (masjidId?: string) => {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);
  const where: any = {
    createdAt: { gte: start, lte: end },
    status: "completed",
  };
  if (masjidId) where.masjidId = masjidId;
  const result = await prisma.donation.aggregate({
    _sum: { amount: true },
    where,
  });
  return result._sum.amount || 0;
};

export const getTopDonationCategories = async (masjidId?: string) => {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);
  const where: any = {
    createdAt: { gte: start, lte: end },
    status: "completed",
  };
  if (masjidId) where.masjidId = masjidId;
  const top = await prisma.donation.groupBy({
    by: ["categoryId"],
    where,
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
    take: 3,
  });
  const categories = await prisma.donationCategory.findMany({
    where: { id: { in: top.map(t => t.categoryId) } },
  });
  return top.map(t => ({
    ...t,
    category: categories.find(c => c.id === t.categoryId),
  }));
};

export const getDonationOverview = async (masjidId?: string) => {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);
  const where: any = {
    createdAt: { gte: start, lte: end },
    status: "completed",
  };
  if (masjidId) where.masjidId = masjidId;
  const grouped = await prisma.donation.groupBy({
    by: ["categoryId"],
    where,
    _sum: { amount: true },
  });
  const categories = await prisma.donationCategory.findMany({
    where: { id: { in: grouped.map(g => g.categoryId) } },
  });
  return grouped.map(g => ({
    ...g,
    category: categories.find(c => c.id === g.categoryId),
  }));
};

export const getRecentDonations = async (masjidId?: string, page = 1, pageSize = 10) => {
  const where: any = { status: "completed" };
  if (masjidId) where.masjidId = masjidId;
  const [donations, total] = await Promise.all([
    prisma.donation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        category: true,
      },
    }),
    prisma.donation.count({ where }),
  ]);
  return { donations, total };
};

export const seedTestDonationsAndCategories = async () => {
  const MASJID_ID = "m_17ee4f6d-5e90-43bc-8751-df65dff67ca5";
  // Create categories if not exist
  const categoriesData = [
    { name: "General Fund", color: "#550C18" },
    { name: "Building Fund", color: "#1E824C" },
    { name: "Zakat", color: "#6C3483" },
    { name: "Education", color: "#F39C12" },
  ];
  const categories = [];
  for (const cat of categoriesData) {
    let category = await prisma.donationCategory.findFirst({ where: { name: cat.name, masjidId: MASJID_ID } });
    if (!category) {
      category = await prisma.donationCategory.create({ data: { ...cat, masjidId: MASJID_ID } });
    }
    categories.push(category);
  }
  // Create donations for this month
  const now = new Date();
  const donationsData = [
    { amount: 100, donorName: "Ahmed Hassan", donorEmail: "ahmed.h@example.com", categoryId: categories[0].id },
    { amount: 250, donorName: "Sarah Ali", donorEmail: "sarah.a@example.com", categoryId: categories[2].id },
    { amount: 500, donorName: "Mohammed Khan", donorEmail: "m.khan@example.com", categoryId: categories[1].id },
    { amount: 150, donorName: "Fatima Qureshi", donorEmail: "fatima.q@example.com", categoryId: categories[3].id },
    { amount: 75, donorName: "Yusuf Abdullah", donorEmail: "yusuf.a@example.com", categoryId: categories[0].id },
  ];
  for (const d of donationsData) {
    await prisma.donation.create({
      data: {
        ...d,
        masjidId: MASJID_ID,
        status: "completed",
        paymentMethod: "card",
        createdAt: now,
        updatedAt: now,
      },
    });
  }
  return { categories, donations: donationsData };
};

