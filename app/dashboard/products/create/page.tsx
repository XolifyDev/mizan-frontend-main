"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import dynamic from "next/dynamic"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

// @ts-ignore
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false })

interface ProductImagePreview {
  file: File;
  url: string;
  alt: string;
  order: number;
}

export default function CreateProductPage() {
  const router = useRouter()
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
    },
  })
  const [loading, setLoading] = useState(false)
  const { control, register, handleSubmit, setValue, watch, reset, formState: { errors } } = form
  const [imagePreviews, setImagePreviews] = useState<ProductImagePreview[]>([])
  const [isPopular, setIsPopular] = useState(false)
  const features = watch("features")

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
      // Upload images if any
      let uploadedImages: { url: string; alt: string; order: number }[] = []
      if (imagePreviews.length > 0) {
        const formData = new FormData()
        imagePreviews.forEach((img) => formData.append("files", img.file))
        const res = await fetch("/api/uploadthing", {
          method: "POST",
          body: formData,
        })
        if (!res.ok) throw new Error("Failed to upload images"), setLoading(false);
        const uploaded = await res.json()
        uploadedImages = uploaded.map((img: any, i: number) => ({
          url: img.data.ufsUrl,
          alt: imagePreviews[i]?.alt || "",
          order: imagePreviews[i]?.order || i,
        }));
      }
      // Prepare payload
      const payload = {
        ...data,
        price: Number(data.price),
        images: uploadedImages,
        popular: isPopular,
        discountType: data.discountType,
        discountValue: Number(data.discountValue),
        discountStart: data.discountStart,
        discountEnd: data.discountEnd,
        url: data.url,
        features: data.features,
        category: data.category,
        type: data.type,
      }
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json();
        setLoading(false)
        throw new Error(err.message || "Failed to create product")
      }
      toast({ title: "Product Created!", description: "Product created successfully." })
      reset()
      setImagePreviews([])
      router.push("/dashboard/products/manage")
    } catch (err: any) {
      setLoading(false);
      toast({ title: "Error", description: err.message || "Failed to create product", variant: "destructive" })
    }
  }

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <h2 className="text-3xl font-bold mb-6 text-[#550C18]">Create New Product</h2>
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
                {/* <Input
                  className="mt-1 text-xs"
                  placeholder="Alt text"
                  value={img.alt}
                  onChange={e => {
                    const newImgs = [...imagePreviews]
                    newImgs[idx].alt = e.target.value
                    setImagePreviews(newImgs)
                  }}
                /> */}
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
          {loading ? "Creating..." : "Create Product"}
        </Button>
      </form>
    </div>
  )
} 