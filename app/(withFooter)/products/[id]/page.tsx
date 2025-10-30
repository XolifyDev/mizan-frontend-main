import { notFound } from "next/navigation"
import type { Metadata, ResolvingMetadata } from "next"
import ProductDetailClient from "./product-detail-client"
import { getProductByURL, getRelatedProducts } from "@/lib/actions/products"

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductByURL(id)

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
  const { id } = await params;
  const product = await getProductByURL(id)
  const relatedProducts = await getRelatedProducts(product?.id || "", 5);

  if (!product) {
    return notFound()
  }

  // Cast meta_data to ensure type compatibility
  const extendedProduct = {
    ...product,
    meta_data: (product.meta_data || {}) as { sizes?: Array<{ size: string; price: number }> }
  };

  const extendedRelatedProducts = relatedProducts.map(p => ({
    ...p,
    meta_data: (p.meta_data || {}) as { sizes?: Array<{ size: string; price: number }> }
  }));

  return <ProductDetailClient product={extendedProduct} relatedProducts={extendedRelatedProducts} />
}


