"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, Home, Loader2, ShoppingBag, Download, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Footer from "@/components/Footer"
import Navbar from "@/components/Navbar"
import { StripeCheckoutSession } from "@stripe/stripe-js"
import { getSessionAndOrder } from "@/lib/actions/order"
import { CartItem } from "@/lib/cartItemSchema"

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
}

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [session, setSession] = useState<StripeCheckoutSession | null>(null);
  const [error, setError] = useState<string | null>(null)

  // Get session_id or order_id from URL params
  const sessionId = searchParams.get("session_id")

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setIsLoading(true)
      try {
        const data = await getSessionAndOrder(sessionId || "");
        if(!data.checkoutSession || !data.stripeSession) return setError("We couldn't retrieve your order details. Please contact customer support.");

        console.log(JSON.parse(data.checkoutSession.cart));

        // Mock order data
        const mockOrder: OrderDetails = {
          id: `${data.order ? data.order.id : data.checkoutSession.id}`,
          date: data.order?.createdAt.toISOString()!,
          total: data.stripeSession.amount_total!, // This would come from your database
          items: JSON.parse(data.checkoutSession.cart).map((e: any) => {
            return {
              id: e.productId,
              name: e.name,
              price: e.price,
              quantity: e.quantity
            }
          }),
          paymentMethod: "Credit Card",
        }

        setOrder(mockOrder)
      } catch (err) {
        setError("We couldn't retrieve your order details. Please contact customer support.")
      } finally {
        setIsLoading(false)
      }
    }

    if (sessionId) {
      fetchOrderDetails()
    } else {
      // If no session_id or order_id is provided, show an error
      setIsLoading(false)
      setError("No order information found. Please check your confirmation email for order details.")
    }
  }, [sessionId])

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
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {isLoading ? (
            <div className="h-full w-full">
              <div className="flex flex-col items-center justify-center py-12 mt-[25dvh]">
                <div className="h-12 w-12 rounded-full border-y border-[#550C18] animate-spin mb-4"></div>
                <p className="text-[#3A3A3A]">Retrieving your order information...</p>
              </div>
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
    </div>
  )
}

