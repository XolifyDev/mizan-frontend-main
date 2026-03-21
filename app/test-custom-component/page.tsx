"use client";

import React, { useEffect, useState } from 'react';

declare global {
  interface Window {
    MizanDynamicComponent?: any;
  }
}

export default function TestCustomComponentPage() {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Test data
  const testSlide = {
    id: 'test-slide-1',
    type: 'custom',
    content: {
      title: 'Test Slide',
      subtitle: 'This is a test',
      data: { message: 'Hello from test slide!' }
    }
  };

  const testMasjid = {
    id: 'test-masjid-1',
    name: 'Test Masjid',
    logo: 'https://example.com/logo.png'
  };

  const testTheme = {
    background: '#550C18',
    text: '#FFFFFF',
    primary: '#78001A',
    accent: '#a32624',
    font: 'Arial, sans-serif'
  };

  useEffect(() => {
    console.log('Loading test component...');

    // Clear any existing component
    window.MizanDynamicComponent = undefined;

    // Create script element
    const script = document.createElement('script');
    script.src = '/TestCustomComponent.tsx';
    script.async = true;

    // Handle script load success
    script.onload = () => {
      console.log('Test script loaded successfully');
      
      // Give a small delay for the script to execute
      setTimeout(() => {
        const Comp = window.MizanDynamicComponent;
        console.log('Test component loaded:', Comp);
        
        if (Comp && typeof Comp === 'function') {
          setComponent(() => Comp);
          setError(null);
        } else {
          setError('Test component failed to load or is not a valid React component.');
        }
        setLoading(false);
        
        // Clean up
        window.MizanDynamicComponent = undefined;
      }, 100);
    };

    // Handle script load error
    script.onerror = () => {
      console.error('Failed to load test script');
      setError('Failed to load test component script.');
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
  }, []);

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
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>Loading test component...</div>
          <div style={{ fontSize: '14px', opacity: 0.7 }}>/TestCustomComponent.tsx</div>
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
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>Test Component Error</div>
          <div style={{ fontSize: '16px', marginBottom: '20px' }}>{error}</div>
          <div style={{ fontSize: '14px', opacity: 0.8 }}>
            URL: /TestCustomComponent.tsx<br/>
            Slide ID: {testSlide.id}<br/>
            Masjid: {testMasjid.name}
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
          <Component slide={testSlide} masjid={testMasjid} theme={testTheme} />
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
      <div>No test component available</div>
    </div>
  );
} 