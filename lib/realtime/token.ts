import crypto from "node:crypto";

type RealtimeRole = "admin" | "device";

export type RealtimeTokenPayload = {
  role: RealtimeRole;
  masjidId: string;
  exp: number;
  userId?: string;
  deviceId?: string;
};

function base64UrlEncode(value: string | Buffer) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return Buffer.from(`${normalized}${padding}`, "base64").toString("utf8");
}

function getSecret() {
  return process.env.REALTIME_SHARED_SECRET || process.env.BETTER_AUTH_SECRET || "mizan-dev-realtime-secret";
}

export function signRealtimeToken(payload: Omit<RealtimeTokenPayload, "exp">, ttlSeconds = 60 * 10) {
  const fullPayload: RealtimeTokenPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };

  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(encodedPayload)
    .digest();

  return `${encodedPayload}.${base64UrlEncode(signature)}`;
}

export function verifyRealtimeToken(token: string): RealtimeTokenPayload | null {
  const [encodedPayload, encodedSignature] = token.split(".");
  if (!encodedPayload || !encodedSignature) return null;

  const expectedSignature = crypto
    .createHmac("sha256", getSecret())
    .update(encodedPayload)
    .digest();

  const providedSignature = Buffer.from(
    encodedSignature.replace(/-/g, "+").replace(/_/g, "/"),
    "base64"
  );

  if (
    providedSignature.length !== expectedSignature.length ||
    !crypto.timingSafeEqual(providedSignature, expectedSignature)
  ) {
    return null;
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload)) as RealtimeTokenPayload;
  if (payload.exp <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}
