'use client';

import React, { useEffect, useRef } from 'react';

/**
 * Loads a custom slide using an iframe, similar to how CustomSlide uses WebView in React Native.
 * Passes slide, masjid, and theme as query parameters for the custom component to access.
 */
export default function CustomComponentLoader({ url, componentProps, cacheKey }: { url: any; componentProps: any, cacheKey?: string | number }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const params = new URLSearchParams();
  if (componentProps?.slide) params.append('slide', encodeURIComponent(JSON.stringify(componentProps.slide)));
  if (componentProps?.masjid) params.append('masjid', encodeURIComponent(JSON.stringify(componentProps.masjid)));
  if (componentProps?.theme) params.append('theme', encodeURIComponent(JSON.stringify(componentProps.theme)));
  if (url) params.append('url', encodeURIComponent(url));
  if (cacheKey) params.append('v', String(cacheKey));

  const iframeUrl = `/view-component?${params.toString()}`;

  useEffect(() => {
    const iframe = iframeRef.current;
    const injectScript = () => {
      if (!iframe?.contentWindow) return;
  
      const json = JSON.stringify({
        slide: JSON.stringify(componentProps.slide),
        masjid: JSON.stringify(componentProps.masjid),
        theme: JSON.stringify(componentProps.theme),
        url: JSON.stringify(url)
      })
  
      iframe.contentWindow.postMessage({ type: 'injectScript', json: JSON.stringify(json) }, '*');
    };
  
    iframe?.addEventListener('load', injectScript);
    return () => iframe?.removeEventListener('load', injectScript);
  }, [iframeUrl]);
  

  return (
    <iframe
      src={iframeUrl}
      style={{ width: '100%', height: '100%', border: 'none', background: 'transparent' }}
      allowFullScreen
      sandbox="allow-scripts allow-same-origin"
      title="Custom Slide"
    />
  );
} 