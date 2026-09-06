import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Cache health check results for 5 minutes
let lastHealthCheck = {
  timestamp: 0,
  status: "healthy" as "healthy" | "unhealthy",
  error: null as string | null,
}

const HEALTH_CHECK_INTERVAL = 5 * 60 * 1000 // 5 minutes

async function logHealthEvent(details: string) {
  // Use fetch to log event via API route (server-side only)
  try {
    await fetch("/api/log-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "view",
        entityType: "health",
        entityId: "system",
        userId: "system",
        details,
      }),
    })
  } catch (e) {
    // Ignore logging errors in middleware
  }
}

async function checkDatabaseHealth() {
  const now = Date.now()
  if (now - lastHealthCheck.timestamp < HEALTH_CHECK_INTERVAL) {
    return lastHealthCheck
  }

  // Instead of Prisma, use a lightweight check (e.g., skip or ping a health endpoint)
  // For demonstration, always return healthy
  lastHealthCheck = {
    timestamp: now,
    status: "healthy",
    error: null,
  }
  // Optionally log latency warning (simulate)
  // await logHealthEvent(`Database latency warning: 10ms`)
  return lastHealthCheck
}

export async function middleware(request: NextRequest) {
  // Skip health check for health endpoint itself
  if (request.nextUrl.pathname === "/api/health") {
    return NextResponse.next()
  }

  // Check database health
  const health = await checkDatabaseHealth()

  // If database is unhealthy, return 503 for API routes
  if (health.status === "unhealthy" && request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json(
      {
        error: "Service temporarily unavailable",
        details: health.error,
      },
      { status: 503 }
    )
  }

  // Forward the active masjid and pathname as headers. Next.js layouts do not
  // receive searchParams, and the plan gate has to run in a layout because most
  // dashboard pages are client components. Reading these back via headers() is
  // the supported way to get at them server-side.
  const requestHeaders = new Headers(request.headers)
  const masjidId = request.nextUrl.searchParams.get("masjidId")
  if (masjidId) requestHeaders.set("x-masjid-id", masjidId)
  requestHeaders.set("x-pathname", request.nextUrl.pathname)

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: ["/dashboard/:path*"],
} 