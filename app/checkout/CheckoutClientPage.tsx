"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { ArrowLeft, ArrowRight, CheckCircle, CreditCard, Loader2, LockIcon, ShoppingBag, Truck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image"
import { Philosopher } from "next/font/google"
import useCart from "@/lib/useCart"

import { loadStripe } from "@stripe/stripe-js"
import { createPaymentIntent } from "@/lib/actions/payment"
import { Elements, useStripe, useElements, PaymentElement, AddressElement } from "@stripe/react-stripe-js"
import Navbar from "@/components/Navbar"
import { Orders } from "@prisma/client"
import { getPaymentAndOrder } from "@/lib/actions/order"
import { formatDate } from "@/lib/utils"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const philosopher = Philosopher({ weight: "700", subsets: ["latin"] })

// Form schemas
const shippingSchema = z.object({
  fullName: z.string().min(2, { message: "Full name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
  address: z.string().min(5, { message: "Address is required" }),
  city: z.string().min(2, { message: "City is required" }),
  state: z.string().min(2, { message: "State is required" }),
  zipCode: z.string().min(5, { message: "ZIP code is required" }),
  country: z.string().min(2, { message: "Country is required" }),
  saveInfo: z.boolean().default(false).optional(),
})

const paymentSchema = z.object({
  cardholderName: z.string().min(2, { message: "Cardholder name is required" }),
  billingAddress: z.enum(["same", "different"]),
  saveCard: z.boolean().default(false).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
})

type CartItems = {
  id: string
  name: string
  price: number
  quantity: number
  imagesrc: string
  productId: string
}

type ShippingFormValues = z.infer<typeof shippingSchema>
type PaymentFormValues = z.infer<typeof paymentSchema>

function CheckoutForm() {
  const router = useRouter()
  const [step, setStep] = useState<"shipping" | "payment" | "confirmation">("shipping")
  const [isProcessing, setIsProcessing] = useState(false)
  const [shippingData, setShippingData] = useState<ShippingFormValues | null>(null)
  const [cartItems, setCartItems] = useState<CartItems[]>([])
  const [subtotal, setSubtotal] = useState(0)
  const { cart, clearCart, getTotal, discount } = useCart()
  const [orderData, setOrderData] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState<string>("")
  const [paymentIntentId, setPaymentId] = useState<string>("")

  useEffect(() => {
    // @ts-ignore
    setCartItems(cart)
    setSubtotal(cart.reduce((total, item) => total + item.price! * item.quantity, 0) || 0)
  }, [cart, getTotal])

  useEffect(() => {
    // Create a PaymentIntent as soon as the page loads if we're on the payment step
    if (step === "payment" && !clientSecret && cart.length > 0) {
      const fetchPaymentIntent = async () => {
        try {
          const { clientSecret, id } = await createPaymentIntent({
            amount: total,
            cart,
            discount,
          })

          setClientSecret(clientSecret!)
          setPaymentId(id!)
        } catch (error) {
          console.error("Error creating payment intent:", error)
          toast({
            title: "Error",
            description: "There was a problem setting up your payment. Please try again.",
            variant: "destructive",
          })
        }
      }

      fetchPaymentIntent()
    } else if(step === "confirmation" && paymentIntentId) {
      const fetchOrderDetails = async () => {
        const details = await getPaymentAndOrder(paymentIntentId);
        if(!details) return;
        setOrderData(details)
        console.log(details);
      };
      setTimeout(() => {
        router.push(`/order-confirmation?session_id=${paymentIntentId}`);
      }, 500)
    }
  }, [step, cart, discount])

  const shipping = 0 // Free shipping
  const tax = subtotal * 0.07 // 7% tax
  const total = subtotal + shipping + tax

  // Shipping form
  const shippingForm = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "US",
      saveInfo: false,
    },
  })

  // Payment form
  const paymentForm = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardholderName: "",
      billingAddress: "same",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "US",
      saveCard: false,
    },
  })

  // Handle shipping form submission
  function onShippingSubmit(data: ShippingFormValues) {
    setShippingData(data)
    setStep("payment")

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" })
  }



  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center mb-8">
          <Link href="/cart">
            <Button variant="ghost" size="sm" className="text-[#3A3A3A]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Cart
            </Button>
          </Link>
          <div className="flex items-center">
            <span className="text-[#3A3A3A]/50 ml-1 mr-2">/</span>
            <span className="text-[#550C18] font-medium">Checkout</span>
          </div>
        </div>

        {/* Checkout Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center max-w-3xl mx-auto">
            <div className="flex flex-col items-center">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  step === "shipping" ? "bg-[#550C18] text-white" : "bg-[#550C18] text-white"
                }`}
              >
                <Truck className="h-5 w-5" />
              </div>
              <span className={`text-sm mt-2 ${step === "shipping" ? "text-[#550C18] font-medium" : "text-[#550C18]"}`}>
                Shipping
              </span>
            </div>
            <div className={`h-1 w-16 md:w-32 ${step === "shipping" ? "bg-[#550C18]/30" : "bg-[#550C18]"}`} />
            <div className="flex flex-col items-center">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  step === "payment"
                    ? "bg-[#550C18] text-white"
                    : step === "confirmation"
                      ? "bg-[#550C18] text-white"
                      : "bg-[#550C18]/30 text-white"
                }`}
              >
                <CreditCard className="h-5 w-5" />
              </div>
              <span
                className={`text-sm mt-2 ${
                  step === "payment"
                    ? "text-[#550C18] font-medium"
                    : step === "confirmation"
                      ? "text-[#550C18]"
                      : "text-[#3A3A3A]/50"
                }`}
              >
                Payment
              </span>
            </div>
            <div className={`h-1 w-16 md:w-32 ${step === "confirmation" ? "bg-[#550C18]" : "bg-[#550C18]/30"}`} />
            <div className="flex flex-col items-center">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  step === "confirmation" ? "bg-[#550C18] text-white" : "bg-[#550C18]/30 text-white"
                }`}
              >
                <CheckCircle className="h-5 w-5" />
              </div>
              <span
                className={`text-sm mt-2 ${
                  step === "confirmation" ? "text-[#550C18] font-medium" : "text-[#3A3A3A]/50"
                }`}
              >
                Confirmation
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === "shipping" && (
              <Card className="bg-white border-[#550C18]/10">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold text-[#550C18]">Shipping Information</CardTitle>
                  <CardDescription>Please enter your shipping details</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...shippingForm}>
                    <form onSubmit={shippingForm.handleSubmit(onShippingSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={shippingForm.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} className="border-[#550C18]/20" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={shippingForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input placeholder="john.doe@example.com" {...field} className="border-[#550C18]/20" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={shippingForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="(123) 456-7890" {...field} className="border-[#550C18]/20" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={shippingForm.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <Input placeholder="123 Main St" {...field} className="border-[#550C18]/20" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={shippingForm.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="New York" {...field} className="border-[#550C18]/20" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={shippingForm.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State / Province</FormLabel>
                              <FormControl>
                                <Input placeholder="NY" {...field} className="border-[#550C18]/20" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={shippingForm.control}
                          name="zipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ZIP / Postal Code</FormLabel>
                              <FormControl>
                                <Input placeholder="10001" {...field} className="border-[#550C18]/20" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={shippingForm.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="border-[#550C18]/20">
                                    <SelectValue placeholder="Select a country" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="US">United States</SelectItem>
                                  <SelectItem value="CA">Canada</SelectItem>
                                  <SelectItem value="UK">United Kingdom</SelectItem>
                                  <SelectItem value="AU">Australia</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={shippingForm.control}
                        name="saveInfo"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-[#550C18] data-[state=checked]:border-[#550C18]"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-normal">Save this information for next time</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end">
                        <Button type="submit" className="bg-[#550C18] hover:bg-[#78001A] text-white">
                          Continue to Payment
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}

            {step === "payment" && clientSecret && (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: "stripe",
                    variables: {
                      colorPrimary: "#550C18",
                      colorBackground: "#ffffff",
                      colorText: "#3A3A3A",
                      colorDanger: "#df1b41",
                      fontFamily: "Poppins, system-ui, sans-serif",
                      spacingUnit: "4px",
                      borderRadius: "4px",
                    },
                  },
                }}
              >
                <PaymentForm
                  shippingData={shippingData}
                  onBack={() => setStep("shipping")}
                  onSuccess={() => setStep("confirmation")}
                  paymentForm={paymentForm}
                />
              </Elements>
            )}

            {step === "confirmation" && (
              <div className="min-h-full flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full border-y border-[#550C18] animate-spin"></div>
                </div>
              </div>
            )}

            {/* {step === "confirmation" && orderData && ( */}
            {/*   <Card className="bg-white border-[#550C18]/10"> */}
            {/*     <CardHeader className="text-center"> */}
            {/*       <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center"> */}
            {/*         <CheckCircle className="h-10 w-10 text-green-600" /> */}
            {/*       </div> */}
            {/*       <CardTitle className="text-2xl font-semibold text-[#550C18]">Order Confirmed!</CardTitle> */}
            {/*       <CardDescription>Thank you for your purchase</CardDescription> */}
            {/*     </CardHeader> */}
            {/*     <CardContent className="text-center"> */}
            {/*       <p className="text-[#3A3A3A] mb-6"> */}
            {/*         Your order has been placed and is being processed. You will receive an email confirmation shortly. */}
            {/*       </p> */}
            {/*       <div className="bg-[#550C18]/5 p-4 rounded-lg mb-6"> */}
            {/*         <h3 className="font-medium text-[#3A3A3A] mb-2 text-xl">Order Details</h3> */}
            {/*         <p className="text-sm text-[#3A3A3A]/70 mb-1"> */}
            {/*           Order Number: #{orderData.order.id} */}
            {/*         </p> */}
            {/*         <p className="text-sm text-[#3A3A3A]/70">Order Date: {formatDate(orderData.order.created)}</p> */}
            {/*       </div> */}
            {/*       <div className="space-y-4"> */}
            {/*         <Button */}
            {/*           className="bg-[#550C18] hover:bg-[#78001A] text-white w-full" */}
            {/*           onClick={() => router.push("/dashboard")} */}
            {/*         > */}
            {/*           Go to Dashboard */}
            {/*         </Button> */}
            {/*         <Button */}
            {/*           variant="outline" */}
            {/*           className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5 w-full" */}
            {/*           onClick={() => router.push("/")} */}
            {/*         > */}
            {/*           Continue Shopping */}
            {/*         </Button> */}
            {/*       </div> */}
            {/*     </CardContent> */}
            {/*   </Card> */}
            {/* )} */}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-white border-[#550C18]/10 sticky top-4">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-[#3A3A3A]">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {cartItems.map((item) => (
                    <div key={item.productId} className="flex justify-between py-2">
                      <div className="flex items-start gap-2">
                        <div className="h-10 w-10 rounded-md bg-[#550C18]/10 flex items-center justify-center">
                          <ShoppingBag className="h-5 w-5 text-[#550C18]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#3A3A3A]">{item.name}</p>
                          <p className="text-xs text-[#3A3A3A]/70">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-[#3A3A3A]">${(item.price! * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-[#3A3A3A]">Subtotal</span>
                    <span className="text-sm font-medium text-[#3A3A3A]">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#3A3A3A]">Shipping</span>
                    <span className="text-sm font-medium text-[#3A3A3A]">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#3A3A3A]">Tax (7%)</span>
                    <span className="text-sm font-medium text-[#3A3A3A]">${tax.toFixed(2)}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between">
                  <span className="text-base font-medium text-[#3A3A3A]">Total</span>
                  <span className="text-lg font-bold text-[#550C18]">${total.toFixed(2)}</span>
                </div>

                <div className="mt-6 pt-4 border-t border-[#550C18]/10">
                  <div className="flex items-center gap-2 text-sm text-[#3A3A3A]/70 mb-4">
                    <LockIcon className="h-4 w-4" />
                    <span>Secure checkout powered by Stripe</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-12 bg-[#550C18]/5 rounded flex items-center justify-center">
                      <svg className="h-4 w-6" viewBox="0 0 32 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="32" height="21" rx="3" fill="#016FD0" />
                        <path d="M16 15H13V6H16V15Z" fill="white" />
                        <path
                          d="M12.5 10.5C12.5 9.11929 13.1193 7.88071 14.1 7C13.4 6.5 12.5 6 11.5 6C8.8 6 7 8 7 10.5C7 13 8.8 15 11.5 15C12.5 15 13.4 14.5 14.1 14C13.1193 13.1193 12.5 11.8807 12.5 10.5Z"
                          fill="white"
                        />
                        <path
                          d="M25 15H22V14.5C21.3 14.8 20.7 15 20 15C17.8 15 16 13.2 16 10.5C16 7.8 17.8 6 20 6C20.7 6 21.3 6.2 22 6.5V6H25V15ZM22 10.5C22 9.1 21 8 19.75 8C18.5 8 17.5 9.1 17.5 10.5C17.5 11.9 18.5 13 19.75 13C21 13 22 11.9 22 10.5Z"
                          fill="white"
                        />
                      </svg>
                    </div>
                    <div className="h-8 w-12 bg-[#550C18]/5 rounded flex items-center justify-center">
                      <svg className="h-4 w-6" viewBox="0 0 32 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="32" height="21" rx="3" fill="#EB001B" />
                        <circle cx="11" cy="10.5" r="6" fill="#EB001B" />
                        <circle cx="21" cy="10.5" r="6" fill="#F79E1B" />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M16 14.5C17.3333 13.5 18 12 18 10.5C18 9 17.3333 7.5 16 6.5C14.6667 7.5 14 9 14 10.5C14 12 14.6667 13.5 16 14.5Z"
                          fill="#FF5F00"
                        />
                      </svg>
                    </div>
                    <div className="h-8 w-12 bg-[#550C18]/5 rounded flex items-center justify-center">
                      <svg className="h-4 w-6" viewBox="0 0 32 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="32" height="21" rx="3" fill="#4A4A4A" />
                        <path
                          d="M20.5 10.5C20.5 12.9853 18.4853 15 16 15C13.5147 15 11.5 12.9853 11.5 10.5C11.5 8.01472 13.5147 6 16 6C18.4853 6 20.5 8.01472 20.5 10.5Z"
                          fill="#4A4A4A"
                          stroke="white"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// Payment form component that uses Stripe Elements
function PaymentForm({
  shippingData,
  onBack,
  onSuccess,
  paymentForm,
}: {
  shippingData: ShippingFormValues | null
  onBack: () => void
  onSuccess: () => void
  paymentForm: any
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)

    try {
      // Confirm the payment
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation`,
        },
        redirect: "if_required",
      })

      if (error) {
        // Show error to your customer
        setErrorMessage(error.message || "An unexpected error occurred")
      } else {
        // The payment has been processed!
        toast({
          title: "Payment successful",
          description: "Your order has been placed successfully.",
        })
        onSuccess()
      }
    } catch (error) {
      console.error("Error processing payment:", error)
      setErrorMessage("An unexpected error occurred. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="bg-white border-[#550C18]/10">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-[#550C18]">Payment Information</CardTitle>
        <CardDescription>Please enter your payment details</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="rounded-md border border-[#550C18]/10 p-4">
              <h3 className="text-lg font-medium text-[#3A3A3A] mb-4">Payment Method</h3>
              <PaymentElement
                options={{
                  layout: {
                    type: "tabs",
                    defaultCollapsed: false,

                  },
                }}
              />
            </div>

            <div className="rounded-md border border-[#550C18]/10 p-4">
              <h3 className="text-lg font-medium text-[#3A3A3A] mb-4">Billing Address</h3>
              <AddressElement
                options={{
                  mode: "billing",
                  fields: {
                    phone: "always",
                  },
                  validation: {
                    phone: {
                      required: "always",
                    },
                  },
                  defaultValues: {
                    name: shippingData?.fullName,
                    address: {
                      line1: shippingData?.address,
                      city: shippingData?.city,
                      state: shippingData?.state,
                      postal_code: shippingData?.zipCode,
                      country: shippingData?.country!,
                    },
                    phone: shippingData?.phone,
                  },
                }}
              />
            </div>
          </div>

          {errorMessage && (
            <div className="text-red-500 text-sm p-3 bg-red-50 rounded-md border border-red-200">{errorMessage}</div>
          )}

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
              onClick={onBack}
              disabled={isProcessing}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Shipping
            </Button>
            <Button
              type="submit"
              className="bg-[#550C18] hover:bg-[#78001A] text-white"
              disabled={isProcessing || !stripe || !elements}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Complete Order"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default function CheckoutClientPage() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  )
}

