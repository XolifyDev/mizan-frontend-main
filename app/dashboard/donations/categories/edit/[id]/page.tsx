"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import DonationCategoryForm, {
  type DonationCategoryFormValues,
} from "../../create/DonationCategoryForm";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, RefreshCw, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

async function readErrorMessage(res: Response, fallback: string) {
  try {
    const data = await res.json();
    return data?.message || data?.error || fallback;
  } catch {
    return fallback;
  }
}

export default function EditDonationCategoryPage() {
  const router = useRouter();
  const { id } = useParams();
  const categoryId = Array.isArray(id) ? id[0] : id;
  const searchParams = useSearchParams();
  const [initialValues, setInitialValues] = useState<DonationCategoryFormValues | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const masjidId = searchParams.get("masjidId") || "";
  
  useEffect(() => {
    async function fetchCategory() {
      setIsLoading(true);
      const res = await fetch(`/api/donation-categories?id=${categoryId}&masjidId=${masjidId}`);
      if (res.ok) {
        const data = await res.json();
        setInitialValues(data as DonationCategoryFormValues);
      } else {
        toast({
          title: "Error",
          description: await readErrorMessage(res, "Failed to fetch category"),
          variant: "destructive",
        });
        router.push(`/dashboard/donations/categories?masjidId=${masjidId}`);
      }
      setIsLoading(false);
    }
    if (categoryId) fetchCategory();
  }, [categoryId, masjidId, router]);

  const handleEdit = async (data: DonationCategoryFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/donation-categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, id: categoryId }),
      });
      if (!res.ok) throw new Error(await readErrorMessage(res, "Failed to update category"));
      toast({ title: "Saved", description: "Category updated successfully" });
      router.push(`/dashboard/donations/categories?masjidId=${masjidId}`);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update category",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!masjidId) {
    return (
      <div className="max-w-2xl mx-auto mt-20 bg-white border border-[#550C18]/10 rounded-2xl p-8 text-center shadow-sm">
        <h2 className="text-2xl font-semibold text-[#550C18] mb-2">
          Select a Masjid
        </h2>
        <p className="text-[#3A3A3A]/70">
          Choose a masjid to edit donation categories.
        </p>
      </div>
    );
  }

  if (isLoading) return <div className="h-full w-full mx-auto mt-[35dvh] gap-3">
    <div className="flex flex-col items-center">
      <div className="h-12 w-12 rounded-full border-y border-[#550C18] animate-spin"></div>
    </div>
    <p className="text-[#3A3A3A]/70 text-center mt-4">Please wait while we load the category details.</p>
  </div>;
  if (!initialValues) return null;

  return (
    <div className="mx-auto max-w-6xl space-y-8 py-8">
      <section className="rounded-[32px] border border-[#550C18]/10 bg-[linear-gradient(135deg,rgba(85,12,24,0.08),rgba(255,255,255,1)_42%,rgba(85,12,24,0.03))] p-6 shadow-[0_30px_80px_-56px_rgba(85,12,24,0.55)] md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <Badge className="border border-[#550C18]/10 bg-white/80 text-[#550C18] hover:bg-white">
              Edit Donation Category
            </Badge>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#2e0c12] md:text-4xl">
              Refine {initialValues.name || "this category"} without disrupting the live donation flow.
            </h1>
            <p className="mt-3 text-base text-[#6d5560] md:text-lg">
              Review donor-facing copy, recurring logic, kiosk visibility, and compliance settings
              before saving changes.
            </p>
          </div>
          <Button
            variant="outline"
            className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
            onClick={() => router.push(`/dashboard/donations/categories?masjidId=${masjidId}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Categories
          </Button>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {[
          {
            icon: Eye,
            title: "Review Before Save",
            description: "Treat edits as live configuration changes and check the donor experience before saving.",
          },
          {
            icon: RefreshCw,
            title: "Keep Messaging Consistent",
            description: "Titles, suggested amounts, and recurring options should stay aligned across kiosk and online use.",
          },
          {
            icon: ShieldCheck,
            title: "Safe Operational Changes",
            description: "Adjust only what needs to change so active campaigns stay stable for staff and donors.",
          },
        ].map((item) => (
          <Card key={item.title} className="border-[#550C18]/10 bg-white shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[#550C18]/8 p-3 text-[#550C18]">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-[#2e0c12]">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </section>

      <DonationCategoryForm
        mode="edit"
        initialValues={initialValues}
        onSubmit={handleEdit}
        onCancel={() => router.push(`/dashboard/donations/categories?masjidId=${masjidId}`)}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
