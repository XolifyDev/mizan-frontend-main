import { NextResponse } from "next/server";

import { getMasjidRole } from "@/lib/actions/members";
import { getMasjidPlan } from "@/lib/plan-guard";

/**
 * Current user's role and the masjid's plan, for client components (the
 * sidebar) that need both to decide what to show.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [role, plan] = await Promise.all([
    getMasjidRole(id),
    getMasjidPlan(id),
  ]);

  if (!role) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 });
  }

  return NextResponse.json({ role, plan });
}
