"use server";

import { NextRequest, NextResponse } from "next/server"
import { getPaymentAndOrder, getSessionAndOrder } from "@/lib/actions/order";
import EasyPost from "@easypost/api";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: any
) {
  const { id } = await params
  try {
    const order = await prisma.orders.findUnique({
      where: { id: id },
      include: {
        masjid: true,
        user: true
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }
    let stripeAndOrder = null;
    if(order.stripeSessionId?.startsWith("pi_")) {
      stripeAndOrder = await getPaymentAndOrder(order.stripeSessionId);
    } else {
      stripeAndOrder = await getSessionAndOrder(order.stripeSessionId as string);
    }

    const checkoutSession = await prisma.checkoutSessions.findFirst({
      where: {
        sessionId: order.stripeSessionId as string
      }
    });

    if(!checkoutSession) {
      return NextResponse.json(
        { error: "Checkout session not found" },
        { status: 404 }
      )
    }

    let trackingDetails = null;
    if (order.trackingNumber) {
      try {
        const apiKey = process.env.EASYPOST_API_KEY;
        if (apiKey) {
          const client = new EasyPost(apiKey);
          // Try to fetch tracker by tracking code (auto-detect carrier)
          // If you store carrier, pass it as { carrier: order.carrier }
          const tracker = await client.Tracker.create({ tracking_code: order.trackingNumber });
          trackingDetails = tracker;
        }
      } catch (err) {
        console.error("EasyPost tracking fetch failed:", err);
        trackingDetails = { error: "Failed to fetch tracking info" };
      }
    }

    const newOrder = {
      ...order,
      ...stripeAndOrder,  
      checkoutSession,
      items: JSON.parse(checkoutSession.cart).map((e: any) => {
        return {
          id: e.productId,
          name: e.name,
          price: e.price,
          quantity: e.quantity,
          size: e.size || null
        }
      }),
      trackingDetails,
    }


    return NextResponse.json(newOrder)
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: any
) {
  const { id } = await params
  try {
    const data = await request.json()
    console.log(data)
    const order = await prisma.orders.update({
      where: { id: id },
      data: data,
      include: {
        masjid: true,
        user: true,
      },
    })
    return NextResponse.json(order)
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: any
) {
  const { id } = await params
  try {
    await prisma.orders.delete({
      where: { id: id },
    })
    return NextResponse.json({ message: "Order deleted successfully" })
  } catch (error) {
    console.error("Error deleting order:", error)
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    )
  }
} 