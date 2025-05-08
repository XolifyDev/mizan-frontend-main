import { NextResponse } from "next/server";
import { getUser } from "@/lib/actions/user";
import { getUserMasjid } from "@/lib/actions/masjid";

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: true, message: "Not authenticated" }, { status: 401 });
  }
  const masjid = await getUserMasjid();
  if (!masjid || masjid.ownerId !== user.id) {
    return NextResponse.json({ error: true, message: "No masjid found or not authorized" }, { status: 403 });
  }
  return NextResponse.json(masjid);
} 