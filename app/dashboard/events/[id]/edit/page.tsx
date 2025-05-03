"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { CreateEventForm } from "@/components/dashboard/create-event-form"
import { getEvents, getEventsById } from "@/lib/actions/events"

type Event = {
  id: string;
  title: string;
  date: Date;
  timeStart: Date;
  timeEnd: Date;
  location: string;
  description: string;
  type: string;
  tagColor: string;
  masjidId: string;
  createdAt: Date;
  updatedAt: Date;
};

export default function EditEventPage() {
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const masjidId = new URLSearchParams(window.location.search).get("masjidId") || ""
  const params = useParams()

  useEffect(() => {
    const fetchEvent = async () => {
      if(!params.id) return;
      const event = await getEventsById(params.id as string || "")
      if (event) {
        setEvent(event)
      }
    }
    fetchEvent()
  }, [masjidId, params])

  if (!event) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          {/* TODO: Add the loading spinner I use in the dashboard page / all over the app */}
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 rounded-full border-y border-[#550C18] animate-spin"></div>
          </div>
          <p className="text-[#3A3A3A]/70">Please wait while we load the event details.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#550C18]">Edit Event</h2>
          <p className="text-[#3A3A3A]/70">
            Update the details of your event below
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
          masjidId={masjidId}
          initialData={event}
          isEditMode={true}
        />
      </div>
    </div>
  )
} 