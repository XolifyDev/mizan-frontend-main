import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getUser } from "@/lib/actions/user"
import { stripeClient } from "@/lib/stripe"

// GET /api/products?masjidId=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const masjidId = searchParams.get("masjidId")
  try {
    if (masjidId) {
      // Get products assigned to this masjid
      const masjidProducts = await prisma.masjidProduct.findMany({
        where: { masjidId },
        include: { product: true },
      })
      return NextResponse.json(masjidProducts.map((mp: any) => mp.product))
    } else {
      // Get all products
      const products = await prisma.product.findMany()
      return NextResponse.json(products)
    }
  } catch (error) {
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
    // Create product in Stripe
    const stripeProduct = await stripeClient.products.create({
      name: body.name,
      description: body.description,
      images: body.images && body.images.length > 0 ? [body.images[0].url] : undefined,
      metadata: {
        category: body.category || "",
        type: body.type || "kiosk",
        url: body.url || "",
        popular: body.popular ? "true" : "false",
      },
    })
    // Accept: name, description, features, price, image, category, type, url, popular, stripeProductId, discountType, discountValue, discountStart, discountEnd, images
    const product = await prisma.product.create({
      data: {
        name: body.name,
        description: body.description,
        features: body.features ?? [],
        price: Number(body.price),
        image: body.images && body.images[0] ? body.images[0].url : undefined,
        category: body.category ?? "",
        type: body.type ?? "kiosk",
        url: body.url ?? "",
        popular: !!body.popular,
        stripeProductId: stripeProduct.id,
        discountType: body.discountType ?? undefined,
        discountValue: body.discountValue ? Number(body.discountValue) : undefined,
        discountStart: body.discountStart ? new Date(body.discountStart) : undefined,
        discountEnd: body.discountEnd ? new Date(body.discountEnd) : undefined,
        images: body.images && body.images.length > 0 ? {
          create: body.images.map((img: any) => ({
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