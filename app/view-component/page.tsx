"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

declare global {
  interface Window {
    MizanDynamicComponent?: any;
  }
}

export default function ViewComponentPage() {
  const searchParams = useSearchParams();
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Parse and decode params
  const slideParam = searchParams.get("slide");
  const masjidParam = searchParams.get("masjid");
  let slide, masjid;
  try {
    slide = slideParam ? JSON.parse(decodeURIComponent(slideParam)) : null;
    masjid = masjidParam ? JSON.parse(decodeURIComponent(masjidParam)) : null;
  } catch (e) {
    return <div>Invalid parameters</div>;
  }

  useEffect(() => {
    if (!slide?.customComponentUrl) {
      setError("No custom component URL provided.");
      return;
    }

    fetch(`/api/esm/displaytv?url=${encodeURIComponent(slide.customComponentUrl)}`)
      .then(res => res.text())
      .then(code => {
        // Remove all export statements and assign to global
        const patchedCode = code
          .replace(/export\s+default/g, "")
          .replace(/export\s+\{[^}]*\};?/g, "")
          + '\nwindow.MizanDynamicComponent = typeof MizanDynamicComponent === "function" ? MizanDynamicComponent : (typeof MizanDynamicComponent === "object" && MizanDynamicComponent.default ? MizanDynamicComponent.default : null);';

        const script = document.createElement("script");
        script.text = patchedCode;
        document.body.appendChild(script);

        setTimeout(() => {
          let Comp = window.MizanDynamicComponent;
          console.log('window.MizanDynamicComponent:', Comp);
          if (Comp && typeof Comp !== 'function' && typeof Comp?.default === 'function') {
            Comp = Comp.default;
          }
          if (typeof Comp === 'function') {
            setComponent(() => Comp as any);
          } else {
            setError("Failed to load component.");
          }
          document.body.removeChild(script);
          window.MizanDynamicComponent = undefined;
        }, 100);
      })
      .catch(err => setError("Failed to fetch component: " + err));
  }, [slide?.customComponentUrl]);

  if (error) return <div>Error: {error}</div>;
  if (!Component) return <div>Loading custom component...</div>;

  return <Component slide={slide} masjid={masjid} />;
} 