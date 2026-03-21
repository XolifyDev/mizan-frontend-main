import Link from "next/link"
import type { Metadata } from "next"
import ForgotPasswordForm from "@/components/forgot-password/form"
import Navbar from "@/components/Navbar"

export const metadata: Metadata = {
  title: "Forgot Password | Mizan",
  description: "Reset your Mizan account password",
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
     <Navbar /> 

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#550C18]">Forgot Password</h2>
            <p className="text-[#3A3A3A] mt-2">Enter your email to reset your password</p>
          </div>

          <div className="bg-white p-8 rounded-xl border border-[#550C18]/10 shadow-lg">
            <ForgotPasswordForm />
          </div>

          <div className="text-center mt-6">
            <p className="text-[#3A3A3A]">
              Remember your password?{" "}
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

