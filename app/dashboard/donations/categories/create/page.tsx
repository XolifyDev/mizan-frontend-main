"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Upload, ArrowLeft } from "lucide-react";
import { useForm, Controller } from "react-hook-form";

type DonationCategoryFormValues = {
  masjidId: string;
  name: string;
  description: string;
  subtitle: string;
  featured: boolean;
  featuredImage: string | null;
  color: string;
  icon: string;
  logo: string | null;
  showLogo: boolean;
  headerBgColor: string;
  showOnKiosk: boolean;
  excludeFromReceipts: boolean;
  allowPledge: boolean;
  quickDonate: boolean;
  hideTitle: boolean;
  defaultAmounts: string;
  min: number;
  max: number;
  enforceMax: boolean;
  allowCustomAmount: boolean;
  intervals: string[];
  defaultInterval: string;
  recurringCountOptions: number[];
  recurring: boolean;
  enableAppleGooglePay: boolean;
  coverFee: boolean;
  coverFeeDefault: boolean;
  allowAnonymous: boolean;
  allowComments: boolean;
  collectAddress: boolean;
  collectPhone: boolean;
  mailingListOptIn: boolean;
  goalAmount?: number;
  ctaMessage: string;
  designations: string[];
  amountsPerInterval: Record<string, number[]>;
  customLabel: string;
  complianceText: string;
  appreciation: string;
  redirectUrl: string;
  order?: number;
  active: boolean;
  restricted: boolean;
};

