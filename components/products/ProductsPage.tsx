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
import { useCart, withSSR } from "cart";

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

// Cart item type definition
type CartItem = {
  product: Product
  quantity: number
}

// Sample products data
// const products: Product[] = [
//   {
//     id: "tv-display",
//     name: "Masjid TV Display",
//     description: "Beautiful prayer time displays and announcement screens with customizable themes.",
//     price: 49,
//     features: [
//       "Prayer time displays",
//       "Announcement slides",
//       "Multiple themes",
//       "Remote management",
//       "Automatic updates",
//     ],
//     image: "/placeholder.svg?height=200&width=300",
//     category: "Display",
//   },
//   {
//     id: "payment-kiosk",
//     name: "Payment Kiosk",
//     description: "Secure donation collection with support for multiple funds and instant receipts.",
//     price: 79,
//     features: [
//       "Secure payment processing",
//       "Multiple donation categories",
//       "Email receipts",
//       "Reporting dashboard",
//       "User management",
//     ],
//     image: "/placeholder.svg?height=200&width=300",
//     category: "Hardware",
//     popular: true,
//   },
//   {
//     id: "cloud-website",
//     name: "Cloud Website",
//     description: "Professional masjid websites with prayer times, events calendar, and more.",
//     price: 39,
//     features: [
//       "Professional design",
//       "Prayer times integration",
//       "Events calendar",
//       "Mobile responsive",
//       "SEO optimization",
//     ],
//     image: "/placeholder.svg?height=200&width=300",
//     category: "Software",
//   },
//   {
//     id: "admin-dashboard",
//     name: "Admin Dashboard",
//     description: "Centralized control panel to manage all services from one place.",
//     price: 59,
//     features: [
//       "User management",
//       "Analytics and reporting",
//       "Content management",
//       "Device monitoring",
//       "Role-based access control",
//     ],
//     image: "/placeholder.svg?height=200&width=300",
//     category: "Software",
//   },
//   {
//     id: "complete-bundle",
//     name: "Complete Mizan Bundle",
//     description: "Get all Mizan products at a discounted price. Perfect for masjids looking for a complete solution.",
//     price: 199,
//     features: [
//       "All products included",
//       "Priority support",
//       "Free installation",
//       "Quarterly training sessions",
//       "Custom branding",
//     ],
//     image: "/placeholder.svg?height=200&width=300",
//     category: "Bundle",
//     popular: true,
//   },
// ]

type Props = {
  products: Products[]
}

export default function ProductsPage({ products }: Props) {
  const cart = withSSR(useCart, (state) => state);
  const [cartOpen, setCartOpen] = useState(false)
  const [filter, setFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Add product to cart
  const addToCart = (product: Product) => {
    cart?.addToCart!({
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
                    <Button variant="outline" className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5">
                      Learn More
                    </Button>
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

      {/* Footer */}
      <footer className="bg-[#3A3A3A] text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-10 w-10 rounded-full bg-[#550C18] flex items-center justify-center">
                  <span className="text-[#FDF0D5] font-bold text-xl">M</span>
                </div>
                <h3 className="text-2xl font-bold my-0">Mizan</h3>
              </div>
              <p className="text-sm opacity-80 mb-4">Unified Masjid Management Platform</p>
              <div className="flex gap-4">
                <a href="#" className="text-white hover:text-[#FDF0D5]">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-[#FDF0D5]">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-[#FDF0D5]">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.772 1.153 4.902 4.902 0 01-1.153 1.772c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 my-0">Products</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm opacity-80 hover:opacity-100">
                    TV Display
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm opacity-80 hover:opacity-100">
                    Payment Kiosk
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm opacity-80 hover:opacity-100">
                    Cloud Website
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm opacity-80 hover:opacity-100">
                    Admin Dashboard
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 my-0">Company</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm opacity-80 hover:opacity-100">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm opacity-80 hover:opacity-100">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm opacity-80 hover:opacity-100">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm opacity-80 hover:opacity-100">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 my-0">Support</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm opacity-80 hover:opacity-100">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm opacity-80 hover:opacity-100">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm opacity-80 hover:opacity-100">
                    API
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm opacity-80 hover:opacity-100">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 text-center">
            <p className="text-sm opacity-60">© 2025 Mizan. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

