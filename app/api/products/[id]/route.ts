import { NextRequest, NextResponse } from "next/server"
import { getUser } from "@/lib/actions/user"
import { prisma } from "@/lib/db"
import { stripeClient } from "@/lib/stripe"

// GET /api/products/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: true },
    })
    if (!product) {
      return NextResponse.json({ error: true, message: "Product not found" }, { status: 404 })
    }
    return NextResponse.json(product)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: true, message: "Failed to fetch product" }, { status: 500 })
  }
}

// PUT /api/products/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Auth check using better-auth
    const user = await getUser()
    if (!user || !user.admin) {
      return NextResponse.json({ error: true, message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const existingProduct = await prisma.product.findUnique({
      where: { id: (await params).id },
      include: { images: true },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: true, message: "Product not found" }, { status: 404 })
    }

    // Update product in Stripe
    if (existingProduct.stripeProductId) {
      await stripeClient.products.update(existingProduct.stripeProductId, {
        name: body.name,
        description: body.description,
        images: body.images && body.images.length > 0 ? [body.images[0].url] : undefined,
        metadata: {
          category: body.category || "",
          type: body.type || "kiosk",
          url: body.url || "",
          popular: body.popular ? "true" : "false",
          meta_data: JSON.stringify(body.meta_data),
        },
      })
    }

    // Update product in database
    const product = await prisma.product.update({
      where: { id: (await params).id },
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
        discountType: body.discountType ?? undefined,
        discountValue: body.discountValue ? Number(body.discountValue) : undefined,
        discountStart: body.discountStart ? new Date(body.discountStart) : undefined,
        discountEnd: body.discountEnd ? new Date(body.discountEnd) : undefined,
        images: {
          deleteMany: {},
          create: body.images.map((img: any) => ({
            url: img.url,
            alt: img.alt,
            order: img.order,
          })),
        },
        meta_data: body.meta_data,
      },
      include: { images: true },
    })

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: true, message: "Failed to update product" }, { status: 500 })
  }
} 