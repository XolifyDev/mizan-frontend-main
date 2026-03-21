'use client';

import React, { useEffect, useState } from 'react';

declare global {
  interface Window {
    MizanDynamicComponent?: any;
  }
}

/**
 * Loads a custom slide using a simplified approach.
 * Passes slide, masjid, and theme as props for the custom component to access.
 */
export default function CustomComponentLoader({ url, componentProps, cacheKey }: { url: any; componentProps: any, cacheKey?: string | number }) {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!url) {
      setError('No custom component URL provided.');
      setLoading(false);
      return;
    }

    console.log('Loading custom component from:', url);

    // Clear any existing component
    window.MizanDynamicComponent = undefined;

    // Create script element
    const script = document.createElement('script');
    script.src = `/api/esm/displaytv?url=${encodeURIComponent(url)}${cacheKey ? `&v=${cacheKey}` : ''}`;
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
  }, [url, cacheKey]);

  // Show loading state
  if (loading) {
    return (
      <div style={{ 
        height: '100%', 
        width: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        color: '#666',
        border: '2px dashed #ccc',
        borderRadius: '8px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px', marginBottom: '8px' }}>
            <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-gray-400 rounded-full" role="status" aria-label="loading">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div style={{ 
        height: '100%', 
        width: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#ffebee',
        color: '#c62828',
        border: '2px dashed #ef5350',
        borderRadius: '8px',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div>
          <div style={{ fontSize: '16px', marginBottom: '8px' }}>Component Error</div>
          <div style={{ fontSize: '14px', marginBottom: '12px' }}>{error}</div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>
            URL: {url}
          </div>
        </div>
      </div>
    );
  }

  // Render the component
  if (Component) {
    return (
      <div className="w-full h-full flex flex-col flex-1">
        <Component {...componentProps} />
      </div>
    );
  }

  // Fallback
  return (
    <div style={{ 
      height: '100%', 
      width: '100%', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      color: '#666',
      border: '2px dashed #ccc',
      borderRadius: '8px'
    }}>
      <div>No component available</div>
    </div>
  );
} 