export default function CreateDonationCategoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const masjidId = searchParams.get("masjidId") || "";
  const { control, handleSubmit, setValue, getValues, watch, reset } = useForm<DonationCategoryFormValues>({
    defaultValues: {
      masjidId,
      name: "",
      description: "",
      subtitle: "",
      featured: false,
      featuredImage: null,
      color: "#ffffff",
      icon: "",
      logo: null,
      showLogo: true,
      headerBgColor: "#550C18",
      showOnKiosk: true,
      excludeFromReceipts: false,
      allowPledge: false,
      quickDonate: false,
      hideTitle: false,
      defaultAmounts: "10, 25, 50, 100",
      min: 1,
      max: 10000,
      enforceMax: false,
      allowCustomAmount: true,
      intervals: ["onetime"],
      defaultInterval: "onetime",
      recurringCountOptions: [],
      recurring: false,
      enableAppleGooglePay: false,
      coverFee: false,
      coverFeeDefault: false,
      allowAnonymous: false,
      allowComments: false,
      collectAddress: false,
      collectPhone: false,
      mailingListOptIn: false,
      goalAmount: undefined,
      ctaMessage: "",
      designations: [],
      amountsPerInterval: {},
      customLabel: "",
      complianceText: "",
      appreciation: "",
      redirectUrl: "",
      order: undefined,
      active: true,
      restricted: false,
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [designationInput, setDesignationInput] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [previewMode, setPreviewMode] = useState<'kiosk' | 'donation'>('kiosk');
  const [selectedInterval, setSelectedInterval] = useState('onetime');
  const [amountsInput, setAmountsInput] = useState<Record<string, string>>({});

  // Watch all fields for live preview
  const formValues = watch();

  // Handle logo upload preview
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setValue("logo", URL.createObjectURL(file));
    }
  };
  // Handle featured image upload preview
  const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFeaturedImageFile(file);
      setValue("featuredImage", URL.createObjectURL(file));
    }
  };

  // Handle form submit
  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Upload logo and featured image if any
      let uploadedImages: { url: string; alt: string; order: number }[] = []
      if (logoFile) {
        const formData = new FormData()
        formData.append("files", logoFile)
        const res = await fetch("/api/uploadthing", {
          method: "POST",
          body: formData,
        })
        if (!res.ok) throw new Error("Failed to upload images")
        const uploaded = await res.json()
        uploadedImages.push({
          url: uploaded[0].data.ufsUrl,
          alt: "",
          order: 0,
        })
      }
      if (featuredImageFile) {
        const formData = new FormData()
        formData.append("files", featuredImageFile)
        const res = await fetch("/api/uploadthing", {
          method: "POST",
          body: formData,
        })
        if (!res.ok) throw new Error("Failed to upload images")
        const uploaded = await res.json()
        uploadedImages.push({
          url: uploaded[0].data.ufsUrl,
          alt: "",
          order: 1,
        })
      }
      console.log(uploadedImages);
      // Prepare payload
      const payload: any = {
        ...data,
        min: Number(data.min),
        logo: uploadedImages[0].url,
        featuredImage: uploadedImages[1].url,
        max: Number(data.max),
        goalAmount: data.goalAmount ? Number(data.goalAmount) : undefined,
        order: data.order ? Number(data.order) : undefined,
        defaultAmounts: data.defaultAmounts,
        masjidId: masjidId, 
      };
      // TODO: handle logo/featured image upload to S3 or server if needed
      const res = await fetch("/api/donation-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create category");
      toast({ title: "Success", description: "Category created!" });
      router.push("/dashboard/donations/categories");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    setAmountsInput(current => {
      const updated: Record<string, string> = { ...current };
      formValues.intervals.forEach(interval => {
        if (!(interval in updated)) {
          updated[interval] = (formValues.amountsPerInterval?.[interval] || []).join(", ");
        }
      });
      Object.keys(updated).forEach(key => {
        if (!formValues.intervals.includes(key)) {
          delete updated[key];
        }
      });
      return updated;
    });
  }, [formValues.intervals, formValues.amountsPerInterval]);

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto py-8 min-h-screen">
      {/* Form Section */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 space-y-6 max-w-[50dvw]">
        <div className="flex items-center gap-2 mb-2">
          <Button type="button" variant="ghost" onClick={() => router.push("/dashboard/donations/categories?masjidId=" + masjidId)} size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-[#550C18]">Add Donation Category</h1>
        </div>
        <Card className="bg-white border-[#550C18]/10">
          <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>Basic info about the category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input {...field} required placeholder="Category Name" />
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subtitle</label>
              <Controller
                name="subtitle"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Subtitle (optional)" />
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Textarea {...field} placeholder="Description" />
                )}
              />
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              <label className="flex items-center gap-2">
                <Controller
                  name="active"
                  control={control}
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
                Active
              </label>
              <label className="flex items-center gap-2">
                <Controller
                  name="featured"
                  control={control}
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
                Featured
              </label>
              <label className="flex items-center gap-2">
                <Controller
                  name="restricted"
                  control={control}
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
                Restricted
              </label>
              <label className="flex items-center gap-2">
                <Controller
                  name="recurring"
                  control={control}
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
                Recurring
              </label>
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              <label className="flex items-center gap-2">
                <Controller
                  name="showOnKiosk"
                  control={control}
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
                Show on Kiosk
              </label>
              <label className="flex items-center gap-2">
                <Controller
                  name="excludeFromReceipts"
                  control={control}
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
                Exclude from Receipts
              </label>
              <label className="flex items-center gap-2">
                <Controller
                  name="allowPledge"
                  control={control}
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
                Allow Pledge
              </label>
              <label className="flex items-center gap-2">
                <Controller
                  name="quickDonate"
                  control={control}
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
                Quick Donate
              </label>
              <label className="flex items-center gap-2">
                <Controller
                  name="hideTitle"
                  control={control}
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
                Hide Title
              </label>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-[#550C18]/10">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how this category looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium mb-1">Color</label>
                <Controller
                  name="color"
                  control={control}
                  render={({ field }) => (
                    <Input type="color" {...field} className="w-full h-10 p-0 border rounded" />
                  )}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Header BG Color</label>
                <Controller
                  name="headerBgColor"
                  control={control}
                  render={({ field }) => (
                    <Input type="color" {...field} onChange={e => field.onChange(e.target.value)} className="w-full h-10 p-0 border rounded" />
                  )}
                />
              </div>
              <div className="col-span-2 w-full">
                <label className="block text-sm font-medium mb-1">Icon (emoji or text)</label>
                <Controller
                  name="icon"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder="e.g. 🕌" />
                  )}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-2">
              <label className="flex items-center gap-2">
                <Controller
                  name="showLogo"
                  control={control}
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
                Show Logo
              </label>
            </div>
            {/* Redesigned Logo & Featured Image Section */}
            <div className="md:col-span-2 flex flex-col md:flex-row gap-4">
                {/* Logo Upload */}
                <div className="flex-1 flex flex-col items-center border rounded-lg p-4 bg-gray-50">
                  <label className="font-semibold mb-2">Logo</label>
                  <div className="relative flex flex-col items-center">
                    <Input
                      type="file"
                      accept="image/*"
                      id="logo-upload"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      {formValues.logo ? (
                        <img
                          src={formValues.logo}
                          alt="Logo Preview"
                          className="h-16 w-16 rounded-full object-cover border-2 border-gray-300 shadow mb-2"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-white border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 mb-2">
                          <Upload className="h-6 w-6" />
                        </div>
                      )}
                    </label>
                    {formValues.logo && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setLogoFile(null);
                          setValue("logo", null);
                        }}
                        className="text-xs text-red-500 mt-1"
                      >
                        Remove
                      </Button>
                    )}
                    <span className="text-xs text-gray-500 mt-1">PNG/JPG, max 1MB</span>
                  </div>
                </div>
                {/* Featured Image Upload */}
                <div className="flex-1 flex flex-col items-center border rounded-lg p-4 bg-gray-50">
                  <label className="font-semibold mb-2">Featured Image</label>
                  <div className="relative flex flex-col items-center">
                    <Input
                      type="file"
                      accept="image/*"
                      id="featured-upload"
                      onChange={handleFeaturedImageChange}
                      className="hidden"
                    />
                    <label htmlFor="featured-upload" className="cursor-pointer">
                      {formValues.featuredImage ? (
                        <img
                          src={formValues.featuredImage}
                          alt="Featured Preview"
                          className="h-16 w-24 rounded-lg object-cover border-2 border-gray-300 shadow mb-2"
                        />
                      ) : (
                        <div className="h-16 w-24 rounded-lg bg-white border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 mb-2">
                          <Upload className="h-6 w-6" />
                        </div>
                      )}
                    </label>
                    {formValues.featuredImage && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setValue("featuredImage", null)}
                        className="text-xs text-red-500 mt-1"
                      >
                        Remove
                      </Button>
                    )}
                    <span className="text-xs text-gray-500 mt-1">PNG/JPG, max 2MB</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-[#550C18]/10">
          <CardHeader>
            <CardTitle>Amounts</CardTitle>
            <CardDescription>Set default and allowed donation amounts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-1">Default Amounts (comma separated)</label>
              <Controller
                name="defaultAmounts"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="10, 25, 50, 100" />
                )}
              />
              <div className="flex flex-wrap gap-1 mt-2">
                {formValues.defaultAmounts.split(",").map((a, i) => (
                  <Badge key={i} className="bg-[#550C18]/10 text-[#550C18]">${a.trim()}</Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Min</label>
                <Controller
                  name="min"
                  control={control}
                  render={({ field }) => (
                    <Input type="number" {...field} min={1} />
                  )}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Max</label>
                <Controller
                  name="max"
                  control={control}
                  render={({ field }) => (
                    <Input type="number" {...field} min={formValues.min} />
                  )}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              <label className="flex items-center gap-2">
                <Controller
                  name="allowCustomAmount"
                  control={control}
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
                Allow Custom Amount
              </label>
              <label className="flex items-center gap-2">
                <Controller
                  name="enforceMax"
                  control={control}
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
                Enforce Max
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Goal Amount (optional)</label>
              <Controller
                name="goalAmount"
                control={control}
                render={({ field }) => (
                  <Input type="number" {...field} placeholder="0" />
                )}
              />
            </div>
            {/* --- Designations --- */}
            <div className="space-y-2 pt-2">
              <label className="block text-sm font-medium mb-1">Designations (dropdown options for donor to select)</label>
              <div className="flex gap-2">
                <Input
                  value={designationInput}
                  onChange={e => setDesignationInput(e.target.value)}
                  placeholder="Add designation"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && designationInput.trim()) {
                      e.preventDefault();
                      if (!formValues.designations.includes(designationInput.trim())) {
                        setValue("designations", [...formValues.designations, designationInput.trim()]);
                        setDesignationInput("");
                      }
                    }
                  }}
                />
                <Button type="button" onClick={() => {
                  if (designationInput.trim() && !formValues.designations.includes(designationInput.trim())) {
                    setValue("designations", [...formValues.designations, designationInput.trim()]);
                    setDesignationInput("");
                  }
                }}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formValues.designations.map((d, i) => (
                  <Badge key={i} className="bg-[#550C18]/10 text-[#550C18] flex items-center gap-1">
                    {d}
                    <Button type="button" size="icon" variant="ghost" className="h-4 w-4 p-0 text-center my-auto mx-auto" onClick={() => setValue("designations", formValues.designations.filter((x) => x !== d))}>
                      ×
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
            {/* --- Amounts Per Interval --- */}
            <div className="space-y-2 pt-2">
              <label className="block text-sm font-medium mb-1">Amounts Per Interval</label>
              {formValues.intervals.map(interval => (
                <div key={interval} className="flex items-center gap-2 mb-1">
                  <span className="w-24 capitalize">{interval.replace(/_/g, ' ')}</span>
                  <Controller
                    name={`amountsPerInterval.${interval}` as const}
                    control={control}
                    render={({ field }) => (
                      <Input
                        value={amountsInput[interval] ?? ""}
                        type="text"
                        onChange={e => {
                          setAmountsInput(prev => ({
                            ...prev,
                            [interval]: e.target.value
                          }));
                        }}
                        onBlur={e => {
                          const arr = e.target.value
                            .split(",")
                            .map(v => parseInt(v.trim()))
                            .filter(Boolean);
                          setValue(`amountsPerInterval.${interval}` as const, arr);
                        }}
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const arr = (amountsInput[interval] ?? "")
                              .split(",")
                              .map(v => parseInt(v.trim()))
                              .filter(Boolean);
                            setValue(`amountsPerInterval.${interval}` as const, arr);
                          }
                        }}
                        placeholder="e.g. 10, 25, 50"
                      />
                    )}
                  />
                  {/* <div className="flex gap-1">
                    {(formValues.amountsPerInterval[interval] || []).map((amt: number, i: number) => (
                      <Badge key={i} className="bg-[#550C18]/10 text-[#550C18]">${amt}</Badge>
                    ))}
                  </div> */}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-[#550C18]/10">
          <CardHeader>
            <CardTitle>Intervals & Recurring</CardTitle>
            <CardDescription>Donation intervals and recurring options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
              {[
                { label: "One-time", value: "onetime" },
                { label: "Daily", value: "daily" },
                { label: "Weekly", value: "weekly" },
                { label: "Every Jumuah", value: "jumuah" },
                { label: "Monthly", value: "monthly" },
                { label: "Quarterly", value: "quarterly" },
                { label: "Annually", value: "annually" },
              ].map(opt => (
                <label key={opt.value} className="flex items-center gap-2">
                  <Controller
                    name={`intervals`}
                    control={control}
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        checked={field.value.includes(opt.value)}
                        onChange={e => {
                          if (e.target.checked) field.onChange([...field.value, opt.value]);
                          else field.onChange(field.value.filter(i => i !== opt.value));
                        }}
                      />
                    )}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Default Interval</label>
              <Controller
                name="defaultInterval"
                control={control}
                render={({ field }) => (
                  <select
                    className="border rounded px-2 py-1"
                    value={field.value}
                    onChange={e => field.onChange(e.target.value)}
                  >
                    {formValues.intervals.map(i => (
                      <option key={i} value={i}>{i.charAt(0).toUpperCase() + i.slice(1)}</option>
                    ))}
                  </select>
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Recurring Count Options (comma separated)</label>
              <Controller
                name="recurringCountOptions"
                control={control}
                render={({ field }) => (
                  <Input
                    value={(field.value || []).join(", ")}
                    onChange={e => {
                      const arr = e.target.value.split(",").map(v => parseInt(v.trim())).filter(Boolean);
                      field.onChange(arr);
                    }}
                    placeholder="e.g. 3, 6, 12"
                  />
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Call to Action Message</label>
              <Controller
                name="ctaMessage"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="e.g. Donate generously to this blessed cause" />
                )}
              />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-[#550C18]/10">
          <CardHeader>
            <CardTitle>Payment & Fees</CardTitle>
            <CardDescription>Payment options and fee settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-2">
              <Controller
                name="enableAppleGooglePay"
                control={control}
                render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
              Enable Apple & Google Pay
            </label>
            <label className="flex items-center gap-2">
              <Controller
                name="coverFee"
                control={control}
                render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
              Ask donors to cover fee
            </label>
            <label className="flex items-center gap-2">
              <Controller
                name="coverFeeDefault"
                control={control}
                render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
              Ask donors to cover fees by default
            </label>
            <div>
              <label className="block text-sm font-medium mb-1">Custom "Donate" Label</label>
              <Controller
                name="customLabel"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="e.g. Pay" />
                )}
              />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-[#550C18]/10">
          <CardHeader>
            <CardTitle>Donor Info & Advanced</CardTitle>
            <CardDescription>Donor info, compliance, and advanced options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-2">
              <Controller
                name="allowAnonymous"
                control={control}
                render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
              Allow Anonymous Donations
            </label>
            <label className="flex items-center gap-2">
              <Controller
                name="allowComments"
                control={control}
                render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
              Allow Donor Comments
            </label>
            <label className="flex items-center gap-2">
              <Controller
                name="collectAddress"
                control={control}
                render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
              Collect Address
            </label>
            <label className="flex items-center gap-2">
              <Controller
                name="collectPhone"
                control={control}
                render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
              Collect Phone
            </label>
            <label className="flex items-center gap-2">
              <Controller
                name="mailingListOptIn"
                control={control}
                render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
              Ask donors to subscribe to mailing list
            </label>
            <div>
              <label className="block text-sm font-medium mb-1">Compliance/Disclaimer Text</label>
              <Controller
                name="complianceText"
                control={control}
                render={({ field }) => (
                  <Textarea {...field} placeholder="Enter your tax status, if applicable" />
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Thank You Message</label>
              <Controller
                name="appreciation"
                control={control}
                render={({ field }) => (
                  <Textarea {...field} placeholder="Thank you for your generous donation!" />
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Redirect URL after donation</label>
              <Controller
                name="redirectUrl"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="https://..." />
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Order (for sorting)</label>
              <Controller
                name="order"
                control={control}
                render={({ field }) => (
                  <Input type="number" {...field} placeholder="0" />
                )}
              />
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button className="bg-[#550C18] hover:bg-[#78001A] text-white" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Create Category"}
          </Button>
        </div>
      </form>
      {/* Live Preview Section */}
      <div className="hidden md:block max-w-lg w-[320px]">
        <div className="flex gap-2 mb-4">
          <Button
            variant={previewMode === 'kiosk' ? 'default' : 'outline'}
            onClick={() => setPreviewMode('kiosk')}
            type="button"
          >
            Kiosk
          </Button>
          <Button
            variant={previewMode === 'donation' ? 'default' : 'outline'}
            onClick={() => setPreviewMode('donation')}
            type="button"
          >
            Donation Page
          </Button>
                </div>
        {previewMode !== 'kiosk' ? (
          // Donation Page Preview
          <div className="mb-8">
            <div className="w-full rounded-t-lg flex flex-col items-center justify-center py-6" style={{backgroundColor: formValues.headerBgColor}}>
              {formValues.logo && formValues.showLogo && (
                <img src={formValues.logo} alt="Logo" className="h-12 w-12 rounded-full object-cover border mb-2" />
              )}
              {!formValues.hideTitle && (
                <>
                  <h2 className="text-2xl font-bold text-white text-center">{formValues.name || "Category Name"}</h2>
                  {formValues.subtitle && (
                    <div className="text-sm text-white text-center">{formValues.subtitle}</div>
                  )}
                </>
              )}
            </div>
            <div className="bg-white w-full rounded-b-lg shadow-lg p-6 flex flex-col items-center">
              {/* Interval Toggle */}
              <div className="flex justify-center mb-4">
                {['onetime', 'monthly'].map(interval => (
                  <Button
                    key={interval}
                    variant={selectedInterval === interval ? 'default' : 'outline'}
                    onClick={() => setSelectedInterval(interval)}
                    className="mx-1"
                  >
                    {interval === 'onetime' ? 'One-Time' : 'Monthly'}
                  </Button>
                ))}
              </div>
              <div className="flex flex-col gap-3 w-full mb-4">
                {(formValues.amountsPerInterval[selectedInterval]?.length
                  ? formValues.amountsPerInterval[selectedInterval]
                  : formValues.defaultAmounts.split(",").map(a => a.trim())
                ).map((amt: any, i: number) => (
                  <Button key={i} variant={"outline"} className="w-full text-black" style={{backgroundColor: formValues.headerBgColor}}>
                    ${amt}
                  </Button>
                ))}
                {formValues.allowCustomAmount && (
                  <div className="border rounded px-4 py-3 text-lg italic w-full" style={{
                    color: formValues.color,
                    backgroundColor: `${formValues.color}05`
                  }}>Custom Amount</div>
                )}
              </div>
              <Button className="w-full text-black" variant={"default"} style={{backgroundColor: formValues.color}}>Next</Button>
            </div>
          </div>
        ) : (
          // Kiosk Preview
          <div className="w-full border rounded-lg shadow-lg">
            <div className="rounded-t-lg px-6 py-4 flex flex-col items-center" style={{backgroundColor: formValues.headerBgColor}}>
              {formValues.logo && formValues.showLogo && (
                <img src={formValues.logo} alt="Logo" className="h-10 w-10 rounded-full object-cover border mb-2" />
              )}
              {!formValues.hideTitle && (
                <>
                  <h2 className="text-xl font-bold text-white text-center">{formValues.name || "Category Name"}</h2>
                  {formValues.subtitle && (
                    <div className="text-xs text-white text-center">{formValues.subtitle}</div>
                  )}
                </>
              )}
            </div>
            <div className="bg-white rounded-b-lg px-6 py-4 flex flex-col items-center">
              {/* Interval Toggle */}
              <div className="flex justify-center mb-4">
                {['onetime', 'monthly'].map(interval => (
                  <Button
                    key={interval}
                    variant={selectedInterval === interval ? 'default' : 'outline'}
                    onClick={() => setSelectedInterval(interval)}
                    className="mx-1"
                  >
                    {interval === 'onetime' ? 'One-Time' : 'Monthly'}
                  </Button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {(formValues.amountsPerInterval[selectedInterval]?.length
                  ? formValues.amountsPerInterval[selectedInterval]
                  : formValues.defaultAmounts.split(",").map(a => a.trim())
                ).map((amt: any, i: number) => (
                  <Button key={i} variant={"outline"} className={`w-full hover:text-white active:text-white hover:bg-[${formValues.headerBgColor}] text-[${formValues.headerBgColor}] border-[${formValues.headerBgColor}]`}>
                    ${amt}
                  </Button>
                ))}
              </div>
              {/* Show designations if set */}
              {formValues.designations.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1">
                  {formValues.designations.map((d, i) => (
                    <div key={i} className="border rounded px-4 py-3 text-lg" style={{color: formValues.color, backgroundColor: `${formValues.color}10`}}>{d}</div>
                  ))}
                </div>
              )}
              <div className="text-xs text-gray-500 mb-2">Min: ${formValues.min} &nbsp; Max: ${formValues.max}</div>
              {formValues.recurring && <Badge className="bg-green-100 text-green-700 border-green-200 mr-1">Recurring</Badge>}
              {formValues.restricted && <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 mr-1">Restricted</Badge>}
              {formValues.active ? (
              <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>
            ) : (
              <Badge className="bg-red-100 text-red-700 border-red-200">Inactive</Badge>
            )}
              <Button className="w-full mt-4 text-black" variant={"default"} style={{backgroundColor: formValues.color}}>Donate</Button>
            <div className="mt-4 text-xs text-gray-600 italic min-h-[32px]">
                {formValues.appreciation || "Thank you for your generous donation!"}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 