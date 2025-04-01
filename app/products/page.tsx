import type { Metadata } from "next"
import Products from "@/components/products/ProductsPage";
import { getProducts } from "@/lib/actions";

export const metadata: Metadata = {
  title: "Products | Mizan",
  description: "Explore Mizan's mosque management products and solutions",
}

export default async function ProductsPage() {
  const products = await getProducts();
  return <Products products={products} />
}

