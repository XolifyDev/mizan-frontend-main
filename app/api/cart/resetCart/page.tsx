'use client';

import React, { useEffect } from 'react'
import useCart from '@/lib/useCart';
import { useRouter } from 'next/navigation';

const Page = () => {
  const { clearCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    clearCart();
    router.push("/dashboard");
  }, [])
  return null; 
}

export default Page
