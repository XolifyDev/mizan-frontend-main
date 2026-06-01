import crypto from "node:crypto";
import { prisma } from "@/lib/db";

type SlideContentRecord = {
  updatedAt?: string | Date | null;
  createdAt?: string | Date | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  active?: boolean | null;
  [key: string]: unknown;
};

type SignageSlide = {
  id?: string;
  type?: string;
  contentId?: string | null;
  content?: SlideContentRecord | null;
  layout?: string | null;
  theme?: unknown;
  order?: number | null;
  [key: string]: unknown;
};

type SignageConfigShape = {
  slides?: SignageSlide[];
};

type SlideResponse = {
  masjid: {
    id: string;
    name: string;
    logo: string;
  };
  slides: SignageSlide[];
  version: string;
  generatedAt: string;
};

function createVersionHash(payload: unknown) {
  return crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export async function buildMasjidSlidesResponse(
  masjidId: string,
  displayId?: string | null
): Promise<SlideResponse | null> {
  const masjid = await prisma.masjid.findUnique({
    where: { id: masjidId },
    select: {
      id: true,
      name: true,
      logo: true,
    },
  });

  if (!masjid) {
    return null;
  }

  let signageConfig;

  if (displayId) {
    signageConfig = await prisma.signageConfig.findFirst({
      where: {
        masjidId,
        displayId,
      },
    });
  } else {
    signageConfig = await prisma.signageConfig.findFirst({
      where: { masjidId },
    });
  }

  const signageConfigData = signageConfig?.config as SignageConfigShape | null | undefined;

  if (!signageConfig || !signageConfigData?.slides) {
    return {
      masjid,
      slides: [],
      version: createVersionHash({ masjidId, displayId, slides: [] }),
      generatedAt: new Date().toISOString(),
    };
  }

  const slides = signageConfigData.slides;
  const slidesWithLatestContent = await Promise.all(
    slides.map(async (slide: SignageSlide) => {
      if (!slide.contentId) return slide;

      if (slide.type === "announcements") {
        const announcement = await prisma.announcement.findUnique({
          where: { id: slide.contentId },
        });

        return announcement
          ? {
              ...slide,
              content: announcement,
            }
          : slide;
      }

      const content = await prisma.content.findUnique({
        where: { id: slide.contentId },
      });

      return content
        ? {
            ...slide,
            content,
          }
        : slide;
    })
  );

  const now = new Date();
  const activeSlides = slidesWithLatestContent.filter((slide: SignageSlide) => {
    if (slide.type === "custom") return true;

    if (slide.type === "announcements" && slide.content) {
      const startDate = slide.content.startDate ? new Date(slide.content.startDate) : null;
      const endDate = slide.content.endDate ? new Date(slide.content.endDate) : null;
      const afterStart = !startDate || now >= startDate;
      const beforeEnd = !endDate || now <= endDate;
      return slide.content.active === true && afterStart && beforeEnd;
    }

    if (slide.content) {
      const startDate = slide.content.startDate ? new Date(slide.content.startDate) : null;
      const endDate = slide.content.endDate ? new Date(slide.content.endDate) : null;
      const afterStart = !startDate || now >= startDate;
      const beforeEnd = !endDate || now <= endDate;
      return slide.content.active === true && afterStart && beforeEnd;
    }

    return false;
  });

  const version = createVersionHash({
    masjidId,
    displayId,
    updatedAt: signageConfig.updatedAt.toISOString(),
    slides: activeSlides.map((slide: SignageSlide) => ({
      id: slide.id,
      type: slide.type,
      contentId: slide.contentId ?? null,
      contentUpdatedAt: slide.content?.updatedAt ?? slide.content?.createdAt ?? null,
      startDate: slide.content?.startDate ?? null,
      endDate: slide.content?.endDate ?? null,
      layout: slide.layout ?? null,
      theme: slide.theme ?? null,
      order: slide.order ?? null,
    })),
  });

  return {
    masjid,
    slides: activeSlides,
    version,
    generatedAt: new Date().toISOString(),
  };
}
