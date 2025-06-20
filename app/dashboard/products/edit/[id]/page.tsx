"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { useRouter, useParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

// @ts-ignore
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false })

interface ProductImagePreview {
  file: File;
  url: string;
  alt: string;
  order: number;
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [imagePreviews, setImagePreviews] = useState<ProductImagePreview[]>([])

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      features: [] as string[],
      images: [] as ProductImagePreview[],
      category: "",
      type: "kiosk",
      price: "",
      discountType: "",
      discountValue: "",
      discountStart: "",
      discountEnd: "",
      url: "",
      popular: false,
      meta_data: {
        sizes: [] as { name: string; size: string; price: number }[]
      },
    },
  })

  const { control, register, handleSubmit, setValue, watch, reset, formState: { errors } } = form
  const [isPopular, setIsPopular] = useState(false)
  const features = watch("features")
  const productType = watch("type")
  const sizes = watch("meta_data.sizes")

  const addSize = () => {
    const currentSizes = watch("meta_data.sizes") || []
    setValue("meta_data.sizes", [...currentSizes, { name: "", size: "", price: 0 }])
  }

  const removeSize = (index: number) => {
    const currentSizes = watch("meta_data.sizes") || []
    setValue("meta_data.sizes", currentSizes.filter((_, i) => i !== index))
  }

  const updateSize = (index: number, field: "name" | "size" | "price", value: string | number) => {
    const currentSizes = watch("meta_data.sizes") || []
    const newSizes = [...currentSizes]
    newSizes[index] = { ...newSizes[index], [field]: value }
    setValue("meta_data.sizes", newSizes)
  }

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${params.id}`)
        if (!res.ok) throw new Error("Failed to fetch product")
        const product = await res.json()
      
        // Set form values
        setValue("name", product.name)
        setValue("description", product.description)
        setValue("features", product.features)
        setValue("category", product.category)
        setValue("type", product.type)
        setValue("price", product.price.toString())
        setValue("discountType", product.discountType || "")
        setValue("discountValue", product.discountValue?.toString() || "")
        setValue("discountStart", product.discountStart ? new Date(product.discountStart).toISOString().split('T')[0] : "")
        setValue("discountEnd", product.discountEnd ? new Date(product.discountEnd).toISOString().split('T')[0] : "")
        setValue("url", product.url)
        setValue("popular", product.popular)
        setIsPopular(product.popular)
        setValue("meta_data", product.meta_data ? product.meta_data.sizes : false || { sizes: [] });

        // Set image previews
        if (product.images && product.images.length > 0) {
          setImagePreviews(product.images.map((img: any) => ({
            file: new File([], ""), // Empty file since we already have the URL
            url: img.url,
            alt: img.alt || "",
            order: img.order,
          })))
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch product")
        router.push("/dashboard/products/manage")
      } finally {
        setInitialLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id, setValue, router])

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
    setLoading(true)
    try {
      // Upload new images if any
      let uploadedImages: { url: string; alt: string; order: number }[] = []
      const newImages = imagePreviews.filter(img => img.file.size > 0)
      if (newImages.length > 0) {
        const formData = new FormData()
        newImages.forEach((img) => formData.append("files", img.file))
        const res = await fetch("/api/uploadthing", {
          method: "POST",
          body: formData,
        })
        if (!res.ok) throw new Error("Failed to upload images")
        const uploaded = await res.json()
        uploadedImages = uploaded.map((img: any, i: number) => ({
          url: img.data.ufsUrl,
          alt: newImages[i]?.alt || "",
          order: newImages[i]?.order || i,
        }))
      }

      // Combine existing and new images
      const existingImages = imagePreviews.filter(img => img.file.size === 0)
      const allImages = [...existingImages, ...uploadedImages]

      // Prepare payload
      const payload = {
        ...data,
        price: Number(data.price),
        images: allImages,
        popular: isPopular,
        discountType: data.discountType,
        discountValue: Number(data.discountValue),
        discountStart: data.discountStart,
        discountEnd: data.discountEnd,
        url: data.url,
        features: data.features,
        category: data.category,
        type: data.type,
        meta_data: {
          ...data.meta_data,
          sizes: data.meta_data.sizes.map((size: any) => ({
            name: size.name,
            size: size.size,
            price: String(size.price),
          })),
        },
      }

      const res = await fetch(`/api/products/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "Failed to update product")
      }

      toast.success("Product updated successfully.")
      router.push("/dashboard/products/manage")
    } catch (err: any) {
      setLoading(false)
      toast.error(err.message || "Failed to update product")
    }
  }

  if (initialLoading) {
    return <div className="p-8 text-center text-gray-400">Loading...</div>
  }

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <h2 className="text-3xl font-bold mb-6 text-[#550C18]">Edit Product</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label>Product Name</Label>
          <Input {...register("name", { required: "Product name is required" })} placeholder="Enter product name" />
          {errors.name && <span className="text-red-500 text-xs">{errors.name.message as string}</span>}
        </div>
        <div className="space-y-2">
          <Label>Description (Markdown Supported)</Label>
          <div style={{ minHeight: 200 }}>
            {/* @ts-ignore */}
            <Controller
              name="description"
              control={control}
              render={({ field }) => <MDEditor {...field} />}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Product Images</Label>
          <Input type="file" multiple accept="image/*" onChange={handleImageUpload} />
          <div className="flex flex-wrap gap-2 mt-2">
            {imagePreviews.map((img, idx) => (
              <div key={idx} className="relative w-20 h-20 border rounded overflow-hidden flex flex-col items-center">
                <img src={img.url} alt={img.alt || "Product image"} className="object-cover w-full h-full" />
                <span className="absolute top-0 left-0 bg-white text-xs px-1 rounded-br">{img.order + 1}</span>
                <button
                  type="button"
                  className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded-bl"
                  onClick={() => {
                    setImagePreviews(imagePreviews.filter((_, i) => i !== idx))
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Input {...register("category")} placeholder="e.g. Donations, Books, Services" />
        </div>
        <div className="space-y-2">
          <Label>Product Type</Label>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kiosk">Kiosk</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="physical">Physical Product</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        {productType === "physical" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Product Sizes</Label>
              <Button type="button" variant="outline" size="sm" onClick={addSize}>
                Add Size
              </Button>
            </div>
            <div className="space-y-2">
              {sizes?.map((size, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Input
                      placeholder="Name (e.g. Men's T-Shirt)"
                      value={size.name}
                      onChange={(e) => updateSize(index, "name", e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder="Size (e.g. Small, Medium, Large)"
                      value={size.size}
                      onChange={(e) => updateSize(index, "size", e.target.value)}
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      type="number"
                      placeholder="Price"
                      value={size.price}
                      onChange={(e) => updateSize(index, "price", Number(e.target.value))}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => removeSize(index)}
                  >
                    ✕
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-2">
          <Label>Price</Label>
          <Input type="number" {...register("price", { required: "Price is required" })} placeholder="0.00" />
          {errors.price && <span className="text-red-500 text-xs">{errors.price.message as string}</span>}
        </div>
        <div className="space-y-2">
          <Label>Discount</Label>
          <div className="flex gap-2">
            <Controller
              name="discountType"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <Input
              type="number"
              placeholder="Value"
              {...register("discountValue")}
              className="w-24"
            />
            <Input
              type="date"
              {...register("discountStart")}
              className="w-36"
            />
            <Input
              type="date"
              {...register("discountEnd")}
              className="w-36"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Product URL</Label>
          <Controller
            name="url"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="https://yourproduct.com" />
            )}
          />
        </div>
        <div className="flex items-center gap-2">
          <Label>Popular</Label>
          <Controller
            name="popular"
            control={control}
            render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </div>
        <div className="space-y-2">
          <Label>Features (comma separated)</Label>
          <Controller
            name="features"
            control={control}
            render={({ field }) => (
              <Input
                placeholder="e.g. Fast, Secure, Easy to use"
                value={field.value?.join(", ")}
                onChange={e => field.onChange(e.target.value.split(",").map(f => f.trim()))}
              />
            )}
          />
        </div>
        <Button className="w-full bg-[#550C18] hover:bg-[#78001A] text-white" type="submit" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {loading ? "Updating..." : "Update Product"}
        </Button>
      </form>
    </div>
  )
} 