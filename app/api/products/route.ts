import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getUser } from "@/lib/actions/user"
import { getUserMasjid } from "@/lib/actions/masjid"
import { stripeClient } from "@/lib/stripe"
import { z } from "zod"

const productImageSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional().nullable(),
  order: z.coerce.number().int().default(0),
});

const productCreateSchema = z.object({
  name: z.string().trim().min(1, "Product name is required"),
  description: z.string().trim().min(1, "Product description is required"),
  features: z.array(z.string()).default([]),
  price: z.coerce.number().int().positive("Price must be greater than 0"),
  category: z.string().optional().default(""),
  type: z.string().optional().default("kiosk"),
  url: z.string().optional().default(""),
  popular: z.boolean().optional().default(false),
  discountType: z.enum(["percentage", "fixed"]).optional().nullable(),
  discountValue: z.coerce.number().int().optional().nullable(),
  discountStart: z.string().optional().nullable(),
  discountEnd: z.string().optional().nullable(),
  images: z.array(productImageSchema).default([]),
});

function parseDate(value?: string | null) {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

// GET /api/products?masjidId=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const masjidId = searchParams.get("masjidId")
  try {
    if (masjidId) {
      const masjid = await getUserMasjid(masjidId);
      if (!masjid || (typeof masjid === "object" && "error" in masjid)) {
        return NextResponse.json({ error: true, message: "Unauthorized" }, { status: 401 });
      }
      // Get products assigned to this masjid
      const masjidProducts = await prisma.masjidProduct.findMany({
        where: { masjidId },
        include: { product: true },
      })
      return NextResponse.json(masjidProducts.map((mp) => mp.product))
    } else {
      const user = await getUser()
      if (!user || !user.admin) {
        return NextResponse.json({ error: true, message: "Unauthorized" }, { status: 401 })
      }
      // Get all products
      const products = await prisma.product.findMany()
      return NextResponse.json(products)
    }
  } catch (error) {
    console.error("[PRODUCTS_GET]", error);
    return NextResponse.json({ error: true, message: "Failed to fetch products" }, { status: 500 })
  }
}

// POST /api/products
export async function POST(req: NextRequest) {
  try {
    // Auth check using better-auth
    const user = await getUser()
    if (!user || !user.admin) {
      return NextResponse.json({ error: true, message: "Unauthorized" }, { status: 401 })
    }
    const body = await req.json();
    const parsed = productCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: true, message: parsed.error.issues[0]?.message || "Invalid product payload" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    // Create product in Stripe
    const stripeProduct = await stripeClient.products.create({
      name: data.name,
      description: data.description,
      images: data.images.length > 0 ? [data.images[0].url] : undefined,
      metadata: {
        category: data.category || "",
        type: data.type || "kiosk",
        url: data.url || "",
        popular: data.popular ? "true" : "false",
      },
    })
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        features: data.features,
        price: data.price,
        image: data.images[0]?.url,
        category: data.category,
        type: data.type,
        url: data.url,
        popular: data.popular,
        stripeProductId: stripeProduct.id,
        discountType: data.discountType ?? undefined,
        discountValue: data.discountValue ?? undefined,
        discountStart: parseDate(data.discountStart),
        discountEnd: parseDate(data.discountEnd),
        images: data.images.length > 0 ? {
          create: data.images.map((img) => ({
            url: img.url,
            alt: img.alt,
            order: img.order,
          }))
        } : undefined,
      },
      include: { images: true },
    })
    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: true, message: "Failed to create product" }, { status: 500 })
  }
} 
