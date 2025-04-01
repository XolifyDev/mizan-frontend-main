"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { ArrowLeft, ArrowRight, CheckCircle, CreditCard, Home, Loader2, LockIcon, ShieldCheck, ShoppingBag, Truck, User } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { CartItems } from "cart"
import Image from "next/image"
import { Philosopher } from "next/font/google"
import useCart from "@/lib/useCart"
import { CartItem } from "@/lib/cartItemSchema"

const philosopher = Philosopher({ weight: "700", subsets: ["latin"] });

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
  cardNumber: z.string().min(16, { message: "Please enter a valid card number" }).max(19),
  expiryDate: z.string().min(5, { message: "Please enter a valid expiry date (MM/YY)" }),
  cvv: z.string().min(3, { message: "Please enter a valid CVV" }).max(4),
  billingAddress: z.enum(["same", "different"]),
  saveCard: z.boolean().default(false).optional(),
})

type ShippingFormValues = z.infer<typeof shippingSchema>
type PaymentFormValues = z.infer<typeof paymentSchema>

export default function CheckoutClientPage() {
  const router = useRouter()
  const [step, setStep] = useState<"shipping" | "payment" | "confirmation">("shipping")
  const [isProcessing, setIsProcessing] = useState(false)
  const [shippingData, setShippingData] = useState<ShippingFormValues | null>(null)
  const [cartItems, setCartItems] = useState<CartItems[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const { cart, addToCart, clearCart, getTotal, removeFromCart } = useCart();

  useEffect(() => {
    // @ts-ignore 
    setCartItems(cart);
    setSubtotal(cart.reduce((total, item) => total + item.price! * item.quantity, 0) || 0);
  }, [cart, getTotal])


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
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      billingAddress: "same",
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

  // Handle payment form submission
  async function onPaymentSubmit(data: PaymentFormValues) {
    setIsProcessing(true)

    try {
      // In a real app, you would process the payment with Stripe here
      console.log("Processing payment with data:", data)
      console.log("Shipping information:", shippingData)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Payment successful",
        description: "Your order has been placed successfully.",
      })

      setStep("confirmation")
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (error) {
      toast({
        title: "Payment failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="border-b border-[#550C18]/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/">
              <div className="flex items-center gap-2">
                <Image src="mizan.svg" width={35} height={35} alt="Mizan Logo" />
                <h1
                  className={`md:text-4xl md:block hidden font-bold text-[#550C18] my-0 ${philosopher.className}`}
                >
                  Mizan
                </h1>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-[#3A3A3A]/70 flex items-center">
              <LockIcon className="h-4 w-4 mr-1" /> Secure Checkout
            </div>
          </div>
        </div>
      </header>

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
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${step === "shipping" ? "bg-[#550C18] text-white" : "bg-[#550C18] text-white"}`}>
                <Truck className="h-5 w-5" />
              </div>
              <span className={`text-sm mt-2 ${step === "shipping" ? "text-[#550C18] font-medium" : "text-[#550C18]"}`}>Shipping</span>
            </div>
            <div className={`h-1 w-16 md:w-32 ${step === "shipping" ? "bg-[#550C18]/30" : "bg-[#550C18]"}`} />
            <div className="flex flex-col items-center">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${step === "payment" ? "bg-[#550C18] text-white" : step === "confirmation" ? "bg-[#550C18] text-white" : "bg-[#550C18]/30 text-white"}`}>
                <CreditCard className="h-5 w-5" />
              </div>
              <span className={`text-sm mt-2 ${step === "payment" ? "text-[#550C18] font-medium" : step === "confirmation" ? "text-[#550C18]" : "text-[#3A3A3A]/50"}`}>Payment</span>
            </div>
            <div className={`h-1 w-16 md:w-32 ${step === "confirmation" ? "bg-[#550C18]" : "bg-[#550C18]/30"}`} />
            <div className="flex flex-col items-center">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${step === "confirmation" ? "bg-[#550C18] text-white" : "bg-[#550C18]/30 text-white"}`}>
                <CheckCircle className="h-5 w-5" />
              </div>
              <span className={`text-sm mt-2 ${step === "confirmation" ? "text-[#550C18] font-medium" : "text-[#3A3A3A]/50"}`}>Confirmation</span>
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
                              <FormLabel className="text-sm font-normal">
                                Save this information for next time
                              </FormLabel>
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

            {step === "payment" && (
              <Card className="bg-white border-[#550C18]/10">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold text-[#550C18]">Payment Information</CardTitle>
                  <CardDescription>Please enter your payment details</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...paymentForm}>
                    <form onSubmit={paymentForm.handleSubmit(onPaymentSubmit)} className="space-y-6">
                      <div className="bg-[#550C18]/5 p-4 rounded-lg mb-6 flex items-center gap-3">
                        <ShieldCheck className="h-5 w-5 text-[#550C18]" />
                        <p className="text-sm text-[#3A3A3A]">
                          Your payment information is encrypted and secure. We never store your full card details.
                        </p>
                      </div>

                      <div className="space-y-6">
                        <FormField
                          control={paymentForm.control}
                          name="cardholderName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cardholder Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} className="border-[#550C18]/20" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={paymentForm.control}
                          name="cardNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Card Number</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="4242 4242 4242 4242" 
                                  {...field} 
                                  className="border-[#550C18]/20"
                                  onChange={(e) => {
                                    // Format card number with spaces
                                    const value = e.target.value.replace(/\s/g, '');
                                    const formattedValue = value.replace(/(\d{4})/g, '$1 ').trim();
                                    field.onChange(formattedValue);
                                  }}
                                  maxLength={19}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-6">
                          <FormField
                            control={paymentForm.control}
                            name="expiryDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Expiry Date</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="MM/YY" 
                                    {...field} 
                                    className="border-[#550C18]/20"
                                    onChange={(e) => {
                                      // Format expiry date with slash
                                      const value = e.target.value.replace(/\D/g, '');
                                      if (value.length <= 2) {
                                        field.onChange(value);
                                      } else {
                                        field.onChange(`${value.slice(0, 2)}/${value.slice(2, 4)}`);
                                      }
                                    }}
                                    maxLength={5}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={paymentForm.control}
                            name="cvv"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CVV</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="123" 
                                    {...field} 
                                    className="border-[#550C18]/20"
                                    type="password"
                                    maxLength={4}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={paymentForm.control}
                          name="billingAddress"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel>Billing Address</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-col space-y-1"
                                >
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="same" className="text-[#550C18]" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      Same as shipping address
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="different" className="text-[#550C18]" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      Use a different billing address
                                    </FormLabel>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {paymentForm.watch("billingAddress") === "different" && (
                          <div className="border border-[#550C18]/10 rounded-lg p-4 space-y-4">
                            <h3 className="text-sm font-medium text-[#3A3A3A]">Billing Address</h3>
                            <p className="text-sm text-[#3A3A3A]/70">
                              For demo purposes, we're not collecting a separate billing address. In a real application, you would add fields for the billing address here.
                            </p>
                          </div>
                        )}

                        <FormField
                          control={paymentForm.control}
                          name="saveCard"
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
                                <FormLabel className="text-sm font-normal">
                                  Save this card for future payments
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-between">
                        <Button
                          type="button"
                          variant="outline"
                          className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
                          onClick={() => setStep("shipping")}
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back to Shipping
                        </Button>
                        <Button 
                          type="submit" 
                          className="bg-[#550C18] hover:bg-[#78001A] text-white"
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              Complete Order
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}

            {step === "confirmation" && (
              <Card className="bg-white border-[#550C18]/10">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <CardTitle className="text-2xl font-semibold text-[#550C18]">Order Confirmed!</CardTitle>
                  <CardDescription>Thank you for your purchase</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-[#3A3A3A] mb-6">
                    Your order has been placed and is being processed. You will receive an email confirmation shortly.
                  </p>
                  <div className="bg-[#550C18]/5 p-4 rounded-lg mb-6">
                    <h3 className="font-medium text-[#3A3A3A] mb-2">Order Details</h3>
                    <p className="text-sm text-[#3A3A3A]/70 mb-1">Order Number: #MIZ-{Math.floor(100000 + Math.random() * 900000)}</p>
                    <p className="text-sm text-[#3A3A3A]/70">Order Date: {new Date().toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-4">
                    <Button 
                      className="bg-[#550C18] hover:bg-[#78001A] text-white w-full"
                      onClick={() => router.push("/dashboard")}
                    >
                      Go to Dashboard
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5 w-full"
                      onClick={() => router.push("/")}
                    >
                      Continue Shopping
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
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
                  <span className="text-lg font-bold text-[#550C18]">${total.toFixed(2)}/month</span>
                </div>

                <div className="mt-6 pt-4 border-t border-[#550C18]/10">
                  <div className="flex items-center gap-2 text-sm text-[#3A3A3A]/70 mb-4">
                    <LockIcon className="h-4 w-4" />
                    <span>Secure checkout powered by Stripe</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-12 bg-[#550C18]/5 rounded flex items-center justify-center">
                      <svg className="h-4 w-6" viewBox="0 0 32 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="32" height="21" rx="3" fill="#016FD0"/>
                        <path d="M16 15H13V6H16V15Z" fill="white"/>
                        <path d="M12.5 10.5C12.5 9.11929 13.1193 7.88071 14.1 7C13.4 6.5 12.5 6 11.5 6C8.8 6 7 8 7 10.5C7 13 8.8 15 11.5 15C12.5 15 13.4 14.5 14.1 14C13.1193 13.1193 12.5 11.8807 12.5 10.5Z" fill="white"/>
                        <path d="M25 15H22V14.5C21.3 14.8 20.7 15 20 15C17.8 15 16 13.2 16 10.5C16 7.8 17.8 6 20 6C20.7 6 21.3 6.2 22 6.5V6H25V15ZM22 10.5C22 9.1 21 8 19.75 8C18.5 8 17.5 9.1 17.5 10.5C17.5 11.9 18.5 13 19.75 13C21 13 22 11.9 22 10.5Z" fill="white"/>
                      </svg>
                    </div>
                    <div className="h-8 w-12 bg-[#550C18]/5 rounded flex items-center justify-center">
                      <svg className="h-4 w-6" viewBox="0 0 32 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="32" height="21" rx="3" fill="#EB001B"/>
                        <circle cx="11" cy="10.5" r="6" fill="#EB001B"/>
                        <circle cx="21" cy="10.5" r="6" fill="#F79E1B"/>
                        <path fillRule="evenodd" clipRule="evenodd" d="M16 14.5C17.3333 13.5 18 12 18 10.5C18 9 17.3333 7.5 16 6.5C14.6667 7.5 14 9 14 10.5C14 12 14.6667 13.5 16 14.5Z" fill="#FF5F00"/>
                      </svg>
                    </div>
                    <div className="h-8 w-12 bg-[#550C18]/5 rounded flex items-center justify-center">
                      <svg className="h-4 w-6" viewBox="0 0 32 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="32" height="21" rx="3" fill="#4A4A4A"/>
                        <path d="M20.5 10.5C20.5 12.9853 18.4853 15 16 15C13.5147 15 11.5 12.9853 11.5 10.5C11.5 8.01472 13.5147 6 16 6C18.4853 6 20.5 8.01472 20.5 10.5Z" fill="#4A4A4A" stroke="white"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#3A3A3A] text-white py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="h-8 w-8 rounded-full bg-[#550C18] flex items-center justify-center">
                <span className="text-[#FDF0D5] font-bold text-sm">M</span>
              </div>
              <h3 className="text-lg font-bold my-0">Mizan</h3>
            </div>
            <div className="text-sm opacity-80">© 2025 Mizan. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}

