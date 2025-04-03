import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: "Checkout | Mizan",
  description: "Complete your purchase of Mizan products",
}
const Layout = ({ children }: { children: React.ReactNode }) => {
  return children
}

export default Layout
