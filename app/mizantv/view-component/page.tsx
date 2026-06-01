"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

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

export default function MizanTVViewComponentPage() {
  const searchParams = useSearchParams();
  const [Component, setComponent] = useState<React.ComponentType<{ slide?: unknown; masjid?: unknown; theme?: unknown }> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Parse and decode params
  const slideParam = searchParams.get('slide');
  const masjidParam = searchParams.get('masjid');
  const themeParam = searchParams.get('theme');
  const urlParam = searchParams.get('url');
  const slide = decodeJsonParam<{ id?: string; customComponentUrl?: string | null }>(slideParam);
  const masjid = decodeJsonParam<{ name?: string }>(masjidParam);
  const theme = decodeJsonParam<{ background?: string; text?: string }>(themeParam);
  const url = urlParam
    ? decodeURIComponent(urlParam)
    : (slide?.customComponentUrl ?? null);
  const hasInvalidParams =
    (!!slideParam && !slide) || (!!masjidParam && !masjid) || (!!themeParam && !theme);

  useEffect(() => {
    if (hasInvalidParams) {
      setError('Invalid view-component parameters.');
      setLoading(false);
      return;
    }

    if (!url) {
      setError('No custom component URL provided.');
      setLoading(false);
      return;
    }

    // Remove any previous global
    window.MizanDynamicComponent = undefined;

    // Script injection
    const script = document.createElement('script');
    script.src = `/api/esm/displaytv?url=${encodeURIComponent(url)}`;
    script.async = true;

    script.onload = () => {
      setTimeout(() => {
        const Comp = window.MizanDynamicComponent;
        if (Comp && typeof Comp === 'function') {
          setComponent(() => Comp);
          setError(null);
        } else {
          setError('Component failed to load or is not a valid React component.');
        }
        setLoading(false);
        window.MizanDynamicComponent = undefined;
      }, 50);
    };
    script.onerror = () => {
      setError('Failed to load component script.');
      setLoading(false);
      window.MizanDynamicComponent = undefined;
    };
    document.head.appendChild(script);
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
        backgroundColor: theme?.background || '#000',
        color: theme?.text || '#fff'
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
        <div style={{ height: '100dvh', width: '100%' }}>
          <Component slide={slide} masjid={masjid} theme={theme} />
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
