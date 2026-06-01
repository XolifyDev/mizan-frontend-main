"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

declare global {
  interface Window {
    MizanDynamicComponent?: React.ComponentType<{
      slide?: unknown;
      masjid?: unknown;
      theme?: unknown;
    }>;
  }
}

function decodeJsonParam<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(decodeURIComponent(value)) as T;
  } catch {
    return null;
  }
}

export default function ViewComponentPage() {
  const searchParams = useSearchParams();
  const [Component, setComponent] = useState<React.ComponentType<{ slide?: unknown; masjid?: unknown }> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Parse and decode params
  const slideParam = searchParams.get("slide");
  const masjidParam = searchParams.get("masjid");
  const urlParam = searchParams.get("url");
  const slide = decodeJsonParam<{ id?: string; customComponentUrl?: string | null }>(slideParam);
  const masjid = decodeJsonParam<{ name?: string }>(masjidParam);
  const url = urlParam ? decodeURIComponent(urlParam) : slide?.customComponentUrl || null;
  const hasInvalidParams = (!!slideParam && !slide) || (!!masjidParam && !masjid);

  useEffect(() => {
    if (hasInvalidParams) {
      setError("Invalid view-component parameters.");
      setLoading(false);
      return;
    }

    if (!url) {
      setError("No custom component URL provided.");
      setLoading(false);
      return;
    }

    // Clear any existing component
    window.MizanDynamicComponent = undefined;

    // Create script element
    const script = document.createElement('script');
    script.src = `/api/esm/displaytv?url=${encodeURIComponent(url)}`;
    script.async = true;

    // Handle script load success
    script.onload = () => {
      // Give a small delay for the script to execute
      setTimeout(() => {
        const Comp = window.MizanDynamicComponent;

        if (Comp && typeof Comp === 'function') {
          setComponent(() => Comp);
          setError(null);
        } else {
          setError('Component failed to load or is not a valid React component.');
        }
        setLoading(false);
      }, 100);
    };

    // Handle script load error
    script.onerror = () => {
      setError('Failed to load component script.');
      setLoading(false);
    };

    // Add script to document
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
      window.MizanDynamicComponent = undefined;
    };
  }, [url, hasInvalidParams]);

  // Show loading state
  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        width: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#000',
        color: '#fff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>Loading custom component...</div>
          <div style={{ fontSize: '14px', opacity: 0.7 }}>{url}</div>
        </div>
      </div>
    );
  }

  // Show error state
  if (!Component && error) {
    return (
      <div style={{ 
        height: '100vh', 
        width: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f44336',
        color: '#fff',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>Error Loading Component</div>
          <div style={{ fontSize: '16px', marginBottom: '20px' }}>{error}</div>
          <div style={{ fontSize: '14px', opacity: 0.8 }}>
            URL: {url}<br/>
            Slide ID: {slide?.id}<br/>
            Masjid: {masjid?.name}
          </div>
        </div>
      </div>
    );
  }

  // Render the component
  if (Component) {
    return (
      <>
        <style>{`
          html, body, #__next {
            height: 100%;
            margin: 0;
            padding: 0;
            background: transparent;
            overflow: hidden;
          }
        `}</style>
        <div className="w-full h-full min-h-screen flex flex-col">
          <div className="flex-1 h-full">
            <Component slide={slide} masjid={masjid} />
          </div>
        </div>
      </>
    );
  }

  // Fallback
  return (
    <div style={{ 
      height: '100vh', 
      width: '100%', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#666',
      color: '#fff'
    }}>
      <div>No component available</div>
    </div>
  );
} 
