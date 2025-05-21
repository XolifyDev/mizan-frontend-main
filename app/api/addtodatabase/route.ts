import { NextResponse } from "next/server";
import { seedTestDonationsAndCategories } from "@/lib/actions/donations";

export async function GET(request: Request) {
  await seedTestDonationsAndCategories();
  return NextResponse.json({ message: "Donations and categories seeded successfully" });
}   