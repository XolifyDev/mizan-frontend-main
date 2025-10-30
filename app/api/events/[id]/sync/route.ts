import { NextResponse } from "next/server";
import { syncEventToGoogleCalendar } from "@/lib/actions/google-calendar";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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