// components/dashboard/NProgressLoader.tsx
'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import NProgress from 'nprogress';

export default function NProgressLoader() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    NProgress.configure({ showSpinner: false, trickleSpeed: 100 });

    const handleStart = () => NProgress.start();
    const handleDone = () => NProgress.done();

    router.events?.on('routeChangeStart', handleStart);
    router.events?.on('routeChangeComplete', handleDone);
    router.events?.on('routeChangeError', handleDone);

    // Fallback for Next.js app router (app directory)
    handleDone();

    return () => {
      router.events?.off('routeChangeStart', handleStart);
      router.events?.off('routeChangeComplete', handleDone);
      router.events?.off('routeChangeError', handleDone);
    };
  }, [router, pathname]);

  return null;
}