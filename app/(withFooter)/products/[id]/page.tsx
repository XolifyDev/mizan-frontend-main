import { notFound } from "next/navigation"
import type { Metadata, ResolvingMetadata } from "next"
import ProductDetailClient from "./product-detail-client"
import { getProductByURL, getRelatedProducts } from "@/lib/actions/products"

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  // Fetch product data
  const product = await getProductByURL(params.id)

  if (!product) {
    return {
      title: "Product Not Found | Mizan",
      description: "The requested product could not be found.",
    }
  }

  return {
    title: `${product.name} | Mizan`,
    description: product.description,
  }
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductByURL(params.id)
  const relatedProducts = await getRelatedProducts(product?.id || "", 5);

  if (!product) {
    return notFound()
  }

  return <ProductDetailClient product={product} relatedProducts={relatedProducts} />
}


