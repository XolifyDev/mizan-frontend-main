"use server";
import { v4 } from "uuid";
import { CartItem } from "../cartItemSchema";
import { prisma } from "../db";
import { stripeClient } from "../stripe";
import { Discount } from "../useCartStore";
import { getFullUser as getUser } from "./user";

type CreateCheckoutSessionProps = {
  cart: CartItem[];
  discount: Discount | null;
  card: {
    number: number,
    cvv: number,
    name: string
  };
}
export const createCheckoutSession = async ({ cart, discount, card }: CreateCheckoutSessionProps) => {
  void discount;
  void card;
  const products = [];
  const line_items = [];

  for (const product of cart) {
    const pro = await prisma.product.findFirst({
      where: {
        id: product.id
      }
    });
    if(!pro) return;
    products.push(pro);
    line_items.push({
      price_data: {
        currency: "USD",
        product_data: {
          name: pro.name,
          images: [pro.image],
        },
        unit_amount: Math.round(Number(product.price) * 100),
      },
      quantity: 1,
    })
  };

}

type CreateCheckoutPageProps = {
  cart: CartItem[];
  discount: Discount | null;
}

export const createCheckoutPage = async ({
  cart,
  discount,
}: CreateCheckoutPageProps) => {
  void discount;
  const user = await getUser();
  if(!user) return {
    error: true,
    message: "Please login"
  };
  const productIds = cart.map((product) => product.productId);
  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
  });
  const productMap = new Map(products.map((product) => [product.id, product]));
  const line_items = cart
    .map((product) => {
      const pro = productMap.get(product.productId);
      if (!pro) return null;

      return {
        price_data: {
          currency: "USD",
          product_data: {
            name: pro.name,
            images: [pro.image],
          },
          unit_amount: Math.round(Number(product.price) * 100),
        },
        quantity: product.quantity,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  if(products.find((e) => e?.requiredSubscriptionId && e?.requiredSubscriptionId.length < 1) && products.length > 1) return {
    error: true,
    message: "When purchasing a subscription please only have the subscription in your cart. Jazakallahu Khair"
  };

  const subscription = products.find((e) => e?.requiredSubscriptionId && e?.requiredSubscriptionId.length > 1) || null ;

  if(!subscription) return {
    redirect: true
  };

  const session = await stripeClient.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: subscription ? [{
      price: subscription?.requiredSubscriptionId,
      quantity: 1
    }] : line_items,
    mode: subscription ? "subscription" : 'payment', // or 'payment' for one-time purchases
    success_url: `${process.env.DOMAIN}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.DOMAIN}/cart`,
    customer: user.stripeCustomerId || null,
    shipping_address_collection: {
      allowed_countries: [
        "US"
      ]
    },
  });

  await prisma.checkoutSessions.create({
    data: {
      id: v4(),
      cart: JSON.stringify(cart),
      completed: "pending",
      paymentType: subscription ? "subscription" : 'payment',
      sessionId: session.id,
      userId: user.id
    }
  });

  return {
    error: false,
    id: session.id
  }
}

type CreatePaymentIntentParams = {
  amount: number
  cart: CartItem[]
  discount?: {
    code: string
    percent: number
    id: string
  } | null
  shippingData: Record<string, unknown>
}
export async function createPaymentIntent({ amount, cart, discount, shippingData }: CreatePaymentIntentParams) {
  const user = await getUser();
  if(!user) return {
    error: true,
    message: "Please login"
  };
  try {
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      customer: user.stripeCustomerId || "",
      metadata: {
        cart_items: JSON.stringify(
          cart.map((item) => ({
            id: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            size: item.size,
            randomNumber: Math.random()
          })),
        ),
        discount_code: discount?.code || "",
        discount_percent: discount?.percent?.toString() || "0",
      },
    });

    await prisma.checkoutSessions.create({
      data: {
        id: v4(),
        cart: JSON.stringify(cart.map((item) => ({
            id: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            size: item.size
          }))),
        completed: "pending",
        paymentType: 'payment',
        sessionId: paymentIntent.id,
        userId: user.id,
        shippingData: shippingData
      }
    });


    return {
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id
    }
  } catch (error) {
    console.error("Error creating payment intent:", error)
    throw new Error("Failed to create payment intent")
  }
}
