import { NextResponse } from "next/server";
import { google } from "googleapis";
import { prisma } from "@/lib/db";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const masjidId = searchParams.get("masjidId");

    if (!masjidId) {
      return NextResponse.json(
        { error: "Masjid ID is required" },
        { status: 400 }
      );
    }

    // Generate OAuth URL
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent", // Force to show consent screen to get refresh token
      scope: [
        "https://www.googleapis.com/auth/calendar",
        "https://www.googleapis.com/auth/calendar.events",
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ],
      state: masjidId, // Store masjidId in state for later use
      redirect_uri: process.env.GOOGLE_REDIRECT_URI + '/api/google/calendar/callback'
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Error generating Google OAuth URL:", error);
    return NextResponse.json(
      { error: "Failed to generate OAuth URL" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { code, state: masjidId } = await request.json();

    if (!code || !masjidId) {
      return NextResponse.json(
        { error: "Code and masjidId are required" },
        { status: 400 }
      );
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken({
      code,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI + '/api/google/calendar/callback',
    });

    if (!tokens.refresh_token) {
      throw new Error('No refresh token received from Google');
    }

    oauth2Client.setCredentials(tokens);

    // Get the calendar ID
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    // Get a the user's profile picture
    const user = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await user.userinfo.get();
    const profilePicture = userInfo.data.picture;
    const calendarList = await calendar.calendarList.list();
    const primaryCalendar = calendarList.data.items?.find(
      (item) => item.primary
    );

    if (!primaryCalendar?.id) {
      throw new Error("No primary calendar found");
    }

    console.log(primaryCalendar, user, profilePicture);

    // Update masjid with calendar ID and credentials
    await prisma.masjid.update({
      where: { id: masjidId },
      data: {
        googleCalendarId: primaryCalendar.id,
        googleCalendarCredentials: tokens as any,
        googleCalendarPfp: profilePicture,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error handling Google OAuth callback:", error);
    return NextResponse.json(
      { error: "Failed to handle OAuth callback" },
      { status: 500 }
    );
  }
} 