"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, ChevronRight, ShoppingCart, Trash2, X, CreditCard, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Navbar from "@/components/Navbar"
import { withSSR, useCart } from "cart"
import { Products } from "@prisma/client"

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

type Props = {
  products: Products[];
}

export default function CartPage({ products }: Props) {
  const cart = withSSR(useCart, (state) => state)
  const [promoCode, setPromoCode] = useState("")
  const [promoApplied, setPromoApplied] = useState(false)
  const [discount, setDiscount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // Calculate subtotal
  const subtotal = cart?.cartItems!.reduce((total, item) => total + item.price! * item.quantity, 0) || 0

  // Calculate discount amount
  const discountAmount = promoApplied ? subtotal * (discount / 100) : 0

  // Calculate total
  const total = subtotal - discountAmount

  // Update product quantity in cart
  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId)
      return
    }

    
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

  // Apply promo code
  const applyPromoCode = () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      if (promoCode.toLowerCase() === "mizan25") {
        setDiscount(25)
        setPromoApplied(true)
        toast({
          title: "Promo code applied",
          description: "25% discount has been applied to your order.",
        })
      } else if (promoCode.toLowerCase() === "mizan10") {
        setDiscount(10)
        setPromoApplied(true)
        toast({
          title: "Promo code applied",
          description: "10% discount has been applied to your order.",
        })
      } else {
        toast({
          title: "Invalid promo code",
          description: "Please enter a valid promo code.",
          variant: "destructive",
        })
      }
      setIsLoading(false)
    }, 1000)
  }

  // Remove promo code
  const removePromoCode = () => {
    setPromoCode("")
    setPromoApplied(false)
    setDiscount(0)

    toast({
      title: "Promo code removed",
      description: "Discount has been removed from your order.",
    })
  }

  async function proceedCheckout() {
  
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-2 mb-8">
          <Link href="/products">
            <Button variant="ghost" size="sm" className="text-[#3A3A3A]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
          </Link>
          <div className="flex items-center">
            <span className="text-[#3A3A3A]/50 mx-2">/</span>
            <span className="text-[#550C18] font-medium">Shopping Cart</span>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-[#550C18] mb-8">Your Shopping Cart</h2>

        {cart?.cartItems!.length! > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="bg-white border-[#550C18]/10">
                <CardHeader className="border-b border-[#550C18]/10">
                  <CardTitle className="text-xl font-semibold text-[#3A3A3A]">Cart Items</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[100px]">Product</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cart?.cartItems!.map((item) => (
                        <TableRow key={item.productId} className="hover:bg-[#550C18]/5">
                          <TableCell className="p-4">
                            <div className="h-16 w-16 rounded-md overflow-hidden bg-[#550C18]/5">
                              <img
                                src={item.imagesrc || "/placeholder.svg"}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <h1 className="font-medium text-lg text-[#3A3A3A]">{item.name}</h1>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium text-[#550C18]">
                            ${item.price!.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 p-0 text-[#3A3A3A]/50 hover:text-[#550C18]"
                              onClick={() => removeFromCart(item.productId as string)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Remove</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter className="flex justify-between border-t border-[#550C18]/10 p-4">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Promo code"
                      className="w-[200px] border-[#550C18]/20"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      disabled={promoApplied || isLoading}
                    />
                    {promoApplied ? (
                      <Button
                        variant="outline"
                        className="border-[#550C18]/20 text-[#550C18]"
                        onClick={removePromoCode}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="border-[#550C18]/20 text-[#550C18]"
                        onClick={applyPromoCode}
                        disabled={!promoCode || isLoading}
                      >
                        {isLoading ? "Applying..." : "Apply"}
                      </Button>
                    )}
                  </div>
                  <div className="text-sm text-[#3A3A3A]/70">
                    {promoApplied && (
                      <div className="flex items-center text-green-600">
                        <Check className="mr-1 h-4 w-4" />
                        {discount}% discount applied
                      </div>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="bg-white border-[#550C18]/10 sticky top-4">
                <CardHeader className="border-b border-[#550C18]/10">
                  <CardTitle className="text-xl font-semibold text-[#3A3A3A]">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-[#3A3A3A]">Subtotal</span>
                      <span className="font-medium">${subtotal.toFixed(2)}</span>
                    </div>
                    {promoApplied && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({discount}%)</span>
                        <span>-${discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <Separator className="my-2" />
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-[#3A3A3A]">Total</span>
                      <span className="text-[#550C18]">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 border-t border-[#550C18]/10 pt-6">
                  <Button className="w-full bg-[#550C18] hover:bg-[#78001A] text-white" asChild>
                    <Link href="/checkout">
                      Proceed to Checkout
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <p className="text-xs text-[#3A3A3A]/70 text-center">
                    By proceeding to checkout, you agree to our{" "}
                    <Link href="/terms" className="text-[#550C18] hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-[#550C18] hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </CardFooter>
              </Card>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-[#550C18]/10">
            <ShoppingCart className="h-16 w-16 text-[#550C18]/20 mb-4" />
            <h3 className="text-xl font-semibold text-[#3A3A3A] mb-2">Your cart is empty</h3>
            <p className="text-[#3A3A3A]/70 mb-6 text-center max-w-md">
              Looks like you haven't added any products to your cart yet. Explore our products to find the perfect
              solution for your masjid.
            </p>
            <Link href="/products">
              <Button className="bg-[#550C18] hover:bg-[#78001A] text-white">Browse Products</Button>
            </Link>
          </div>
        )}

        <div className="mt-12">
          <h3 className="text-xl font-semibold text-[#550C18] mb-4">You might also like</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products
              .filter((product) => !cart?.cartItems!.some((item) => item.productId === product.id))
              .slice(0, 3)
              .map((product) => (
                <Card key={product.id} className="bg-white border-[#550C18]/10 hover:shadow-md transition-shadow">
                  <div className="h-[150px] overflow-hidden bg-[#550C18]/5">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-semibold text-[#3A3A3A]">{product.name}</CardTitle>
                      <div className="text-right">
                        <span className="text-lg font-bold text-[#550C18]">${product.price}</span>
                        <span className="text-xs text-[#3A3A3A]/70">/month</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardFooter className="flex justify-between pt-2 border-t border-[#550C18]/10">
                    <Button
                      variant="outline"
                      className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
                      asChild
                    >
                      <Link href={`/products#${product.id}`}>View Details</Link>
                    </Button>
                    <Button
                      className="bg-[#550C18] hover:bg-[#78001A] text-white"
                      onClick={() => {
                        cart?.addToCart!({
                          name: product.name,
                          productId: product.id,
                          quantity: 1,
                          imagesrc: product.image,
                          price: product.price
                        });

                        toast({
                          title: "Added to cart",
                          description: `${product.name} has been added to your cart.`,
                        })
                      }}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                  </CardFooter>
                </Card>
              ))}
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

