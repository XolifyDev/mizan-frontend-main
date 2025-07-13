"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function MizanTVViewComponentPage() {
  const searchParams = useSearchParams();
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Parse and decode params
  const slideParam = searchParams.get('slide');
  const masjidParam = searchParams.get('masjid');
  const themeParam = searchParams.get('theme');
  const urlParam = searchParams.get('url');
  
  let slide, masjid, theme, url;
  try {
    slide = slideParam ? JSON.parse(decodeURIComponent(slideParam)) : null;
    masjid = masjidParam ? JSON.parse(decodeURIComponent(masjidParam)) : null;
    theme = themeParam ? JSON.parse(decodeURIComponent(themeParam)) : null;
    url = urlParam
      ? decodeURIComponent(urlParam)
      : (slide?.customComponentUrl ?? null);
  } catch (e) {
    console.error('Failed to parse parameters:', e);
    return <div style={{ padding: '20px', color: 'red' }}>Invalid parameters</div>;
  }

  useEffect(() => {
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

    script.onload = (e) => {
      console.log(window, e);
      setTimeout(() => {
        const Comp = window.MizanDynamicComponent;

        console.log(Comp);
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
  }, [url]);

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
        <div style={{ height: '97dvh', width: '100%', marginBottom: '3dvh' }}>
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