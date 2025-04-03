"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, Home, Loader2, ShoppingBag, Download, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

// This would typically come from your database or API
type OrderDetails = {
  id: string
  date: string
  total: number
  items: {
    id: string
    name: string
    price: number
    quantity: number
  }[]
  paymentMethod: string
  status: "success" | "pending" | "failed"
}

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Get session_id or order_id from URL params
  const sessionId = searchParams.get("session_id")
  const orderId = searchParams.get("order_id")

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setIsLoading(true)
      try {
        // In a real app, you would fetch the order details from your API
        // using the session_id or order_id
        // For demo purposes, we'll simulate an API call with a timeout
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Mock order data
        const mockOrder: OrderDetails = {
          id: orderId || `MIZ-${Math.floor(Math.random() * 10000)}`,
          date: new Date().toISOString(),
          total: 177.0, // This would come from your database
          items: [
            {
              id: "tv-display",
              name: "Masjid TV Display",
              price: 49,
              quantity: 1,
            },
            {
              id: "payment-kiosk",
              name: "Payment Kiosk",
              price: 79,
              quantity: 2,
            },
          ],
          paymentMethod: "Credit Card",
          status: "success",
        }

        setOrder(mockOrder)
      } catch (err) {
        console.error("Error fetching order details:", err)
        setError("We couldn't retrieve your order details. Please contact customer support.")
      } finally {
        setIsLoading(false)
      }
    }

    if (sessionId || orderId) {
      fetchOrderDetails()
    } else {
      // If no session_id or order_id is provided, show an error
      setIsLoading(false)
      setError("No order information found. Please check your confirmation email for order details.")
    }
  }, [sessionId, orderId])

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="border-b border-[#550C18]/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-[#550C18] flex items-center justify-center">
              <span className="text-[#FDF0D5] font-bold text-xl">M</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#550C18] my-0">Mizan</h1>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/#features" className="text-[#3A3A3A] hover:text-[#550C18] font-medium transition-colors">
              Features
            </Link>
            <Link href="/products" className="text-[#3A3A3A] hover:text-[#550C18] font-medium transition-colors">
              Products
            </Link>
            <Link href="/#pricing" className="text-[#3A3A3A] hover:text-[#550C18] font-medium transition-colors">
              Pricing
            </Link>
            <Link href="/#contact" className="text-[#3A3A3A] hover:text-[#550C18] font-medium transition-colors">
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/signin" className="hidden md:block">
              <Button
                variant="outline"
                className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5 hover:text-[#550C18]"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button className="bg-[#550C18] hover:bg-[#78001A] text-white">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 text-[#550C18] animate-spin mb-4" />
              <p className="text-[#3A3A3A]">Retrieving your order information...</p>
            </div>
          ) : error ? (
            <Card className="bg-white border-[#550C18]/10">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-[#550C18]">Order Information</CardTitle>
                <CardDescription className="text-[#3A3A3A]">{error}</CardDescription>
              </CardHeader>
              <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5" asChild>
                  <Link href="/products">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Browse Products
                  </Link>
                </Button>
                <Button className="bg-[#550C18] hover:bg-[#78001A] text-white" asChild>
                  <Link href="/dashboard">
                    <Home className="mr-2 h-4 w-4" />
                    Go to Dashboard
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ) : order ? (
            <Card className="bg-white border-[#550C18]/10">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-[#550C18]">Order Confirmed!</CardTitle>
                <CardDescription className="text-[#3A3A3A]">
                  Thank you for your purchase. Your order has been successfully placed.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-md bg-[#550C18]/5 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#3A3A3A]">Order Number</span>
                    <span className="text-sm font-bold text-[#550C18]">#{order.id}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#3A3A3A]">Date</span>
                    <span className="text-sm text-[#3A3A3A]">{formatDate(order.date)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#3A3A3A]">Payment Method</span>
                    <span className="text-sm text-[#3A3A3A]">{order.paymentMethod}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#3A3A3A] mb-3">Order Details</h3>
                  <div className="border border-[#550C18]/10 rounded-md overflow-hidden">
                    <div className="bg-[#550C18]/5 px-4 py-2">
                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-6 text-sm font-medium text-[#3A3A3A]">Product</div>
                        <div className="col-span-2 text-sm font-medium text-[#3A3A3A] text-center">Qty</div>
                        <div className="col-span-2 text-sm font-medium text-[#3A3A3A] text-right">Price</div>
                        <div className="col-span-2 text-sm font-medium text-[#3A3A3A] text-right">Total</div>
                      </div>
                    </div>
                    <div className="divide-y divide-[#550C18]/10">
                      {order.items.map((item) => (
                        <div key={item.id} className="px-4 py-3">
                          <div className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-6">
                              <p className="font-medium text-[#3A3A3A]">{item.name}</p>
                              <p className="text-xs text-[#3A3A3A]/70">Monthly subscription</p>
                            </div>
                            <div className="col-span-2 text-center text-[#3A3A3A]">{item.quantity}</div>
                            <div className="col-span-2 text-right text-[#3A3A3A]">${item.price}/mo</div>
                            <div className="col-span-2 text-right font-medium text-[#550C18]">
                              ${(item.price * item.quantity).toFixed(2)}/mo
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-[#550C18]/5 px-4 py-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-[#3A3A3A]">Total</span>
                        <span className="font-bold text-[#550C18]">${order.total.toFixed(2)}/month</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#3A3A3A] mb-3">What's Next?</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-[#550C18]/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-[#550C18]">1</span>
                      </div>
                      <p className="text-sm text-[#3A3A3A]">
                        You will receive a confirmation email with your order details and receipt.
                      </p>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-[#550C18]/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-[#550C18]">2</span>
                      </div>
                      <p className="text-sm text-[#3A3A3A]">
                        Our team will set up your products and send you access credentials within 24 hours.
                      </p>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-[#550C18]/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-[#550C18]">3</span>
                      </div>
                      <p className="text-sm text-[#3A3A3A]">
                        A customer success representative will contact you to schedule an onboarding session.
                      </p>
                    </li>
                  </ul>
                </div>

                <Separator className="my-6" />

                <div className="flex flex-col gap-4">
                  <h3 className="text-lg font-medium text-[#3A3A3A]">Need Help?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      variant="outline"
                      className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5 h-auto py-3 flex flex-col items-center justify-center gap-2"
                    >
                      <Download className="h-5 w-5" />
                      <span className="text-sm">Download Receipt</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5 h-auto py-3 flex flex-col items-center justify-center gap-2"
                    >
                      <Calendar className="h-5 w-5" />
                      <span className="text-sm">Schedule Onboarding</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5 h-auto py-3 flex flex-col items-center justify-center gap-2"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
                      </svg>
                      <span className="text-sm">Contact Support</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5" asChild>
                  <Link href="/products">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Continue Shopping
                  </Link>
                </Button>
                <Button className="bg-[#550C18] hover:bg-[#78001A] text-white" asChild>
                  <Link href="/dashboard">
                    <Home className="mr-2 h-4 w-4" />
                    Go to Dashboard
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ) : null}
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

