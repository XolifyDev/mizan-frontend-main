import Link from "next/link"
import type { Metadata } from "next"
import SignUpForm from "@/components/signup/form"
import Navbar from "@/components/Navbar"

export const metadata: Metadata = {
  title: "Sign Up | Mizan",
  description: "Create a new Mizan account",
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
     <Navbar /> 

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold text-[#550C18]">Create an account</h2>
            <p className="text-[#3A3A3A]">Sign up for Mizan to get started</p>
          </div>

          <div className="bg-white p-8 rounded-xl border border-[#550C18]/10 shadow-lg">
            <SignUpForm />
          </div>

          <div className="text-center mt-6">
            <p className="text-[#3A3A3A]">
              Already have an account?{" "}
              <Link href="/signin" className="text-[#550C18] font-medium hover:underline">
                Sign in
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

