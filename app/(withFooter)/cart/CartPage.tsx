"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  ShoppingCart,
  Trash2,
  X,
  CreditCard,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Navbar from "@/components/Navbar";
// import { withSSR, useCart } from "cart"
import { Products } from "@prisma/client";
import useCart from "@/lib/useCart";
import { v4 as uuid } from "uuid";
import { createCheckoutPage } from "@/lib/actions/payment";
import { redirect, useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";

// Product type definition
type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  image: string;
  category: string;
  popular?: boolean;
};

// Cart item type definition
type CartItem = {
  product: Product;
  quantity: number;
};

type Props = {
  products: Products[];
};

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CartPage({ products }: Props) {
  const {
    addToCart,
    cart,
    clearCart,
    getTotal,
    removeFromCart: removeFCart,
    setDiscount: setDiscountStore,
    discount: discountData
  } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Calculate subtotal
  const subtotal =
    cart.reduce((total, item) => total + item.price! * item.quantity, 0) || 0;

  // Calculate discount amount
  const discountAmount = promoApplied ? subtotal * (discount / 100) : 0;

  // Calculate total
  const total = subtotal - discountAmount;

  // Update product quantity in cart
  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
  };

  // Remove product from cart
  const removeFromCart = (itemId: string) => {
    removeFCart(itemId);

    toast({
      title: "Removed from cart",
      description: "Item has been removed from your cart.",
      variant: "destructive",
    });
  };

  // Apply promo code
  const applyPromoCode = () => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (promoCode.toLowerCase() === "mizan25") {
        setDiscount(25);
        setPromoApplied(true);
        setDiscountStore({
          code: promoCode,
          id: uuid(),
          percent: 25
        });
        toast({
          title: "Promo code applied",
          description: "25% discount has been applied to your order.",
        });
      } else if (promoCode.toLowerCase() === "mizan10") {
        setDiscount(10);
        setPromoApplied(true);
        setDiscountStore({
          code: promoCode,
          id: uuid(),
          percent: 10
        });
        toast({
          title: "Promo code applied",
          description: "10% discount has been applied to your order.",
        });
      } else {
        toast({
          title: "Invalid promo code",
          description: "Please enter a valid promo code.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  // Remove promo code
  const removePromoCode = () => {
    setPromoCode("");
    setPromoApplied(false);
    setDiscount(0);

    toast({
      title: "Promo code removed",
      description: "Discount has been removed from your order.",
    });
  };

  async function proceedCheckout() {
    const stripe = await stripePromise;
    if(!stripe) return;
    setLoading(true);
    const session = await createCheckoutPage({
      cart,
      discount: discountData,
    });
  
    if(!session) return;

    if(session.redirect) return router.push("/checkout");

    if(session.error) {
      setLoading(false);
      toast({
        title: "Error proceeding to checkout",
        description: session.message,
        variant: "destructive",
      });
      return;
    }

    await stripe.redirectToCheckout({
      sessionId: session.id!
    })
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

        <h2 className="text-3xl font-bold text-[#550C18] mb-8">
          Your Shopping Cart
        </h2>

        {cart.length! > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="bg-white border-[#550C18]/10">
                <CardHeader className="border-b border-[#550C18]/10">
                  <CardTitle className="text-xl font-semibold text-[#3A3A3A]">
                    Cart Items
                  </CardTitle>
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
                      {cart.map((item) => (
                        <TableRow
                          key={item.productId}
                          className="hover:bg-[#550C18]/5"
                        >
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
                              <h1 className="font-medium text-lg text-[#3A3A3A]">
                                {item.name}
                              </h1>
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
                              onClick={() => removeFromCart(item.id as string)}
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
                  <CardTitle className="text-xl font-semibold text-[#3A3A3A]">
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-[#3A3A3A]">Subtotal</span>
                      <span className="font-medium">
                        ${subtotal.toFixed(2)}
                      </span>
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
                      <span className="text-[#550C18]">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 border-t border-[#550C18]/10 pt-6">
                  <Button
                    className="w-full bg-[#550C18] hover:bg-[#78001A] text-white"
                    onClick={() => proceedCheckout()}
                    disabled={loading}
                  >
                    Proceed to Checkout
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                  <p className="text-xs text-[#3A3A3A]/70 text-center">
                    By proceeding to checkout, you agree to our{" "}
                    <Link
                      href="/terms"
                      className="text-[#550C18] hover:underline"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="text-[#550C18] hover:underline"
                    >
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
            <h3 className="text-xl font-semibold text-[#3A3A3A] mb-2">
              Your cart is empty
            </h3>
            <p className="text-[#3A3A3A]/70 mb-6 text-center max-w-md">
              Looks like you haven't added any products to your cart yet.
              Explore our products to find the perfect solution for your masjid.
            </p>
            <Link href="/products">
              <Button className="bg-[#550C18] hover:bg-[#78001A] text-white">
                Browse Products
              </Button>
            </Link>
          </div>
        )}

        <div className="mt-12">
          <h3 className="text-xl font-semibold text-[#550C18] mb-4">
            You might also like
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products
              .filter(
                (product) => !cart.some((item) => item.productId === product.id)
              )
              .slice(0, 3)
              .map((product) => (
               <Card
                  key={product.id}
                  className="bg-white border-[#550C18]/10 hover:shadow-md transition-shadow"
                >
                  <div className="h-[150px] overflow-hidden bg-[#550C18]/5">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-semibold text-[#3A3A3A]">
                        {product.name}
                      </CardTitle>
                      <div className="text-right">
                        <span className="text-lg font-bold text-[#550C18]">
                          ${product.price}
                        </span>
                        <span className="text-xs text-[#3A3A3A]/70">
                          /month
                        </span>
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
                        addToCart({
                          id: uuid(),
                          name: product.name,
                          productId: product.id,
                          quantity: 1,
                          imagesrc: product.image,
                          price: product.price,
                        });

                        toast({
                          title: "Added to cart",
                          description: `${product.name} has been added to your cart.`,
                        });
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
    </div>
  );
}
