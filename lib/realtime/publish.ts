export async function publishRealtimeUpdate(payload: {
  masjidId: string;
  deviceId?: string | null;
  type?: "content_update" | "sync_required";
  version?: string | null;
  reason?: string;
}) {
  const realtimeUrl =
    process.env.NEXT_PUBLIC_REALTIME_URL || process.env.REALTIME_SERVER_URL;
  const secret = process.env.REALTIME_SHARED_SECRET;

  if (!realtimeUrl || !secret) {
    return false;
  }

  try {
    const publishUrl = `${realtimeUrl.replace(/\/$/, "")}/publish`;
    const response = await fetch(publishUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-realtime-secret": secret,
      },
      body: JSON.stringify(payload),
    });

    return response.ok;
  } catch (error) {
    console.error("Failed to publish realtime update:", error);
    return false;
  }
}
