import Link from 'next/link'
import React from 'react'
import { Button } from './ui/button'

const Navbar = () => {
  return (
    <header className="border-b border-[#550C18]/10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-[#550C18] flex items-center justify-center">
            <span className="text-[#FDF0D5] font-bold text-xl">M</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#550C18] my-0">Mizan</h1>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-[#3A3A3A] hover:text-[#550C18] font-medium transition-colors">
            Features
          </Link>
          <Link href="#products" className="text-[#3A3A3A] hover:text-[#550C18] font-medium transition-colors">
            Products
          </Link>
          <Link href="#pricing" className="text-[#3A3A3A] hover:text-[#550C18] font-medium transition-colors">
            Pricing
          </Link>
          <Link href="#contact" className="text-[#3A3A3A] hover:text-[#550C18] font-medium transition-colors">
            Contact
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/signin" className="hidden md:block">
            <Button
              variant="outline"
              className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5 hover:text-[#550C18]"
            >
              Sign In
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button className="bg-[#550C18] hover:bg-[#78001A] text-white">Get Started</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Navbar
