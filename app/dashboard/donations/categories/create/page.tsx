"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DonationCategoryForm from "./DonationCategoryForm";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CreateDonationCategoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const masjidId = searchParams.get("masjidId") || "";
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (data: any) => {
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
      if (!res.ok) throw new Error("Failed to create category");
      toast({ title: "Category created", description: "Donation category saved successfully." });
      router.push(`/dashboard/donations/categories?masjidId=${masjidId}`);
    } catch (error) {
      toast({ title: "Error", description: "Failed to create category", variant: "destructive" });
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
    <div className="max-w-5xl mx-auto py-8 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#550C18]/60">
            Donation Categories
          </p>
          <h1 className="text-3xl font-semibold text-[#2e0c12] mt-2">
            Create a new category
          </h1>
          <p className="text-[#3A3A3A]/70 mt-2">
            Configure kiosk amounts, online settings, and donation intervals.
          </p>
        </div>
        <Button
          variant="outline"
          className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
          onClick={() => router.push(`/dashboard/donations/categories?masjidId=${masjidId}`)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Categories
        </Button>
      </div>
      <DonationCategoryForm
        mode="create"
        initialValues={{ masjidId }}
        onSubmit={handleCreate}
        onCancel={() => router.push(`/dashboard/donations/categories?masjidId=${masjidId}`)}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
