/**
 * Next.js instrumentation hook.
 *
 * Production builds strip the message from Server Component errors and hand the
 * client only a digest, which is unactionable on its own. This logs the real
 * error, its digest, and the route so the two can be matched up in Vercel's
 * Runtime Logs.
 */
export async function onRequestError(
  error: unknown,
  request: {
    path?: string;
    method?: string;
    headers?: Record<string, string | undefined>;
  },
  context: {
    routerKind?: string;
    routePath?: string;
    routeType?: string;
  }
) {
  const err = error as Error & { digest?: string };

  console.error(
    [
      "",
      "══════════ SERVER ERROR ══════════",
      `digest:  ${err?.digest ?? "(none)"}`,
      `route:   ${context?.routePath ?? request?.path ?? "(unknown)"} [${context?.routeType ?? "?"}]`,
      `method:  ${request?.method ?? "?"}`,
      `name:    ${err?.name ?? "?"}`,
      `message: ${err?.message ?? String(error)}`,
      "stack:",
      err?.stack ?? "(no stack)",
      "══════════════════════════════════",
      "",
    ].join("\n")
  );
}
