"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Settings, DollarSign } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const masjidId = searchParams.get("masjidId") || ""

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#550C18]">Products</h2>
          <p className="text-[#3A3A3A]/70">
            Manage and configure your masjid's products and services
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            className="bg-[#550C18] hover:bg-[#78001A] text-white"
            onClick={() => window.location.href = `/dashboard/products/manage?masjidId=${masjidId}`}
          >
            <Settings className="mr-2 h-4 w-4" />
            Manage Products
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* MizanDonations Kiosk Card */}
        <Card className="bg-white border-[#550C18]/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[#550C18]/10">
                <DollarSign className="h-6 w-6 text-[#550C18]" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-[#3A3A3A]">
                  MizanDonations Kiosk
                </CardTitle>
                <CardDescription className="text-[#3A3A3A]/70">
                  Digital donation kiosk for your masjid
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#3A3A3A]/70">Status</span>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#3A3A3A]/70">Last Updated</span>
                <span className="text-sm text-[#3A3A3A]">Just now</span>
              </div>
              <Button 
                className="w-full bg-[#550C18] hover:bg-[#78001A] text-white"
                onClick={() => window.location.href = `/dashboard/products/mizan-donations?masjidId=${masjidId}`}
              >
                Configure Kiosk
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Add New Product Card */}
        <Card className="bg-white border-[#550C18]/10 border-dashed">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[#550C18]/10">
                <Plus className="h-6 w-6 text-[#550C18]" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-[#3A3A3A]">
                  Add New Product
                </CardTitle>
                <CardDescription className="text-[#3A3A3A]/70">
                  Create a new product or service
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
              onClick={() => window.location.href = `/dashboard/products/manage?masjidId=${masjidId}`}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Product
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 