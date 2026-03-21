"use client";

import { useSearchParams } from "next/navigation";
import SignageDisplay from "./SignageConfig";
import { useEffect, useState } from "react";

export default function SignageConfigPage() {
  const masjidId = useSearchParams().get("masjidId") || "";
  const displayId = useSearchParams().get("displayId") || "";
  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const url = displayId
      ? `/api/masjids/${masjidId}/signage-config/?displayId=${displayId}`
      : `/api/masjids/${masjidId}/signage-config/`;
    fetch(url)
      .then(async (res) => {
        const data = await res.json();
        console.log("Fetching slides", data);
        return data;
      })
      .then((data) => setSlides(data.slides))
      .finally(() => setLoading(false));
  }, [masjidId, displayId]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen -mt-16">
      <div className="flex flex-col items-center">
        <div className="h-12 w-12 rounded-full border-y border-[#550C18] animate-spin"></div>
      </div>
    </div>;
  }
  
  return <SignageDisplay initialSlides={slides} masjidId={masjidId} displayId={displayId} />;
}