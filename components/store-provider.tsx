"use client";

import React, { useEffect, useState } from 'react'
import useCartStore from '../lib/useCartStore'
import { Loader2 } from 'lucide-react';

const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [hasHydrated, setHasHydrated] = useState(false)
  const hydrated = useCartStore.persist.hasHydrated()

  useEffect(() => {
    if (hydrated) {
      setTimeout(() => {
        setHasHydrated(true)
      }, 500)
    }
  }, [hydrated])

  useEffect(() => {
    useCartStore.persist.rehydrate()
  }, [])
  
  if (!hasHydrated) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center">
        <div className="h-12 w-12 rounded-full border-y border-[#550C18] animate-spin"></div>
      </div>
    </div>
  );

  return children;
}

export default StoreProvider
