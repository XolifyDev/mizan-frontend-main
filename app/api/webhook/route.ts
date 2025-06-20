import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { v4 } from "uuid"

interface ShippingData {
  masjid?: string;
  [key: string]: any;
}

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature") as string

  try {
    // In a real implementation, you would verify the webhook signature
    // const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)

    // For now, we'll just parse the JSON
    const event = JSON.parse(body)

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed":
        const checkoutSession = await prisma.checkoutSessions.findFirst({
          where: {
            sessionId: event.data.id
          }
        });
        if(!checkoutSession) return;
        // 1. Update your database with the order status
        await prisma.checkoutSessions.update({
          where: {
            id: checkoutSession.id
          },
          data: {
            completed: "paid",
          }
        });

        const shippingData = checkoutSession.shippingData as ShippingData;

        await prisma.orders.create({
          data: {
            cart: checkoutSession.cart,
            id: `mizan_${v4()}_${new Date().getMilliseconds()}`,
            status: "processing",
            stripeSessionId: checkoutSession.sessionId,
            userId: checkoutSession.userId,
            masjidId: shippingData?.masjid,
            meta_data: {
              items: JSON.parse(checkoutSession.cart).map((item: any) => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                size: item.size
              }))
            }
          }
        });
        // 2. Send confirmation emails
        // 3. Provision access to purchased products
        break

      case "payment_intent.succeeded":
        const paymentIntent = await prisma.checkoutSessions.findFirst({
          where: {
            sessionId: event.data.id
          }
        });
      
        if(!paymentIntent) return;
        // 1. Update your database with the order status
        await prisma.checkoutSessions.update({
          where: {
            id: paymentIntent.id
          },
          data: {
            completed: "paid",
          }
        });

        console.log(paymentIntent)

        const paymentShippingData = paymentIntent.shippingData as ShippingData;

        await prisma.orders.create({
          data: {
            cart: paymentIntent.cart,
            id: `mizan_${v4()}_${new Date().getMilliseconds()}`,
            status: "processing",
            stripeSessionId: paymentIntent.sessionId,
            userId: paymentIntent.userId,
            masjidId: paymentShippingData?.masjid,
            meta_data: {
              items: JSON.parse(paymentIntent.cart).map((item: any) => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                size: item.size
              }))
            }
          }
        });
      break

      case "invoice.payment_succeeded":
        // Continue to provision the subscription as payments continue to be made
        // Store the status in your database and check when a user accesses your service
        break

      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("Webhook error:", err)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 400 })
  }
}

// This is needed to disable the default body parsing
export const config = {
  api: {
    bodyParser: false,
  },
}

