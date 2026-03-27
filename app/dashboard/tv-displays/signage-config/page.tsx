"use client";

import { useSearchParams } from "next/navigation";
import SignageDisplay from "./SignageConfig";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function SignageConfigPage() {
  const masjidId = useSearchParams().get("masjidId") || "";
  const displayId = useSearchParams().get("displayId") || "";
  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!masjidId) {
      setLoading(false);
      return;
    }
    const url = displayId
      ? `/api/masjids/${masjidId}/signage-config/?displayId=${displayId}`
      : `/api/masjids/${masjidId}/signage-config/`;
    setLoading(true);
    setError(null);
    fetch(url)
      .then(async (res) => {
        if (!res.ok) {
          const message = await res.json().catch(() => ({}));
          throw new Error(message?.error || "Failed to load signage config");
        }
        return res.json();
      })
      .then((data) => setSlides(data?.slides || []))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [masjidId, displayId]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen -mt-16">
      <div className="flex flex-col items-center">
        <div className="h-12 w-12 rounded-full border-y border-[#550C18] animate-spin"></div>
      </div>
    </div>;
  }

  if (!masjidId) {
    return (
      <div className="max-w-5xl mx-auto p-8 w-full">
        <div className="rounded-2xl border border-[#550C18]/10 bg-white p-8">
          <h1 className="text-2xl font-semibold text-[#550C18]">Signage Config</h1>
          <p className="mt-2 text-sm text-gray-600">
            Select a masjid to manage signage configuration.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-8 w-full">
        <div className="rounded-2xl border border-[#550C18]/10 bg-white p-8">
          <h1 className="text-2xl font-semibold text-[#550C18]">Signage Config</h1>
          <p className="mt-2 text-sm text-red-600">{error}</p>
          <Button className="mt-4" onClick={() => location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }
  
  return <SignageDisplay initialSlides={slides} masjidId={masjidId} displayId={displayId} />;
}
