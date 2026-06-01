"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DonationCategoryForm, { type DonationCategoryFormValues } from "./DonationCategoryForm";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CreditCard, LayoutPanelTop, MonitorSmartphone } from "lucide-react";
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

export default function CreateDonationCategoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const masjidId = searchParams.get("masjidId") || "";
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (data: DonationCategoryFormValues) => {
    if (!masjidId) {
      toast({ title: "Missing masjid", description: "Select a masjid first.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/donation-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, masjidId }),
      });
      if (!res.ok) {
        throw new Error(await readErrorMessage(res, "Failed to create category"));
      }
      toast({ title: "Category created", description: "Donation category saved successfully." });
      router.push(`/dashboard/donations/categories?masjidId=${masjidId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create category",
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
          Choose a masjid to create donation categories.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 py-8">
      <section className="rounded-[32px] border border-[#550C18]/10 bg-[linear-gradient(135deg,rgba(85,12,24,0.08),rgba(255,255,255,1)_42%,rgba(85,12,24,0.03))] p-6 shadow-[0_30px_80px_-56px_rgba(85,12,24,0.55)] md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <Badge className="border border-[#550C18]/10 bg-white/80 text-[#550C18] hover:bg-white">
              Donation Categories
            </Badge>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#2e0c12] md:text-4xl">
              Create a category donors will immediately understand and trust.
            </h1>
            <p className="mt-3 text-base text-[#6d5560] md:text-lg">
              Set the donor-facing experience, kiosk behavior, default amounts, and recurring options
              in one place before the category goes live.
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
            icon: LayoutPanelTop,
            title: "Donor Experience",
            description: "Keep the title, subtitle, branding, and suggested amounts clear and focused.",
          },
          {
            icon: MonitorSmartphone,
            title: "Kiosk Ready",
            description: "Only categories that are easy to scan and tap should be enabled for kiosk mode.",
          },
          {
            icon: CreditCard,
            title: "Explicit Save",
            description: "Review all changes before saving so staff do not accidentally change live donation settings.",
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
        mode="create"
        initialValues={{ masjidId }}
        onSubmit={handleCreate}
        onCancel={() => router.push(`/dashboard/donations/categories?masjidId=${masjidId}`)}
        isSubmitting={isSubmitting}
      />
      <div className="flex justify-end">
        <Button
          variant="ghost"
          className="text-[#550C18] hover:bg-[#550C18]/5"
          onClick={() => router.push(`/dashboard/donations/categories?masjidId=${masjidId}`)}
        >
          Return to categories
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
