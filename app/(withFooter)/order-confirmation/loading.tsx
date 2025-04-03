import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center">
        <Loader2 className="h-12 w-12 text-[#550C18] animate-spin mb-4" />
        <p className="text-[#3A3A3A]">Loading order information...</p>
      </div>
    </div>
  )
}
