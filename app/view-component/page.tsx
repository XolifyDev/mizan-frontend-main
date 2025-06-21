'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const ComponentViewer = () => {
    const searchParams = useSearchParams();
    const slideParam = searchParams.get('slide');
    const masjidParam = searchParams.get('masjid');

    if (!slideParam) {
        return <div style={{ padding: '20px', color: 'red' }}>Error: No slide data provided.</div>;
    }

    try {
        const slide = JSON.parse(slideParam);
        const masjid = masjidParam ? JSON.parse(masjidParam) : undefined;

        if (!slide.customComponentUrl) {
            return <div style={{ padding: '20px', color: 'red' }}>Error: No component URL in slide data.</div>;
        }

        const DynamicComponent = React.lazy(() => 
            import(
                /* webpackIgnore: true */
                `/api/esm?url=${encodeURIComponent(slide.customComponentUrl)}`
            )
        );

        const props = {
            slide,
            masjid,
            theme: slide.theme,
            slides: [],
        };

        return (
            <Suspense fallback={null}>
                <DynamicComponent {...props} />
            </Suspense>
        );
    } catch(e) {
        console.error("Failed to parse props or load component", e);
        return <div style={{ padding: '20px', color: 'red' }}>Error: Failed to load component. Invalid data provided.</div>;
    }
};

const Page = () => {
    return (
        <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
            <Suspense fallback={null}>
                <ComponentViewer />
            </Suspense>
        </div>
    );
};

export default Page; 