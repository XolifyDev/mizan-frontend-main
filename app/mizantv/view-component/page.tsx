"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

declare global {
  interface Window {
    MizanDynamicComponent?: any;
  }
}

export default function MizanTVViewComponentPage() {
  const searchParams = useSearchParams();
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    url = urlParam ? decodeURIComponent(urlParam) : null;
  } catch (e) {
    return <div>Invalid parameters</div>;
  }

  useEffect(() => {
    if (!url) {
      setError('No custom component URL provided.');
      return;
    }

    fetch(`/api/esm/displaytv?url=${encodeURIComponent(url)}`)
      .then(res => res.text())
      .then(code => {
        const patchedCode = code
        .replace(/export\s+default/g, '')
        .replace(/export\s+\{[^}]*\};?/g, '')
        + '\nwindow.MizanDynamicComponent = typeof MizanDynamicComponent === "function" ? MizanDynamicComponent : (typeof MizanDynamicComponent === "object" && MizanDynamicComponent.default ? MizanDynamicComponent.default : null);';
        
        const script = document.createElement('script');
        script.text = patchedCode;
        console.log(typeof window.MizanDynamicComponent, new Date().toISOString(), url);
        
        // Poll for the global variable
        let tries = 0;
        const maxTries = 50; // 5 seconds at 100ms interval
        const poll = () => {
          let Comp = window.MizanDynamicComponent;
          if (Comp && typeof Comp !== 'function' && typeof Comp?.default === 'function') {
            Comp = Comp.default;
          }
          if (typeof Comp === 'function') {
            setComponent(() => Comp as any);
            if (document.body.contains(script)) {
              document.body.removeChild(script);
            }
            window.MizanDynamicComponent = undefined;
          } else if (tries < maxTries) {
            tries++;
            setTimeout(poll, 100);
          } else {
            setError('Failed to load component.');
            if (document.body.contains(script)) {
              document.body.removeChild(script);
            }
            window.MizanDynamicComponent = undefined;
          }
        };
        poll();
      })
      .catch(err => {
        if(err instanceof Error) {
          setError('Failed to fetch component: ' + err.message)
        } else {
          setError(null);
        }
      });
  }, [url]);

  if (error) return <div>Error: {error}</div>;
  if (!Component) return <div>Loading custom component...</div>;

  return (
    <>
      <style>{`
        html, body, #__next {
          height: 99%;
          margin: 0;
          padding: 0;
          background: transparent;
        }
        body {
          overflow: hidden;
        }
      `}</style>
      <div style={{ height: '100vh', width: '100%' }}>
        {Component && (React.createElement(Component as any, { slide, masjid, theme }))}
      </div>
    </>
  );
}