'use client';

import React, { lazy, Suspense, useMemo, Component, ReactNode } from 'react';

/**
 * Creates a URL to our local API proxy for fetching the remote component.
 * A cache key can be added to ensure React re-fetches when desired.
 */
const createProxyUrl = (githubUrl: string, cacheKey?: string | number): string | null => {
  if (!githubUrl) return null;
  try {
    // Basic validation to ensure it's a plausible URL.
    new URL(githubUrl); 
    const apiUrl = `/api/esm?url=${encodeURIComponent(githubUrl)}`;
    // The cacheKey forces React to re-evaluate the dynamic import.
    return cacheKey ? `${apiUrl}&v=${cacheKey}` : apiUrl;
  } catch (e) {
    console.error('Invalid URL provided:', e);
    return null;
  }
};

interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

// A standard React Error Boundary to catch errors from the remote component
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    console.error("Error loading remote component:", error);
    return { hasError: true, error: error };
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (prevProps.children !== this.props.children) {
      this.setState({ hasError: false, error: undefined });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const ErrorFallback = ({ githubUrl }: { githubUrl: string }) => (
    <div style={{ padding: '20px', color: '#c0392b', backgroundColor: '#fbe9e7', border: '1px solid #e74c3c', borderRadius: '8px', fontFamily: 'sans-serif' }}>
        <strong style={{ fontSize: '16px' }}>Error Loading Custom Component</strong>
        
        <p style={{ marginTop: '16px', padding: '12px', backgroundColor: 'rgba(255,255,255,0.7)', border: '1px solid #f5c6cb', borderRadius: '4px', fontSize: '13px', fontFamily: 'monospace', wordBreak: 'break-all' }}>
            <strong>URL:</strong> {githubUrl}
        </p>

        <div style={{ marginTop: '16px', fontSize: '13px' }}>
            <p><strong>Common Causes:</strong></p>
            <ul style={{ margin: '8px 0 0 20px', padding: 0, listStyleType: 'disc', lineHeight: '1.6' }}>
                <li>The GitHub repository is private. It **must be public**.</li>
                <li>The component file is missing a `default export`.</li>
                <li>The component has syntax errors. Check the browser's developer console for more details.</li>
            </ul>
        </div>
    </div>
);

const LoadingFallback = () => (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <p>Loading Custom Component...</p>
    </div>
);

export default function CustomComponentLoader({ url, componentProps, cacheKey }: { url: string; componentProps: any, cacheKey?: string | number }) {
  const proxyUrl = useMemo(() => {
    return createProxyUrl(url, cacheKey);
  }, [url, cacheKey]);

  if (!proxyUrl) {
    return <ErrorFallback githubUrl={url} />;
  }

  // The component is created only when proxyUrl is valid.
  const RemoteComponent = useMemo(() => 
    // The webpackIgnore comment is crucial to prevent Webpack from trying
    // to bundle the remote URL at build time.
    lazy(() => import(/* webpackIgnore: true */ proxyUrl))
  , [proxyUrl]);

  return (
    <ErrorBoundary fallback={<ErrorFallback githubUrl={url} />}>
      <Suspense fallback={<LoadingFallback />}>
        <RemoteComponent {...componentProps} />
      </Suspense>
    </ErrorBoundary>
  );
} 