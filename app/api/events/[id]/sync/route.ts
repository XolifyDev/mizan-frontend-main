import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { syncEventToGoogleCalendar } = await import("@/lib/actions/google-calendar");
    await syncEventToGoogleCalendar(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error syncing event to Google Calendar:", error);
    return NextResponse.json(
      { error: "Failed to sync event to Google Calendar" },
      { status: 500 }
    );
  }
} 
