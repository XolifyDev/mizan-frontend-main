import type { Metadata } from "next"
import CartPageComponent from "./CartPage"
import { getProducts } from "@/lib/actions"

export const metadata: Metadata = {
  title: "Shopping Cart | Mizan",
  description: "Review and manage your Mizan products selection",
}

export default async function CartPage() {
  const products = await getProducts();
  return <CartPageComponent products={products} />
}

