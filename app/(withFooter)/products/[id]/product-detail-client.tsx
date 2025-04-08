"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Check, ChevronRight, ShoppingCart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import useCart from "@/lib/useCart"
import Navbar from "@/components/Navbar"
import { Products } from "@prisma/client"

export default function ProductDetailClient({ product, relatedProducts }: { product: Products; relatedProducts: Products[] }) {
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCart()

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      imagesrc: product.image,
    })

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center mb-8">
          <Link href="/products">
            <Button variant="ghost" size="sm" className="text-[#3A3A3A]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
          </Link>
          <div className="flex items-center">
            <span className="text-[#3A3A3A]/50 ml-1 mr-2">/</span>
            <span className="text-[#550C18] font-medium">{product.name}</span>
          </div>
        </div>

        {/* Product Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Product Image */}
          <div className="bg-[#550C18]/5 rounded-xl overflow-hidden">
            <div className="relative h-[400px] w-full">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-contain p-8"
                priority
              />
            </div>
            {product.popular && (
              <div className="absolute top-4 right-4 bg-[#550C18] text-white py-1 px-3 text-xs font-medium rounded-full">
                Popular
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-[#550C18]/10 text-[#550C18] hover:bg-[#550C18]/20">{product.category}</Badge>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-xs text-[#3A3A3A]/70 ml-2">(24 reviews)</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#550C18] mb-2">{product.name}</h1>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold text-[#3A3A3A]">${product.price}</span>
                <span className="text-[#3A3A3A]/70">/month</span>
              </div>
              <p className="text-[#3A3A3A] mb-6">{product.description}</p>
            </div>

            <Separator className="my-6" />

            {/* Features */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[#3A3A3A] mb-4">Key Features</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-[#550C18] shrink-0 mt-0.5" />
                    <span className="text-[#3A3A3A]">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Separator className="my-6" />

            {/* Add to Cart */}
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-l-md rounded-r-none border-[#550C18]/20"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <span className="text-lg">-</span>
                  </Button>
                  <div className="h-10 w-16 flex items-center justify-center border-y border-[#550C18]/20">
                    <span className="text-[#3A3A3A] font-medium">{quantity}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-r-md rounded-l-none border-[#550C18]/20"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <span className="text-lg">+</span>
                  </Button>
                </div>
                <Button className="bg-[#550C18] hover:bg-[#78001A] text-white flex-1" onClick={handleAddToCart}>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
              </div>
              <Link href="/checkout/subscription">
                <Button className="w-full bg-white border border-[#550C18] text-[#550C18] hover:bg-[#550C18]/5">
                  Subscribe Monthly
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Additional Info */}
            <div className="bg-[#550C18]/5 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-[#3A3A3A]">
                <Check className="h-5 w-5 text-[#550C18]" />
                <span>Free updates and support</span>
              </div>
              <div className="flex items-center gap-2 text-[#3A3A3A] mt-2">
                <Check className="h-5 w-5 text-[#550C18]" />
                <span>30-day money-back guarantee</span>
              </div>
              <div className="flex items-center gap-2 text-[#3A3A3A] mt-2">
                <Check className="h-5 w-5 text-[#550C18]" />
                <span>Secure payment processing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mb-16">
          <Tabs defaultValue="details">
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0">
              <TabsTrigger
                value="details"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#550C18] data-[state=active]:text-[#550C18] bg-transparent px-4 py-3 text-[#3A3A3A]"
              >
                Product Details
              </TabsTrigger>
              <TabsTrigger
                value="specifications"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#550C18] data-[state=active]:text-[#550C18] bg-transparent px-4 py-3 text-[#3A3A3A]"
              >
                Specifications
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#550C18] data-[state=active]:text-[#550C18] bg-transparent px-4 py-3 text-[#3A3A3A]"
              >
                Reviews
              </TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-[#550C18] mb-4">Product Overview</h3>
                  <p className="text-[#3A3A3A] mb-4">
                    {product.description} Our solution is designed specifically for mosques and Islamic centers to
                    streamline operations and enhance community engagement.
                  </p>
                  <p className="text-[#3A3A3A] mb-4">
                    With {product.name}, you'll have access to a comprehensive set of tools that make managing your
                    masjid easier than ever before. From prayer time displays to donation management, we've got you
                    covered.
                  </p>
                  <p className="text-[#3A3A3A]">
                    Our platform is cloud-based, meaning you can access it from anywhere, on any device. Updates are
                    automatic, so you'll always have the latest features and security enhancements.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#550C18] mb-4">Why Choose {product.name}?</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-[#550C18] shrink-0 mt-0.5" />
                      <span className="text-[#3A3A3A]">
                        <span className="font-medium">Easy to use:</span> Intuitive interface designed for mosque
                        administrators of all technical levels.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-[#550C18] shrink-0 mt-0.5" />
                      <span className="text-[#3A3A3A]">
                        <span className="font-medium">Customizable:</span> Tailor the platform to meet your specific
                        needs and preferences.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-[#550C18] shrink-0 mt-0.5" />
                      <span className="text-[#3A3A3A]">
                        <span className="font-medium">Reliable:</span> 99.9% uptime guarantee ensures your services are
                        always available.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-[#550C18] shrink-0 mt-0.5" />
                      <span className="text-[#3A3A3A]">
                        <span className="font-medium">Secure:</span> Enterprise-grade security protects your data and
                        your community's information.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-[#550C18] shrink-0 mt-0.5" />
                      <span className="text-[#3A3A3A]">
                        <span className="font-medium">Supported:</span> Dedicated customer support team available to
                        help whenever you need it.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="specifications" className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-[#550C18] mb-4">Technical Specifications</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 border-b border-[#550C18]/10 pb-2">
                      <span className="font-medium text-[#3A3A3A]">Platform</span>
                      <span className="text-[#3A3A3A]">Cloud-based, Web Application</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-b border-[#550C18]/10 pb-2">
                      <span className="font-medium text-[#3A3A3A]">Compatibility</span>
                      <span className="text-[#3A3A3A]">All modern browsers, iOS, Android</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-b border-[#550C18]/10 pb-2">
                      <span className="font-medium text-[#3A3A3A]">Updates</span>
                      <span className="text-[#3A3A3A]">Automatic, Monthly</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-b border-[#550C18]/10 pb-2">
                      <span className="font-medium text-[#3A3A3A]">Data Storage</span>
                      <span className="text-[#3A3A3A]">Secure Cloud Storage</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-b border-[#550C18]/10 pb-2">
                      <span className="font-medium text-[#3A3A3A]">API Access</span>
                      <span className="text-[#3A3A3A]">RESTful API (Premium Plans)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-b border-[#550C18]/10 pb-2">
                      <span className="font-medium text-[#3A3A3A]">Security</span>
                      <span className="text-[#3A3A3A]">SSL Encryption, Two-Factor Authentication</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#550C18] mb-4">System Requirements</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 border-b border-[#550C18]/10 pb-2">
                      <span className="font-medium text-[#3A3A3A]">Web Browser</span>
                      <span className="text-[#3A3A3A]">Chrome, Firefox, Safari, Edge (latest versions)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-b border-[#550C18]/10 pb-2">
                      <span className="font-medium text-[#3A3A3A]">Internet Connection</span>
                      <span className="text-[#3A3A3A]">Broadband (1Mbps or faster)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-b border-[#550C18]/10 pb-2">
                      <span className="font-medium text-[#3A3A3A]">Mobile App</span>
                      <span className="text-[#3A3A3A]">iOS 13+ or Android 8+</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-b border-[#550C18]/10 pb-2">
                      <span className="font-medium text-[#3A3A3A]">Display Devices</span>
                      <span className="text-[#3A3A3A]">Any HDMI-compatible display</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-b border-[#550C18]/10 pb-2">
                      <span className="font-medium text-[#3A3A3A]">Payment Processing</span>
                      <span className="text-[#3A3A3A]">Stripe, PayPal integration</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="pt-6">
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-lg font-medium text-[#3A3A3A]">4.9 out of 5</span>
                </div>
                <p className="text-[#3A3A3A]">Based on 24 reviews</p>
              </div>

              <div className="space-y-6">
                {/* Sample reviews - in a real app, these would be fetched from the API */}
                <Card className="border-[#550C18]/10">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-12 w-12 rounded-full bg-[#550C18]/10 flex items-center justify-center">
                        <span className="text-[#550C18] font-bold">AH</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-[#3A3A3A]">Ahmed Hassan</h4>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                          <span className="text-xs text-[#3A3A3A]/70 ml-2">2 months ago</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-[#3A3A3A]">
                      This product has transformed how we manage our masjid. The interface is intuitive and the features
                      are exactly what we needed. Highly recommended!
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-[#550C18]/10">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-12 w-12 rounded-full bg-[#550C18]/10 flex items-center justify-center">
                        <span className="text-[#550C18] font-bold">SA</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-[#3A3A3A]">Sarah Ali</h4>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star, index) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                index < 4 ? "fill-yellow-400 text-yellow-400" : "fill-none text-gray-300"
                              }`}
                            />
                          ))}
                          <span className="text-xs text-[#3A3A3A]/70 ml-2">1 month ago</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-[#3A3A3A]">
                      Great product overall. The only reason I'm giving it 4 stars is because I'd like to see more
                      customization options. The customer support team has been very responsive though.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-[#550C18]/10">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-12 w-12 rounded-full bg-[#550C18]/10 flex items-center justify-center">
                        <span className="text-[#550C18] font-bold">MK</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-[#3A3A3A]">Mohammed Khan</h4>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                          <span className="text-xs text-[#3A3A3A]/70 ml-2">3 weeks ago</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-[#3A3A3A]">
                      We've been using this for our masjid for the past month and it has exceeded our expectations. The
                      setup was easy and the features are comprehensive. Worth every penny!
                    </p>
                  </CardContent>
                </Card>

                <div className="text-center">
                  <Button variant="outline" className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5">
                    Load More Reviews
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        <div>
          <h2 className="text-2xl font-bold text-[#550C18] mb-6">Related Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <Card key={relatedProduct.id} className="bg-white border-[#550C18]/10 hover:shadow-md transition-shadow">
                <div className="h-[200px] overflow-hidden bg-[#550C18]/5">
                  <Image
                    src={relatedProduct.image || "/placeholder.svg"}
                    alt={relatedProduct.name}
                    width={300}
                    height={200}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <Badge className="mb-2 bg-[#550C18]/10 text-[#550C18] hover:bg-[#550C18]/20">
                        {relatedProduct.category}
                      </Badge>
                      <h3 className="text-xl font-semibold text-[#3A3A3A]">{relatedProduct.name}</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold text-[#550C18]">${relatedProduct.price}</span>
                      <span className="text-xs text-[#3A3A3A]/70">/month</span>
                    </div>
                  </div>
                  <p className="text-sm text-[#3A3A3A]/70 mb-4 line-clamp-2">{relatedProduct.description}</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5 flex-1"
                      asChild
                    >
                      <Link href={`/products/${relatedProduct.id}`}>View Details</Link>
                    </Button>
                    <Button
                      className="bg-[#550C18] hover:bg-[#78001A] text-white"
                      onClick={() => {
                        addToCart({
                          id: relatedProduct.id,
                          productId: relatedProduct.id,
                          name: relatedProduct.name,
                          price: relatedProduct.price,
                          quantity: 1,
                          imagesrc: relatedProduct.image,
                        })
                        toast({
                          title: "Added to cart",
                          description: `${relatedProduct.name} has been added to your cart.`,
                        })
                      }}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
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
