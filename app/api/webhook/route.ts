import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { v4 } from "uuid"
import { stripeClient } from "@/lib/stripe"

interface ShippingData {
  masjid?: string;
  [key: string]: any;
}

async function createOrderFromSession(session: any) {
  const shippingData = session.shippingData as ShippingData;

  // Idempotent — skip if order already exists (e.g. client-side already created it)
  const existing = await prisma.orders.findFirst({ where: { stripeSessionId: session.sessionId } });
  if (existing) return;

  await prisma.orders.create({
    data: {
      cart: session.cart,
      id: `mizan_${v4()}`,
      status: "processing",
      stripeSessionId: session.sessionId,
      userId: session.userId,
      masjidId: shippingData?.masjid || null,
      meta_data: {
        items: JSON.parse(session.cart).map((item: any) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
        })),
      },
    },
  });

  await prisma.checkoutSessions.update({
    where: { id: session.id },
    data: { completed: "paid" },
  });
}

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature") as string

  let event: any;
  try {
    event = stripeClient.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    const object = event.data.object as any;

    switch (event.type) {
      case "checkout.session.completed": {
        const session = await prisma.checkoutSessions.findFirst({
          where: { sessionId: object.id },
        });
        if (session) await createOrderFromSession(session);
        break;
      }

      case "payment_intent.succeeded": {
        const session = await prisma.checkoutSessions.findFirst({
          where: { sessionId: object.id },
        });
        if (session) await createOrderFromSession(session);
        break;
      }

      case "invoice.payment_succeeded":
        break;

      default:
        console.log(`Unhandled webhook event: ${event.type}`);
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("Webhook handler error:", err)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 400 })
  }
}
