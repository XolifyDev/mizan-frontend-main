import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import { Philosopher } from "next/font/google";
import { authClient } from "@/lib/auth-client";

const philosopher = Philosopher({ weight: "700", subsets: ["latin"] });

const Navbar = () => {
  return (
    <header className="border-b border-[#550C18]/10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2">
            <Image src="mizan.svg" width={35} height={35} alt="Mizan Logo" />
            <h1
              className={`md:text-4xl md:block hidden font-bold text-[#550C18] my-0 ${philosopher.className}`}
            >
              Mizan
            </h1>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="#features"
            className="text-[#3A3A3A] hover:text-[#550C18] font-medium transition-colors"
          >
            Features
          </Link>
          <Link
            href="#products"
            className="text-[#3A3A3A] hover:text-[#550C18] font-medium transition-colors"
          >
            Products
          </Link>
          <Link
            href="#pricing"
            className="text-[#3A3A3A] hover:text-[#550C18] font-medium transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="#contact"
            className="text-[#3A3A3A] hover:text-[#550C18] font-medium transition-colors"
          >
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
            <Button className="bg-[#550C18] hover:bg-[#78001A] text-white">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
