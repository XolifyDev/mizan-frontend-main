"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, ShoppingCart, X, ChevronRight, Tag, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { toast } from "@/hooks/use-toast"
import Navbar from "../Navbar"
import { Products } from "@prisma/client"
import useCart from "@/lib/useCart"
import { v4 as uuid } from "uuid";

// Product type definition
type Product = {
  id: string
  name: string
  description: string
  price: number
  features: string[]
  image: string
  category: string
  popular?: boolean
}

type Props = {
  products: Products[]
}

export default function ProductsPage({ products }: Props) {
  const cart = useCart();
  const [cartOpen, setCartOpen] = useState(false)
  const [filter, setFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Add product to cart
  const addToCart = (product: Product) => {
    cart.addToCart({
      id: uuid(),
      name: product.name,
      productId: product.id,
      quantity: 1,
      imagesrc: product.image,
      price: product.price
    })

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  // Remove product from cart
  const removeFromCart = (productId: string) => {
    cart?.removeFromCart!(productId);

    toast({
      title: "Removed from cart",
      description: "Item has been removed from your cart.",
      variant: "destructive",
    })
  }

  // Filter and search products
  const filteredProducts = products
    .filter((product) => filter === "all" || product.category.toLowerCase() === filter.toLowerCase())
    .filter(
      (product) =>
        searchQuery === "" ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()),
    )

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#550C18] mb-4">Mizan Products</h2>
              <p className="text-xl text-[#3A3A3A]/70 max-w-2xl">
                Choose individual products or get the complete Mizan platform for your masjid.
              </p>
            </div>
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#3A3A3A]/50" />
              <Input
                placeholder="Search products..."
                className="pl-10 w-full md:w-[300px] bg-white/50 border-[#550C18]/10 focus:border-[#550C18] focus:ring-[#550C18]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
              className={filter === "all" ? "bg-[#550C18] text-white" : "border-[#550C18]/20 text-[#3A3A3A]"}
            >
              All Products
            </Button>
            <Button
              variant={filter === "Display" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("Display")}
              className={filter === "Display" ? "bg-[#550C18] text-white" : "border-[#550C18]/20 text-[#3A3A3A]"}
            >
              Displays
            </Button>
            <Button
              variant={filter === "Hardware" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("Hardware")}
              className={filter === "Hardware" ? "bg-[#550C18] text-white" : "border-[#550C18]/20 text-[#3A3A3A]"}
            >
              Hardware
            </Button>
            <Button
              variant={filter === "Software" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("Software")}
              className={filter === "Software" ? "bg-[#550C18] text-white" : "border-[#550C18]/20 text-[#3A3A3A]"}
            >
              Software
            </Button>
            <Button
              variant={filter === "Bundle" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("Bundle")}
              className={filter === "Bundle" ? "bg-[#550C18] text-white" : "border-[#550C18]/20 text-[#3A3A3A]"}
            >
              Bundles
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="bg-white border-[#550C18]/10 hover:shadow-lg transition-shadow overflow-hidden relative"
                >
                  {product.popular && (
                    <div className="absolute top-0 right-0 z-50 bg-[#550C18] text-white py-1 px-3 text-xs font-medium">
                      Popular
                    </div>
                  )}
                  <div className="h-[200px] overflow-hidden bg-[#550C18]/5">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge className="mb-2 bg-[#550C18]/10 text-[#550C18] hover:bg-[#550C18]/20">
                          {product.category}
                        </Badge>
                        <CardTitle className="text-xl font-semibold text-[#3A3A3A]">{product.name}</CardTitle>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-[#550C18]">${product.price}</span>
                        <span className="text-sm text-[#3A3A3A]/70">/month</span>
                      </div>
                    </div>
                    <CardDescription className="text-[#3A3A3A]/70 mt-2">{product.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <h4 className="font-medium text-[#3A3A3A] mb-2">Features:</h4>
                    <ul className="space-y-1">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-[#3A3A3A]/80">
                          <Check className="h-4 w-4 text-[#550C18] mt-0.5 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2 border-t border-[#550C18]/10">
                    <Link href={`/products/${product.url}`}>
                      <Button variant="outline" className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5">
                        Learn More
                      </Button>
                    </Link>
                    <Button className="bg-[#550C18] hover:bg-[#78001A] text-white" onClick={() => addToCart(product)}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12">
                <Tag className="h-16 w-16 text-[#550C18]/20 mb-4" />
                <h3 className="text-xl font-semibold text-[#3A3A3A] mb-2">No products found</h3>
                <p className="text-[#3A3A3A]/70 mb-4">Try adjusting your search or filter criteria</p>
                <Button
                  variant="outline"
                  className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
                  onClick={() => {
                    setFilter("all")
                    setSearchQuery("")
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 bg-[#550C18]/5 rounded-xl p-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-[#550C18] mb-4">Need a custom solution?</h2>
            <p className="text-[#3A3A3A] mb-6">
              Contact our team to discuss custom requirements for your masjid. We can tailor our products to meet your
              specific needs.
            </p>
            <Button className="bg-[#550C18] hover:bg-[#78001A] text-white">Contact for Custom Quote</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

