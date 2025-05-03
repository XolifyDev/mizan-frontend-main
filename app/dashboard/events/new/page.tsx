"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { CreateEventForm } from "@/components/dashboard/create-event-form"

export default function NewEventPage() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#550C18]">Create New Event</h2>
          <p className="text-[#3A3A3A]/70">
            Fill in the details below to create a new event for your masjid
          </p>
        </div>
        <Button
          variant="outline"
          size="md"
          onClick={() => router.back()}
          className="mt-auto mb-auto"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-[#550C18]/10 p-6 px-20">
        <CreateEventForm
          isOpen={true}
          onClose={() => router.back()}
          onSuccess={() => router.push("/dashboard/events")}
          masjidId={new URLSearchParams(window.location.search).get("masjidId") || ""}
        />
      </div>
    </div>
  )
} 