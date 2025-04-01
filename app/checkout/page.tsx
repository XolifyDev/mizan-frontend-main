import type { Metadata } from "next"
import CheckoutClientPage from "./CheckoutClientPage"

export const metadata: Metadata = {
  title: "Checkout | Mizan",
  description: "Complete your purchase of Mizan products",
}

export default function CheckoutPage() {
  return <CheckoutClientPage />
}

