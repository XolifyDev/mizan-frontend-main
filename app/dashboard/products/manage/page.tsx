"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useSearchParams } from "next/navigation"
import { Plus, Settings, DollarSign, Trash, Edit } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useForm, Controller } from "react-hook-form"
import Link from "next/link"
import { getMasjids } from "@/lib/actions/masjids"
import { toast } from "@/hooks/use-toast"

// Add type for product image
interface ProductImage {
  url: string;
  alt: string;
  order: number;
}

// Add a new type for local image preview
interface ProductImagePreview {
  file: File;
  url: string;
  alt: string;
  order: number;
}

export default function ManageProductsPage() {
  const searchParams = useSearchParams()
  const masjidId = searchParams.get("masjidId") || ""
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [selectedKiosk, setSelectedKiosk] = useState(null)
  const [selectedMasjid, setSelectedMasjid] = useState("")

  // Real data states
  const [products, setProducts] = useState<any[]>([])
  const [masjids, setMasjids] = useState<any[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingMasjids, setLoadingMasjids] = useState(true)
  const [error, setError] = useState("")

  // State for product creation form
  const [productDescription, setProductDescription] = useState<string>("")
  const [discountType, setDiscountType] = useState("")
  const [discountValue, setDiscountValue] = useState("")
  const [discountStart, setDiscountStart] = useState("")
  const [discountEnd, setDiscountEnd] = useState("")

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      images: [] as ProductImage[],
      type: "kiosk",
      price: "",
      discountType: "",
      discountValue: "",
      discountStart: "",
      discountEnd: "",
    },
  })

  const { control, register, handleSubmit, setValue, watch, reset } = form
  const productImages = watch("images")
  const [imagePreviews, setImagePreviews] = useState<ProductImagePreview[]>([])

  // Move fetchProducts out of useEffect so it can be called after product creation
  async function fetchProducts() {
    setLoadingProducts(true)
    setError("")
    try {
      const products = await fetch("/api/products/mizan").then(async (res) => await res.json());
      setProducts(products);
    } catch (err) {
      setError("Failed to load products.")
    } finally {
      setLoadingProducts(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [masjidId])


  useEffect(() => {
    async function fetchMasjids() {
      setLoadingMasjids(true)
      setError("")
      try {
        const masjids = await getMasjids();
        setMasjids(masjids);
      } catch (err) {
        setError("Failed to load masjids.")
      } finally {
        setLoadingMasjids(false)
      }
    }
    fetchMasjids()
  }, [])

  // Placeholder for assigning kiosk
  const handleAssign = async () => {
    try {
      if (!selectedKiosk) return toast({ title: "Error", description: "No kiosk selected", variant: "destructive" });
      // TODO: Replace with your real API call
      // await fetch('/api/products/assign-kiosk', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ kioskId: selectedKiosk.id, masjidId: selectedMasjid }),
      // })
      const res = await fetch("/api/products/assign-kiosk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kioskId: selectedKiosk.id, masjidId: selectedMasjid }),
      })
      if (!res.ok) throw new Error("Failed to assign kiosk");
      toast({
        title: "Kiosk Assigned!",
        description: "Kiosk assigned to masjid successfully.",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to assign kiosk.",
        variant: "destructive",
      })
    } finally {
      setAssignDialogOpen(false)
      setSelectedMasjid("")
      setSelectedKiosk(null)
    }
  }

  // Image upload handler for useForm
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setImagePreviews((prev) => [
      ...prev,
      ...files.map((file, i) => ({
        file,
        url: URL.createObjectURL(file),
        alt: "",
        order: prev.length + i,
      })),
    ])
  }

  const onSubmit = async (data: any) => {
    try {
      // Upload images if any
      let uploadedImages: { url: string; alt: string; order: number }[] = []
      if (imagePreviews.length > 0) {
        const formData = new FormData()
        imagePreviews.forEach((img) => formData.append("files", img.file))
        const res = await fetch("/api/uploadthing", {
          method: "POST",
          body: formData,
        })
        if (!res.ok) throw new Error("Failed to upload images")
        const uploaded = await res.json()
        uploadedImages = uploaded.map((img: any, i: number) => ({
          url: img.url,
          alt: imagePreviews[i]?.alt || "",
          order: imagePreviews[i]?.order || i,
        }))
      }
      // Prepare payload
      const payload = {
        ...data,
        price: Number(data.price),
        images: uploadedImages,
      }
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "Failed to create product")
      }
      toast({ title: "Product Created!", description: "Product created successfully." })
      setIsCreateDialogOpen(false)
      reset()
      setImagePreviews([])
      fetchProducts()
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to create product", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#550C18]">Manage Products</h2>
          <p className="text-[#3A3A3A]/70">
            Create and manage your masjid's products and services
          </p>
        </div>
        <Link href="/dashboard/products/create">
          <Button className="bg-[#550C18] hover:bg-[#78001A] text-white">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      {error && <div className="text-red-500">{error}</div>}
      {loadingProducts ? (
        <div className="text-center text-[#550C18] py-8">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="text-center text-[#3A3A3A]/70 py-8">No products found.</div>
      ) : (
        <div className="grid gap-6">
          {products.map((product) => (
            <Card key={product.id} className="bg-white border-[#550C18]/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-[#550C18]/10">
                      <DollarSign className="h-6 w-6 text-[#550C18]" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold text-[#3A3A3A]">
                        {product.name}
                      </CardTitle>
                      <CardDescription className="text-[#3A3A3A]/70">
                        {product.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/products/edit/${product.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                    </Link>
                    <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                    {product.type === "kiosk" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-2 border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
                        onClick={() => {
                          setSelectedKiosk(product)
                          setAssignDialogOpen(true)
                        }}
                      >
                        Assign Kiosk
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1">
                    <p className="text-sm text-[#3A3A3A]/70">Type</p>
                    <p className="font-medium text-[#3A3A3A] capitalize">{product.type}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-[#3A3A3A]/70">Status</p>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 capitalize">
                      {product.status}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-[#3A3A3A]/70">Price</p>
                    <p className="font-medium text-[#3A3A3A]">
                      {product.price === 0 ? "Free" : `${product.price}`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Kiosk to Masjid</DialogTitle>
            <DialogDescription>
              Select a masjid to assign this kiosk to.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Label>Masjid</Label>
            {loadingMasjids ? (
              <div className="text-[#550C18]">Loading masjids...</div>
            ) : masjids.length === 0 ? (
              <div className="text-[#3A3A3A]/70">No masjids found.</div>
            ) : (
              <Select value={selectedMasjid} onValueChange={setSelectedMasjid}>
                <SelectTrigger>
                  <SelectValue placeholder="Select masjid" />
                </SelectTrigger>
                <SelectContent>
                  {masjids.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#550C18] hover:bg-[#78001A] text-white"
              disabled={!selectedMasjid}
              onClick={handleAssign}
            >
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 