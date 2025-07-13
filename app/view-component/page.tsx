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
  const [loading, setLoading] = useState(true);

  // Parse and decode params
  const slideParam = searchParams.get("slide");
  const masjidParam = searchParams.get("masjid");
  const urlParam = searchParams.get("url");
  
  let slide, masjid, url;
  try {
    slide = slideParam ? JSON.parse(decodeURIComponent(slideParam)) : null;
    masjid = masjidParam ? JSON.parse(decodeURIComponent(masjidParam)) : null;
    url = urlParam ? decodeURIComponent(urlParam) : slide?.customComponentUrl || null;
  } catch (e) {
    console.error('Failed to parse parameters:', e);
    return <div style={{ padding: '20px', color: 'red' }}>Invalid parameters</div>;
  }

  useEffect(() => {
    if (!url) {
      setError("No custom component URL provided.");
      setLoading(false);
      return;
    }

    console.log('Loading custom component from:', url);

    // Clear any existing component
    window.MizanDynamicComponent = undefined;

    // Create script element
    const script = document.createElement('script');
    script.src = `/api/esm/displaytv?url=${encodeURIComponent(url)}`;
    script.async = true;

    // Handle script load success
    script.onload = () => {
      console.log('Script loaded successfully');
      
      // Give a small delay for the script to execute
      setTimeout(() => {
        const Comp = window.MizanDynamicComponent;
        console.log('Component loaded:', Comp);
        
        if (Comp && typeof Comp === 'function') {
          setComponent(() => Comp);
          setError(null);
        } else {
          setError('Component failed to load or is not a valid React component.');
        }
        setLoading(false);
        
        // Clean up
        window.MizanDynamicComponent = undefined;
      }, 100);
    };

    // Handle script load error
    script.onerror = () => {
      console.error('Failed to load script');
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
  if (error) {
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
        <div style={{ height: '100vh', width: '100%' }}>
          <Component slide={slide} masjid={masjid} />
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