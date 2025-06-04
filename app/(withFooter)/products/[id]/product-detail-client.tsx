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
            <div className="relative h-full w-full overflow-hidden">
              <Image
                src={product.image || "/placeholder.svg"} 
                alt={product.name}
                fill
                className="w-full h-full object-center rounded-xl z-0"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                quality={90}
              />
            </div>
            {product.popular && (
              <div className="absolute top-4 right-4 bg-[#550C18] text-white py-1 px-3 text-xs font-medium rounded-full z-10">
                Popular
              </div>
            )}

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
              <div className="flex items-baseline mb-4">
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
    </div>
  )
}
