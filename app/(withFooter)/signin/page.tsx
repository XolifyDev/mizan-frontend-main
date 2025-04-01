import Link from "next/link"
import type { Metadata } from "next"
import SignInForm from "@/components/signin/form"
import Navbar from "@/components/Navbar"

export const metadata: Metadata = {
  title: "Sign In | Mizan",
  description: "Sign in to your Mizan account",
}

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
     <Navbar /> 


      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#550C18]">Welcome back</h2>
            <p className="text-[#3A3A3A] mt-2">Sign in to your Mizan account</p>
          </div>

          <div className="bg-white p-8 rounded-xl border border-[#550C18]/40 shadow-lg">
            <SignInForm />
          </div>

          <div className="text-center mt-6">
            <p className="text-[#3A3A3A]">
              Don't have an account?{" "}
              <Link href="/signup" className="text-[#550C18] font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#550C18]/10 py-6 px-6 text-center text-[#3A3A3A]/70 text-sm">
        <p>© 2025 Mizan. All rights reserved.</p>
      </footer>
    </div>
  )
}

