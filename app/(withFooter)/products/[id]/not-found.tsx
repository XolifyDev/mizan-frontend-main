import Link from "next/link"
import { ArrowLeft, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-[#550C18]/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-[#550C18] flex items-center justify-center">
              <span className="text-[#FDF0D5] font-bold text-xl">M</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#550C18] my-0">Mizan</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-[#550C18]/5 rounded-full p-6 mb-6">
            <ShoppingBag className="h-12 w-12 text-[#550C18]" />
          </div>
          <h1 className="text-3xl font-bold text-[#550C18] mb-4">Product Not Found</h1>
          <p className="text-[#3A3A3A] max-w-md mb-8">
            We couldn't find the product you're looking for. It might have been removed or the URL might be incorrect.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="bg-[#550C18] hover:bg-[#78001A] text-white">
              <Link href="/products">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Browse Products
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-[#550C18]/20 text-[#550C18]">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}


