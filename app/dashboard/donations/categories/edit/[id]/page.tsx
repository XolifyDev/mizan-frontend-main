"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import DonationCategoryForm from "../../create/DonationCategoryForm";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function EditDonationCategoryPage() {
  const router = useRouter();
  const { id } = useParams();
  const categoryId = Array.isArray(id) ? id[0] : id;
  const searchParams = useSearchParams();
  const [initialValues, setInitialValues] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const masjidId = searchParams.get("masjidId") || "";
  
  useEffect(() => {
    async function fetchCategory() {
      setIsLoading(true);
      const res = await fetch(`/api/donation-categories?id=${categoryId}&masjidId=${masjidId}`);
      if (res.ok) {
        const data = await res.json();
        setInitialValues(data);
      } else {
        toast({ title: "Error", description: "Failed to fetch category", variant: "destructive" });
        router.push(`/dashboard/donations/categories?masjidId=${masjidId}`);
      }
      setIsLoading(false);
    }
    if (categoryId) fetchCategory();
  }, [categoryId, router]);

  const handleEdit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/donation-categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, id: categoryId }),
      });
      if (!res.ok) throw new Error("Failed to update category");
      toast({ title: "Saved", description: "Category updated successfully" });
      router.push(`/dashboard/donations/categories?masjidId=${masjidId}`);
    } catch (err) {
      toast({ title: "Error", description: "Failed to update category", variant: "destructive" });
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
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex flex-row items-center w-full justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#550C18]">Edit Donation Category</h1>
        <Button variant="outline" onClick={() => router.push(`/dashboard/donations/categories?masjidId=${masjidId}`)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
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
