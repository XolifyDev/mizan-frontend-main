"use client";
import CheckoutClientPage from "./CheckoutClientPage"
import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
  return <Elements stripe={stripePromise}>
    <CheckoutClientPage />
  </Elements>
}

