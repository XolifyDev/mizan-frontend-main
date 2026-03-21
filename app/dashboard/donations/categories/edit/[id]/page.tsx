"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DonationCategoryForm from "../../create/DonationCategoryForm";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2 } from "lucide-react";

export default function EditDonationCategoryPage() {
  const router = useRouter();
  const { id } = useParams();
  const [initialValues, setInitialValues] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const masjidId = new URLSearchParams(window.location.search).get("masjidId") || "";
  
  useEffect(() => {
    async function fetchCategory() {
      setIsLoading(true);
      const res = await fetch(`/api/donation-categories?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        setInitialValues(data);
      } else {
        toast({ title: "Error", description: "Failed to fetch category", variant: "destructive" });
        router.push("/dashboard/donations/categories");
      }
      setIsLoading(false);
    }
    if (id) fetchCategory();
  }, [id, router]);

  const handleEdit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await fetch("/api/donation-categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, id }),
      });
      toast({ title: "Saved", description: "Category updated successfully" });
      router.push("/dashboard/donations/categories");
    } catch (err) {
      toast({ title: "Error", description: "Failed to update category", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <Button variant="outline" onClick={() => router.push("/dashboard/donations/categories?masjidId=" + masjidId)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
      <DonationCategoryForm
        mode="edit"
        initialValues={initialValues}
        onSubmit={handleEdit}
        onCancel={() => router.push("/dashboard/donations/categories")}
        isSubmitting={isSubmitting}
      />
    </div>
  );
} 