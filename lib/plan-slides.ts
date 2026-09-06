import { isPro, PRO_FEATURES, slideLimit, type Plan } from "@/lib/plan";

/**
 * Downgrades a slide payload for a Free masjid, server-side.
 *
 * The TV app is a public Play Store build, so any check inside the APK can be
 * bypassed with a repackaged build. This runs before the payload leaves the
 * server, which is the only gate that actually holds.
 *
 * Downgrade rather than remove: a masjid that lapses should keep showing
 * *something* correct on the wall, not a blank screen. Pro slides drop out,
 * Pro templates and layouts fall back to Classic fullscreen.
 */

/** Slide types that require Pro. Prayer times and announcements stay free. */
const PRO_SLIDE_TYPES = new Set([
  "video",
  "website",
  "google_calendar",
  "custom",
  "eid_countdown",
  "ramadan_countdown",
  "days_countdown",
  "countdown",
  "taraweeh_timings",
  "iqamah_timings",
]);

const isProSlide = (slide: any): boolean =>
  PRO_SLIDE_TYPES.has(slide?.type) ||
  PRO_SLIDE_TYPES.has(slide?.content?.type);

export function downgradeSlidesForPlan<T extends { slides: any[] }>(
  payload: T,
  plan: Plan | string | null | undefined
): T {
  if (isPro(plan)) return payload;

  const slides = payload.slides
    .filter((slide) => !isProSlide(slide))
    .map((slide) => ({
      ...slide,
      // Pro templates fall back to Classic.
      template: PRO_FEATURES.templates.includes(slide?.template)
        ? "classic"
        : slide?.template,
      // Split-screen falls back to fullscreen.
      layout: PRO_FEATURES.layouts.includes(slide?.layout)
        ? "full"
        : slide?.layout,
    }))
    // Free is capped to a single slide in the rotation. Trimming rather than
    // clearing keeps a working display on the wall.
    .slice(0, slideLimit("FREE"));

  return { ...payload, slides, plan: "FREE" } as T;
}
